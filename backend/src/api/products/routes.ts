import { Router } from 'express';
import { create, list } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all product endpoints

router.get('/list', list);
router.post('/create', create);

export default router;
