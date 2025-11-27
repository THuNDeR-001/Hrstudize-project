import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { strictAuthLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation';

const router = Router();

// Public routes
router.post(
  '/register',
  strictAuthLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  strictAuthLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post(
  '/2fa/verify',
  strictAuthLimiter,
  validate(otpVerifySchema),
  AuthController.verifyOTP
);

router.post(
  '/token/refresh',
  validate(refreshTokenSchema),
  AuthController.refreshToken
);

router.post(
  '/logout',
  validate(refreshTokenSchema),
  AuthController.logout
);

router.post(
  '/forgot-password',
  strictAuthLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  strictAuthLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected routes
router.post(
  '/2fa/enable',
  authenticate,
  AuthController.enable2FA
);

router.get(
  '/profile',
  authenticate,
  AuthController.getProfile
);

export default router;
