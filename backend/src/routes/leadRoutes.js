import express from 'express';
import prisma from '../utils/db.js';
import {
  saveLead,
  fetchVariables,
} from '../controllers/leadController.js';
import {
  requireAuth,
  isAdminUser,
} from '../middleware/auth.js';

const router = express.Router();

// 1. Manual Lead Registration (POST /api/leads)
router.post('/', requireAuth, saveLead);

// 2. Load Configuration Dropdowns (GET /api/leads/variables)
router.get('/variables', requireAuth, fetchVariables);

// 3. Dynamic Lead Retrieval with Strict Filtering & Source Inclusion
// GET /api/leads
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, status_id, source_id } = req.query;
    const isAdmin = isAdminUser(req.user);

    const where = {
      deleted_at: null,
    };

    // Staff can only see leads assigned to them.
    if (!isAdmin) {
      where.assigned_user_id = req.user.id;
    }

    if (status_id) {
      const parsedStatusId = Number.parseInt(status_id, 10);

      if (Number.isNaN(parsedStatusId)) {
        return res.status(400).json({
          error: 'Invalid lead status filter.',
        });
      }

      where.status_id = parsedStatusId;
    }

    if (source_id) {
      const parsedSourceId = Number.parseInt(source_id, 10);

      if (Number.isNaN(parsedSourceId)) {
        return res.status(400).json({
          error: 'Invalid lead source filter.',
        });
      }

      where.source_id = parsedSourceId;
    }

    const searchValue = String(search || '').trim();

    if (searchValue) {
      where.OR = [
        {
          first_name: {
            contains: searchValue,
          },
        },
        {
          last_name: {
            contains: searchValue,
          },
        },
        {
          email: {
            contains: searchValue,
          },
        },
        {
          company_name: {
            contains: searchValue,
          },
        },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        status: true,
        source: true,
        assigned_to: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);

    return res.status(500).json({
      error: 'Failed to retrieve pipeline leads.',
    });
  }
});

// 4. Soft-Delete Lead (DELETE /api/leads/:id)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const leadId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(leadId)) {
      return res.status(400).json({
        error: 'Invalid lead ID.',
      });
    }

    const isAdmin = isAdminUser(req.user);

    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        deleted_at: null,
        ...(isAdmin
          ? {}
          : {
              assigned_user_id: req.user.id,
            }),
      },
    });

    if (!existingLead) {
      return res.status(404).json({
        error: 'Lead not found or access is restricted.',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.lead.update({
        where: {
          id: leadId,
        },
        data: {
          deleted_at: new Date(),
        },
      });

      await tx.leadActivity.create({
        data: {
          lead_id: leadId,
          user_id: req.user.id,
          activity_type: 'updated',
          description: 'Lead profile deleted from directory.',
        },
      });
    });

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error('Error deleting lead:', err);

    return res.status(500).json({
      error: 'Failed to delete lead from database.',
    });
  }
});

export default router;