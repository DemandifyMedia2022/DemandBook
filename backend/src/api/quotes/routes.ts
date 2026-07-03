import { Router } from 'express';
import { create, list, getDetails, update, deleteQuote, updateStatus } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteQuote);
router.patch('/:id/status', updateStatus);

export default router;