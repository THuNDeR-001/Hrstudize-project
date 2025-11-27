import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class TokenService {
  /**
   * Generate access token
   */
  static generateAccessToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'access',
    };

    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a token using SHA256
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate OTP code
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
  }
}
