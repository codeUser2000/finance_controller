import express from 'express';
import * as budgetController from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', budgetController.list);
router.get('/:id', budgetController.getById);
router.post('/', budgetController.create);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
