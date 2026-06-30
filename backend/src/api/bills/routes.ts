import { Router } from 'express';
import { create, list, recordPayment, getDetails, update, deleteBill } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all bill endpoints

router.get('/list', list);
router.post('/create', create);
router.post('/pay', recordPayment);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteBill);

export default router;
