import { Router } from 'express';
import { create, list, getDetails, update, deleteOrder } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteOrder);

export default router;
