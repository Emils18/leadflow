import { Router } from 'express';
import { getDetails, editLead, addNote } from '../controllers/leadDetailsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/:id', requireAuth, getDetails);
router.put('/:id', requireAuth, editLead);
router.post('/:id/notes', requireAuth, addNote);

export default router;