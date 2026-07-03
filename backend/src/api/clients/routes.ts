// import { Router } from 'express';
// import { create, list, summary, fetchGSTIN } from './controller';
// import { authMiddleware } from '../../middlewares/auth';

// const router = Router();

// router.use(authMiddleware); // Protect all client endpoints

// router.get('/list', list);
// router.post('/create', create);
// router.get('/summary', summary);
// router.get('/gstin/:gstin', fetchGSTIN);

// export default router;



import { Router } from 'express';
import { create, list, getById, update, remove, summary, fetchGSTIN } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/list', list);
router.get('/summary', summary);
router.get('/gstin/:gstin', fetchGSTIN);
router.get('/:id', getById);
router.post('/create', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;