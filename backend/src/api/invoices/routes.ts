import { Router } from 'express';
import { create, list, summary, getDetails, update, deleteInvoice, recordPayment, sendEmail } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware); // Protect all invoice endpoints

router.get('/summary', summary);
router.get('/', list);
router.post('/', create);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteInvoice);
router.post('/:id/payments', recordPayment);
router.post('/:id/send-email', sendEmail);

export default router;
