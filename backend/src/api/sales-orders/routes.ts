// import { Router } from 'express';
// import { create, list, getDetails, update, deleteOrder } from './controller';
// import { authMiddleware } from '../../middlewares/auth';

// const router = Router();

// router.use(authMiddleware);

// router.get('/', list);
// router.post('/', create);
// router.get('/:id', getDetails);
// router.put('/:id', update);
// router.delete('/:id', deleteOrder);

// export default router;



import { Router } from 'express';
import {
    create,
    list,
    getDetails,
    update,
    deleteOrder,
    bulkUpdateStatus,
    exportCSV,
} from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

// Specific routes BEFORE param routes (so 'export' isn't swallowed by '/:id')
router.get('/', list);
router.get('/export', exportCSV);
router.post('/', create);
router.post('/bulk-status', bulkUpdateStatus);
router.get('/:id', getDetails);
router.put('/:id', update);
router.delete('/:id', deleteOrder);

export default router;