import bcrypt from 'bcrypt';
import { db } from '../database';
import { User } from '../types';
import { TokenService } from '../utils/token';
import { smsProvider } from '../utils/sms';
import { logger } from '../utils/logger';
import { config } from '../config';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, phone: string): Promise<User> {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, phone)
       VALUES ($1, $2, $3)
       RETURNING id, email, phone, is_active, is_2fa_enabled, created_at, updated_at`,
      [email, passwordHash, phone]
    );

    const user = result.rows[0];
    
    // Log audit event
    await this.logAuditEvent(user.id, 'user_registered', true);

    logger.info(`User registered: ${email}`);
    return user;
  }

  /**
   * Login user
   */
  static async login(email: string, password: string, ipAddress?: string): Promise<{
    user: User;
    requires2FA: boolean;
    accessToken?: string;
    refreshToken?: string;
  }> {
    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      await this.logAuditEvent(undefined, 'login_failed', false, { email, reason: 'user_not_found' });
      throw new Error('Invalid credentials');
    }

    const user: User = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      await this.logAuditEvent(user.id, 'login_failed', false, { reason: 'account_inactive' });
      throw new Error('Account is inactive');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      await this.logAuditEvent(user.id, 'login_failed', false, { reason: 'invalid_password' });
      throw new Error('Invalid credentials');
    }

    // If 2FA is enabled, generate and send OTP
    if (user.is_2fa_enabled) {
      const otp = await this.generateOTP(user.id, 'login_2fa');
      await smsProvider.sendSMS(user.phone!, `Your login OTP is: ${otp}`);
      
      await this.logAuditEvent(user.id, 'login_2fa_required', true);
      
      return {
        user,
        requires2FA: true,
      };
    }

    // Generate tokens
    const accessToken = TokenService.generateAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id, user.email, ipAddress);

    await this.logAuditEvent(user.id, 'login_success', true);

    return {
      user,
      requires2FA: false,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    if (user.is_2fa_enabled) {
      throw new Error('2FA is already enabled');
    }

    if (!user.phone) {
      throw new Error('Phone number is required for 2FA');
    }

    // Generate and send OTP
    const otp = await this.generateOTP(userId, 'enable_2fa');
    await smsProvider.sendSMS(user.phone, `Your 2FA setup OTP is: ${otp}`);

    await this.logAuditEvent(userId, '2fa_enable_requested', true);
    logger.info(`2FA enable requested for user: ${userId}`);
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(
    userId: string,
    code: string,
    purpose: 'login_2fa' | 'enable_2fa'
  ): Promise<{ accessToken?: string; refreshToken?: string }> {
    // Find valid OTP
    const result = await db.query(
      `SELECT * FROM otps
       WHERE user_id = $1 AND purpose = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, purpose]
    );

    if (result.rows.length === 0) {
      await this.logAuditEvent(userId, 'otp_verify_failed', false, { reason: 'not_found_or_expired' });
      throw new Error('Invalid or expired OTP');
    }

    const otp = result.rows[0];

    // Check attempts
    if (otp.attempts >= config.otp.maxAttempts) {
      await this.logAuditEvent(userId, 'otp_verify_failed', false, { reason: 'max_attempts' });
      throw new Error('Maximum OTP attempts exceeded');
    }

    // Verify code
    const codeValid = await bcrypt.compare(code, otp.code_hash);
    
    if (!codeValid) {
      // Increment attempts
      await db.query(
        'UPDATE otps SET attempts = attempts + 1 WHERE id = $1',
        [otp.id]
      );
      await this.logAuditEvent(userId, 'otp_verify_failed', false, { reason: 'invalid_code' });
      throw new Error('Invalid OTP code');
    }

    // Mark OTP as used
    await db.query(
      'UPDATE otps SET used = true WHERE id = $1',
      [otp.id]
    );

    // Handle based on purpose
    if (purpose === 'enable_2fa') {
      await db.query(
        'UPDATE users SET is_2fa_enabled = true WHERE id = $1',
        [userId]
      );
      await this.logAuditEvent(userId, '2fa_enabled', true);
      logger.info(`2FA enabled for user: ${userId}`);
      return {};
    } else {
      // Generate tokens for login
      const user = await this.getUserById(userId);
      const accessToken = TokenService.generateAccessToken(user.id, user.email);
      const refreshToken = await this.createRefreshToken(user.id, user.email);
      
      await this.logAuditEvent(userId, 'login_success_with_2fa', true);
      
      return { accessToken, refreshToken };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = TokenService.verifyRefreshToken(refreshToken);
      const tokenHash = TokenService.hashToken(refreshToken);

      // Find refresh token in database
      const result = await db.query(
        `SELECT * FROM refresh_tokens
         WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new access token
      const accessToken = TokenService.generateAccessToken(payload.userId, payload.email);
      
      await this.logAuditEvent(payload.userId, 'token_refreshed', true);
      
      return accessToken;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string): Promise<void> {
    const tokenHash = TokenService.hashToken(refreshToken);
    
    await db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1',
      [tokenHash]
    );

    logger.info('User logged out');
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    const user: User = result.rows[0];

    // Generate reset token
    const resetToken = TokenService.generateSecureToken(32);
    const tokenHash = TokenService.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + config.passwordReset.expiryHours * 60 * 60 * 1000);

    // Store reset token
    await db.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // In production, send email with reset link
    // For demo, log the token
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    console.log(`\n==================== PASSWORD RESET ====================`);
    console.log(`Email: ${email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Expires at: ${expiresAt.toISOString()}`);
    console.log(`========================================================\n`);

    await this.logAuditEvent(user.id, 'password_reset_requested', true);
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = TokenService.hashToken(token);

    // Find valid reset token
    const result = await db.query(
      `SELECT * FROM password_resets
       WHERE token_hash = $1 AND used = false AND expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const resetRecord = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used
    await db.transaction(async (client) => {
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, resetRecord.user_id]
      );

      await client.query(
        'UPDATE password_resets SET used = true WHERE id = $1',
        [resetRecord.id]
      );

      // Revoke all refresh tokens for security
      await client.query(
        'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
        [resetRecord.user_id]
      );
    });

    await this.logAuditEvent(resetRecord.user_id, 'password_reset_completed', true);
    logger.info(`Password reset completed for user: ${resetRecord.user_id}`);
  }

  /**
   * Helper: Generate OTP
   */
  private static async generateOTP(userId: string, purpose: string): Promise<string> {
    const code = TokenService.generateOTP(6);
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    await db.query(
      `INSERT INTO otps (user_id, code_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, codeHash, purpose, expiresAt]
    );

    return code;
  }

  /**
   * Helper: Create refresh token
   */
  private static async createRefreshToken(
    userId: string,
    email: string,
    ipAddress?: string
  ): Promise<string> {
    const token = TokenService.generateRefreshToken(userId, email);
    const tokenHash = TokenService.hashToken(token);
    
    // Calculate expiry based on JWT expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, tokenHash, expiresAt, ipAddress]
    );

    return token;
  }

  /**
   * Helper: Get user by ID
   */
  private static async getUserById(userId: string): Promise<User> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Helper: Log audit event
   */
  private static async logAuditEvent(
    userId: string | undefined,
    eventType: string,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    await db.query(
      `INSERT INTO audit_logs (user_id, event_type, success, metadata)
       VALUES ($1, $2, $3, $4)`,
      [userId || null, eventType, success, metadata ? JSON.stringify(metadata) : null]
    );
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.getUserById(userId);
    const { password_hash, ...profile } = user;
    return profile;
  }
}
