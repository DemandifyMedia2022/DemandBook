import { Router } from 'express';
import { list } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all admin endpoints

router.get('/list', list);

export default router;
