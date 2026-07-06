import { Router } from 'express';
import {validate} from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiterMiddleware.js';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';
import {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';


const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, validate(forgotPasswordSchema), resendVerificationEmail);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;