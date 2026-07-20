const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    logger.warn('Email not sent — SMTP not configured', { to, subject });
    return;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from:
        process.env.EMAIL_FROM || `"PixelThread" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject });
  } catch (err) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: err.message,
      code: err.code,
    });
  }
};

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: 'Verify your PixelThread account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6c47ff">Welcome to PixelThread</h2>
        <p>Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#6c47ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: 'Reset your PixelThread password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6c47ff">Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#6c47ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendEmailChangeVerification = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/settings/email/verify?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: 'Verify your new email address — PixelThread',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6c47ff">Confirm Email Change</h2>
        <p>Click the button below to verify your new email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#6c47ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Verify New Email
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this change, please secure your account immediately.</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification,
};
