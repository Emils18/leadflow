import prisma from '../utils/db.js';

export const saveLead = async (req, res) => {
  const { 
    first_name, 
    last_name, 
    company_name, 
    job_title, 
    email, 
    phone, 
    website, 
    country, 
    status_id, 
    source_id, 
    assigned_user_id 
  } = req.body;

  // Enforce mandatory layout inputs
  if (!first_name || !last_name || !company_name || !email) {
    return res.status(400).json({ error: 'First Name, Last Name, Company Name, and Email are required.' });
  }

  try {
    // Prevent duplicate entries
    const existing = await prisma.lead.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'A lead with this email address is already registered.' });
    }

    // Resolve structural database fallback IDs
    const resolvedStatusId = status_id ? parseInt(status_id, 10) : (await prisma.leadStatus.findFirst({ orderBy: { display_order: 'asc' } }))?.id;
    const resolvedSourceId = source_id ? parseInt(source_id, 10) : (await prisma.leadSource.findFirst())?.id;
    const resolvedAssignedId = assigned_user_id ? parseInt(assigned_user_id, 10) : req.user.id;

    if (!resolvedStatusId || !resolvedSourceId) {
      return res.status(500).json({ error: 'Baseline pipeline statuses or sources are absent. Seed database first.' });
    }

    // Commit writes in an isolated database transaction
    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          first_name,
          last_name,
          company_name,
          job_title: job_title || '',
          email,
          phone: phone || '',
          website: website || '',
          country: country || '',
          status_id: resolvedStatusId,
          source_id: resolvedSourceId,
          assigned_user_id: resolvedAssignedId,
          created_by: req.user.id,
        },
      });

      // Log audit history trail
      await tx.leadActivity.create({
        data: {
          lead_id: newLead.id,
          user_id: req.user.id,
          activity_type: 'created',
          description: `Lead registered manually: ${newLead.first_name} ${newLead.last_name} at ${newLead.company_name}.`
        }
      });

      return newLead;
    });

    return res.status(201).json(lead);
  } catch (err) {
    console.error('Lead manual addition error:', err);
    return res.status(500).json({ error: 'Failed to write lead entry to database.' });
  }
};

export const fetchVariables = async (req, res) => {
  try {
    const statuses = await prisma.leadStatus.findMany({ orderBy: { display_order: 'asc' } });
    const sources = await prisma.leadSource.findMany();
    const staff = await prisma.user.findMany({
      where: { status: 'active' },
      select: { id: true, first_name: true, last_name: true }
    });

    return res.json({ statuses, sources, staff });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load variables.' });
  }
};