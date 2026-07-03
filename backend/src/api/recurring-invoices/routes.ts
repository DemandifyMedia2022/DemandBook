import { Router } from 'express';
import { create, list, getDetails, update, deleteProfile, pause, resume, generateNow } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteProfile);
router.post('/:id/pause', pause);
router.post('/:id/resume', resume);
router.post('/:id/generate-now', generateNow);

export default router;