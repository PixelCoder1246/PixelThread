const { Router } = require('express');
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const {
  authLimiter,
  registerLimiter,
} = require('../../middleware/rateLimiter');

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
