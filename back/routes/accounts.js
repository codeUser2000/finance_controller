import express from 'express';
import * as accountController from '../controllers/accountController.js';

const router = express.Router();

router.get('/', accountController.list);
router.get('/:id', accountController.getById);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.remove);

export default router;
