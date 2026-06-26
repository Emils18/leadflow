import prisma from '../utils/db.js';

export const loadMetrics = async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count({ where: { deleted_at: null } });

    const emailedCount = await prisma.lead.count({
      where: { status: { status_name: 'Emailed' }, deleted_at: null }
    });

    const repliesCount = await prisma.lead.count({
      where: { status: { status_name: 'Replied' }, deleted_at: null }
    });

    const convertedCount = await prisma.lead.count({
      where: { status: { status_name: 'Converted' }, deleted_at: null }
    });

    // Funnel stage distribution counts
    const statusCounts = await prisma.leadStatus.findMany({
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: { leads: { where: { deleted_at: null } } }
        }
      }
    });

    const activities = await prisma.leadActivity.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        lead: { select: { first_name: true, last_name: true, company_name: true } },
        user: { select: { first_name: true, avatar_initials: true } }
      }
    });

    return res.json({
      metrics: { totalLeads, emailedCount, repliesCount, convertedCount },
      funnel: statusCounts.map(st => ({
        name: st.status_name,
        count: st._count.leads,
        percent: totalLeads > 0 ? Math.round((st._count.leads / totalLeads) * 100) : 0
      })),
      activities: activities.map(a => ({
        id: a.id,
        user: a.user.first_name,
        avatar: a.user.avatar_initials,
        lead: `${a.lead.first_name} ${a.lead.last_name}`,
        company: a.lead.company_name,
        description: a.description,
        created_at: a.created_at
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process dashboard metrics.' });
  }
};