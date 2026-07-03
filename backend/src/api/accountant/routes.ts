import { Router } from 'express';
import { 
  listAccounts, createAccount, 
  listJournals, createJournal, getJournalDetails, deleteJournal,
  listBudgets, createBudget, 
  listLocks, createLock,
  listBulkTransactions, executeBulkUpdate
} from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/chart-of-accounts', listAccounts);
router.post('/chart-of-accounts', createAccount);

router.get('/journals', listJournals);
router.post('/journals', createJournal);
router.get('/journals/:id', getJournalDetails);
router.delete('/journals/:id', deleteJournal);

router.get('/bulk-update/transactions', listBulkTransactions);
router.post('/bulk-update/execute', executeBulkUpdate);

router.get('/budgets', listBudgets);
router.post('/budgets', createBudget);

router.get('/locks', listLocks);
router.post('/locks', createLock);

export default router;
