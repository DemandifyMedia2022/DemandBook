import { Router } from 'express';
import { create, list, deleteDocument } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.delete('/:id', deleteDocument);

export default router;
