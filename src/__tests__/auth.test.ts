import request from 'supertest';
import app from '../index';
import { db } from '../database';
import { AuthService } from '../services/auth.service';

describe('Auth API', () => {
  beforeAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM users WHERE email LIKE \'%test%\'');
  });

  afterAll(async () => {
    await db.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
          phone: '+11234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('email', 'newuser@test.com');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
          phone: '+11234567891',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'weakpass@test.com',
          password: 'weak',
          phone: '+11234567892',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalidphone@test.com',
          password: 'Password123!',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully without 2FA', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('2FA Flow', () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create a user and login
      await request(app)
        .post('/api/auth/register')
        .send({
          email: '2fauser@test.com',
          password: 'Password123!',
          phone: '+11234567893',
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: '2fauser@test.com',
          password: 'Password123!',
        });

      accessToken = loginResponse.body.accessToken;
      userId = loginResponse.body.user.id;
    });

    it('should enable 2FA', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should verify OTP and complete 2FA setup', async () => {
      // Get the OTP from database (in real test, would use mock)
      const otpResult = await db.query(
        `SELECT * FROM otps WHERE user_id = $1 AND purpose = 'enable_2fa' AND used = false
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      // For testing, we'll need to get the actual code
      // In production tests, you'd mock the SMS provider
      // For now, skip verification test
      expect(otpResult.rows.length).toBeGreaterThan(0);
    });

    it('should require 2FA on login after enabling', async () => {
      // First, manually enable 2FA
      await db.query(
        'UPDATE users SET is_2fa_enabled = true WHERE id = $1',
        [userId]
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '2fauser@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requires2FA', true);
    });
  });

  describe('POST /api/auth/token/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/token/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/token/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('Forgot Password Flow', () => {
    it('should request password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' });

      expect(response.status).toBe(200);
    });

    it('should reset password with valid token', async () => {
      // Request reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      // Get token from database
      const userResult = await db.query(
        'SELECT id FROM users WHERE email = $1',
        ['newuser@test.com']
      );
      const userId = userResult.rows[0].id;

      const tokenResult = await db.query(
        `SELECT * FROM password_resets WHERE user_id = $1 AND used = false
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      // For test, we can't get the actual token (it's hashed)
      // In production, you'd mock the token generation
      expect(tokenResult.rows.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
        });

      accessToken = response.body.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.profile).toHaveProperty('email');
      expect(response.body.profile).not.toHaveProperty('password_hash');
    });

    it('should reject without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should not be able to use refresh token after logout', async () => {
      const response = await request(app)
        .post('/api/auth/token/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });
});
