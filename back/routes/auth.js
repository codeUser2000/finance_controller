import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', requireAuth, authController.me);
router.put('/me', requireAuth, authController.updateProfile);
router.post('/2fa/setup', requireAuth, authController.setup2fa);
router.post('/2fa/enable', requireAuth, authController.enable2fa);
router.post('/2fa/disable', requireAuth, authController.disable2fa);
router.post('/2fa/verify-login', authLimiter, authController.verifyLogin2fa);

export default router;
