const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.verify();
  console.log('SMTP Working...');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your PixelThread account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6c47ff">Welcome to PixelThread 🎉</h2>
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
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
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

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
