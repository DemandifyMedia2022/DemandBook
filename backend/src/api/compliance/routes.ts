import { Router } from 'express';
import { listGstFilings, createGstFiling, listTdsLiabilities, createTdsLiability, listTdsChallans, createTdsChallan } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/gst', listGstFilings);
router.post('/gst', createGstFiling);

router.get('/tds-liabilities', listTdsLiabilities);
router.post('/tds-liabilities', createTdsLiability);

router.get('/tds-challans', listTdsChallans);
router.post('/tds-challans', createTdsChallan);

export default router;
