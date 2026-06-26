import prisma from '../utils/db.js';

export const getDetails = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        status: true,
        source: true,
        assigned_to: { select: { id: true, first_name: true, last_name: true } },
        notes: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { first_name: true, avatar_initials: true } } }
        },
        activities: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { first_name: true } } }
        }
      }
    });
    if (!lead || lead.deleted_at) return res.status(404).json({ error: 'Lead profile not found.' });
    return res.json(lead);
  } catch (err) {
    return res.status(500).json({ error: 'Profile lookup error.' });
  }
};

export const editLead = async (req, res) => {
  const { first_name, last_name, company_name, email, status_id, source_id, assigned_user_id, phone, website, country } = req.body;
  try {
    const leadId = parseInt(req.params.id, 10);
    const old = await prisma.lead.findUnique({ where: { id: leadId }, include: { status: true } });

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.lead.update({
        where: { id: leadId },
        data: {
          first_name,
          last_name,
          company_name,
          email,
          phone: phone || '',
          website: website || '',
          country: country || '',
          status_id: parseInt(status_id, 10),
          source_id: parseInt(source_id, 10),
          assigned_user_id: parseInt(assigned_user_id, 10),
        },
        include: { status: true }
      });

      if (old.status_id !== up.status_id) {
        await tx.leadActivity.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            activity_type: 'updated',
            description: `Pipeline stage adjusted from "${old.status.status_name}" to "${up.status.status_name}".`
          }
        });
      }
      return up;
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lead properties.' });
  }
};

export const addNote = async (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json({ error: 'Note text cannot be empty.' });

  try {
    const leadId = parseInt(req.params.id, 10);
    const added = await prisma.$transaction(async (tx) => {
      const nt = await tx.leadNote.create({
        data: { lead_id: leadId, user_id: req.user.id, note },
        include: { user: { select: { first_name: true, avatar_initials: true } } }
      });
      await tx.leadActivity.create({
        data: { lead_id: leadId, user_id: req.user.id, activity_type: 'note', description: 'Internal CRM log note added.' }
      });
      return nt;
    });
    return res.status(201).json(added);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to append note.' });
  }
};