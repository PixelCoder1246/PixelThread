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

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
