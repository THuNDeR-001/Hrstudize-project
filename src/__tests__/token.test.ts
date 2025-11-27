import { TokenService } from '../utils/token';

describe('TokenService', () => {
  describe('generateOTP', () => {
    it('should generate 6 digit OTP', () => {
      const otp = TokenService.generateOTP(6);
      expect(otp).toHaveLength(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = TokenService.generateOTP(6);
      const otp2 = TokenService.generateOTP(6);
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate secure random token', () => {
      const token = TokenService.generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });
  });

  describe('hashToken', () => {
    it('should hash token consistently', () => {
      const token = 'test-token';
      const hash1 = TokenService.hashToken(token);
      const hash2 = TokenService.hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = TokenService.hashToken('token1');
      const hash2 = TokenService.hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('JWT tokens', () => {
    it('should generate and verify access token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const token = TokenService.generateAccessToken(userId, email);
      const payload = TokenService.verifyAccessToken(token);

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.type).toBe('access');
    });

    it('should generate and verify refresh token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const token = TokenService.generateRefreshToken(userId, email);
      const payload = TokenService.verifyRefreshToken(token);

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.type).toBe('refresh');
    });

    it('should reject access token as refresh token', () => {
      const token = TokenService.generateAccessToken('user-id', 'test@example.com');
      
      expect(() => {
        TokenService.verifyRefreshToken(token);
      }).toThrow();
    });

    it('should reject invalid token', () => {
      expect(() => {
        TokenService.verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });
});
