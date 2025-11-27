import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 1000, // Increased for testing
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for testing
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
