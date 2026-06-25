import { Router } from 'express';
import { create, list, summary, fetchGSTIN } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all client endpoints

router.get('/list', list);
router.post('/create', create);
router.get('/summary', summary);
router.get('/gstin/:gstin', fetchGSTIN);

export default router;
