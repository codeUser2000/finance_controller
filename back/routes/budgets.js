import express from 'express';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', budgetController.list);
router.get('/:id', budgetController.getById);
router.post('/', budgetController.create);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
