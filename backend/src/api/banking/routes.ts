import { Router } from 'express';
import { createAccount, listAccounts, createTransaction, listTransactions } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/accounts', listAccounts);
router.post('/accounts', createAccount);
router.get('/transactions', listTransactions);
router.post('/transactions', createTransaction);

export default router;
