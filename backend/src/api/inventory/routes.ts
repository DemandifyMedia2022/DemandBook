import { Router } from 'express';
import { create, list, update, remove } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all inventory endpoints

router.get('/list', list);
router.post('/create', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
