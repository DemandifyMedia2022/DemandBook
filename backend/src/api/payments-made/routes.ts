import { Router } from 'express';
import { create, list, deletePayment } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.delete('/:id', deletePayment);

export default router;
