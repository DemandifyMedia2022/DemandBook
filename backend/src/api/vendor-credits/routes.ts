import { Router } from 'express';
import { create, list, getDetails, update, deleteCredit } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteCredit);

export default router;
