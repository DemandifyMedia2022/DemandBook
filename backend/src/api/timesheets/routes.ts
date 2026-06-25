import { Router } from 'express';
import { create, list, update, deleteTimesheet } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteTimesheet);

export default router;
