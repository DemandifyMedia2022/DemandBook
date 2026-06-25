import { Router } from 'express';
import { create, list, recordPayment } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all bill endpoints

router.get('/list', list);
router.post('/create', create);
router.post('/pay', recordPayment);

export default router;
