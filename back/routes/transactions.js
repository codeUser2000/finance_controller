import express from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', transactionController.list);
router.get('/:id', transactionController.getById);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
