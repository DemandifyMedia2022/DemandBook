import { Router } from 'express';
import { login, logout, refresh, forgotPassword, resetPassword, me, register, verifyEmail } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/me', authMiddleware, me);

export default router;
