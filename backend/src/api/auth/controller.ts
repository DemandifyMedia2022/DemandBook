import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, pool } from '../../db';
import { AuthRequest } from '../../middlewares/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your_private_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_private_jwt_refresh_secret_key';

// Helper to parse cookies from headers
const getCookie = (req: Request, name: string): string | undefined => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';').map(c => {
    const parts = c.trim().split('=');
    return [parts[0], parts.slice(1).join('=')];
  });
  const match = cookies.find(c => c[0] === name);
  return match ? decodeURIComponent(match[1]) : undefined;
};

/**
 * Audit Logger Helper
 */
const logAudit = async (userId: number | null, email: string, action: string, ip: string, status: 'SUCCESS' | 'FAILED') => {
  console.log(`[AUDIT LOG] [${new Date().toISOString()}] UserID: ${userId || 'GUEST'}, Email: ${email}, Action: ${action}, IP: ${ip}, Status: ${status}`);
};

/**
 * Register User
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields (name, email, password, role) are required.' });
  }

  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Invalid role. Role must be SUPER_ADMIN or ADMIN.' });
  }

  try {
    // Check existing
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const insertRes = await query(
      `INSERT INTO users (name, email, role, password_hash, is_active, email_verified, verification_token)
       VALUES ($1, $2, $3, $4, true, false, $5)
       RETURNING id, name, email, role, created_at;`,
      [name, email.toLowerCase(), role, hashedPassword, verificationToken]
    );

    // Send the email asynchronously
    sendVerificationEmail(email.toLowerCase(), verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      result: insertRes.rows[0]
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Error creating user account.' });
  }
};

/**
 * Login User
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ success: false, result: null, message: 'Email and password are required.' });
  }

  try {
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = userRes.rows[0];

    if (!user) {
      await logAudit(null, email, 'LOGIN', ip, 'FAILED');
      return res.status(404).json({ success: false, result: null, message: 'No account with this email has been registered.' });
    }

    if (!user.is_active) {
      await logAudit(user.id, email, 'LOGIN', ip, 'FAILED');
      return res.status(403).json({ success: false, result: null, message: 'Account is disabled. Contact your administrator.' });
    }

    if (!user.email_verified) {
      await logAudit(user.id, email, 'LOGIN', ip, 'FAILED');
      return res.status(403).json({ success: false, result: null, message: 'Please verify your email address before logging in.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logAudit(user.id, email, 'LOGIN', ip, 'FAILED');
      return res.status(403).json({ success: false, result: null, message: 'Invalid credentials.' });
    }

    // Generate Tokens
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store Session in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await query(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Update Last Login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    await logAudit(user.id, email, 'LOGIN', ip, 'SUCCESS');

    // Set Refresh Token HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${encodeURIComponent(refreshToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      result: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: accessToken
      },
      message: 'Successfully logged in.'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Logout User
 */
export const logout = async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, 'refreshToken');

  try {
    if (refreshToken) {
      // Revoke/Delete session from DB
      await query('UPDATE sessions SET is_revoked = true WHERE token = $1', [refreshToken]);
    }

    // Clear HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      'refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );

    return res.status(200).json({
      success: true,
      result: {},
      message: 'Successfully logged out.'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refresh Tokens
 */
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, 'refreshToken');

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token not found.' });
  }

  try {
    // Check if session exists in DB and is active/valid
    const sessionRes = await query(
      'SELECT * FROM sessions WHERE token = $1 AND is_revoked = false AND expires_at > NOW()',
      [refreshToken]
    );
    const session = sessionRes.rows[0];

    if (!session) {
      return res.status(403).json({ success: false, message: 'Session revoked or expired.' });
    }

    // Verify token signature
    const verified: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    if (!verified || verified.id !== session.user_id) {
      return res.status(403).json({ success: false, message: 'Invalid token verification.' });
    }

    // Fetch active user
    const userRes = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [session.user_id]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(403).json({ success: false, message: 'User disabled or not found.' });
    }

    // Rotate/Generate New Tokens
    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Update session table (revoke old token, insert new one)
    await query('UPDATE sessions SET is_revoked = true WHERE id = $1', [session.id]);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, newRefreshToken, expiresAt]
    );

    // Set new Cookie
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${encodeURIComponent(newRefreshToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      result: {
        token: newAccessToken
      },
      message: 'Tokens refreshed successfully.'
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(403).json({ success: false, message: 'Token refresh failed.' });
  }
};

/**
 * Forgot Password (Request Code)
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  try {
    const userRes = await query('SELECT id FROM users WHERE email = $1 AND is_active = true', [email.toLowerCase()]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email matches an active account, a password reset link will be sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    // Send the email asynchronously
    sendPasswordResetEmail(email.toLowerCase(), resetToken).catch(err => {
      console.error('Failed to send reset email:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'If the email matches an active account, a password reset link will be sent.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
  }

  try {
    // Find user by token and check expiration
    const userRes = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    const user = userRes.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required.' });
  }

  try {
    const updateRes = await query(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [token]
    );

    if (updateRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification token.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Me Profile
 */
export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  return res.status(200).json({
    success: true,
    user: req.user
  });
};
