import { Router } from 'express';
import { login, getSession } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/session', requireAuth, getSession);

export default router;