import { Router } from 'express';
import multer from 'multer';
import { handleCSVImport } from '../controllers/importController.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/csv', requireAuth, requirePermission('can_manage_leads'), upload.single('file'), handleCSVImport);

export default router;