import express from 'express';
import prisma from '../utils/db.js';
import { saveLead, fetchVariables } from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Manual Lead Registration (POST /api/leads)
router.post('/', requireAuth, saveLead);

// 2. Load Configuration Dropdowns (GET /api/leads/variables)
router.get('/variables', requireAuth, fetchVariables);

// 3. Dynamic Lead Retrieval with Strict Filtering & Source Inclusion (GET /api/leads)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, status_id, source_id } = req.query;

    // Base query conditions
    const where = {
      deleted_at: null,
    };

    // Filter by pipeline status if selected
    if (status_id) {
      where.status_id = parseInt(status_id, 10);
    }

    // Filter by channel source if selected
    if (source_id) {
      where.source_id = parseInt(source_id, 10);
    }

    // Process search keyword matching
    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
        { company_name: { contains: search } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        status: true,
        source: true, // === FIXED: Added this line to include the source table relation ===
        assigned_to: { select: { first_name: true, last_name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to retrieve pipeline leads.' });
  }
});

// 4. Soft-Delete Lead (DELETE /api/leads/:id)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    await prisma.lead.update({
      where: { id: leadId },
      data: { deleted_at: new Date() }
    });

    // Log deletion activity
    await prisma.leadActivity.create({
      data: {
        lead_id: leadId,
        user_id: req.user.id,
        activity_type: 'updated',
        description: `Lead profile deleted from directory.`
      }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Failed to delete lead from database.' });
  }
});

export default router;