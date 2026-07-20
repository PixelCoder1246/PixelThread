const { sendSuccess } = require('../../utils/ApiResponse');
const authService = require('./auth.service');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, rawVerificationToken } = await authService.registerUser({
      name,
      email,
      password,
    });

    return sendSuccess(
      res,
      201,
      'Registration successful. Please verify your email.',
      {
        user: authService.sanitizeUser(user),
      }
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, 200, 'Login successful.', {
      user: authService.sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken);

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Current user fetched.', { user: req.user });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshUserSession(
        token,
        req.ip,
        req.headers['user-agent']
      );

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, 200, 'Token refreshed.');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);

    return sendSuccess(
      res,
      200,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    return sendSuccess(
      res,
      200,
      'Password reset successfully. Please log in with your new password.'
    );
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);

    return sendSuccess(
      res,
      200,
      'Email verified successfully. You can now log in.'
    );
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendVerification(email);

    return sendSuccess(
      res,
      200,
      'If your account exists and is unverified, a new verification email has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
