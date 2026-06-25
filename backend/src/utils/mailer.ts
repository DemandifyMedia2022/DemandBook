import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtppro.zoho.in',
  port: Number(process.env.MAIL_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"DemandERP Support" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: 'Verify your DemandERP Account',
    html: `
      <h2>Welcome to DemandERP!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you did not create an account, no further action is required.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"DemandERP Support" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: 'Reset your DemandERP Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. You can do this by clicking the link below:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
