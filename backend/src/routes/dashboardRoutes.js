import { Router } from 'express';
import { loadMetrics } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/metrics', requireAuth, loadMetrics);

export default router;