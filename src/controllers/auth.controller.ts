import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, phone } = req.body;
      
      const user = await AuthService.register(email, password, phone);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;

      const result = await AuthService.login(email, password, ipAddress);

      if (result.requires2FA) {
        res.json({
          message: '2FA verification required. OTP sent to your phone.',
          requires2FA: true,
          userId: result.user.id,
        });
      } else {
        res.json({
          message: 'Login successful',
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user.id,
            email: result.user.email,
            is2FAEnabled: result.user.is_2fa_enabled,
          },
        });
      }
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Enable 2FA
   */
  static async enable2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await AuthService.enable2FA(req.user.userId);

      res.json({
        message: 'OTP sent to your phone. Verify to complete 2FA setup.',
      });
    } catch (error: any) {
      logger.error('Enable 2FA error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { otp } = req.body;
      const { userId, purpose } = req.query;

      if (!userId || !purpose) {
        res.status(400).json({ error: 'userId and purpose are required' });
        return;
      }

      if (purpose !== 'login_2fa' && purpose !== 'enable_2fa') {
        res.status(400).json({ error: 'Invalid purpose' });
        return;
      }

      const result = await AuthService.verifyOTP(
        userId as string,
        otp,
        purpose as 'login_2fa' | 'enable_2fa'
      );

      if (purpose === 'enable_2fa') {
        res.json({
          message: '2FA enabled successfully',
        });
      } else {
        res.json({
          message: 'Login successful',
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      }
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const accessToken = await AuthService.refreshAccessToken(refreshToken);

      res.json({
        accessToken,
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      await AuthService.logout(refreshToken);

      res.json({
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await AuthService.requestPasswordReset(email);

      res.json({
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.json({
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await AuthService.getProfile(req.user.userId);

      res.json({ profile });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
