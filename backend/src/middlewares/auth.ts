import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_private_jwt_secret_key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
    avatar: string | null;
  };
  admin?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect 'Bearer TOKEN'

    if (!token) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true
      });
    }

    // Verify access token
    let verified: any;
    try {
      verified = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true
      });
    }

    if (!verified || !verified.id) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true
      });
    }

    // Query database for active user profile
    const userRes = await query(
      'SELECT id, name, email, role, avatar, is_active FROM users WHERE id = $1',
      [verified.id]
    );

    const user = userRes.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User does not exist, authorization denied.',
        jwtExpired: true
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Your account is disabled, contact your administrator.'
      });
    }

    // Attach to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    req.admin = req.user; // Backwards compatibility for Express endpoints

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      jwtExpired: true
    });
  }
};

/**
 * RBAC Permission Middleware - role-based access control checking
 */
export const requireRole = (allowedRoles: ('SUPER_ADMIN' | 'ADMIN')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
