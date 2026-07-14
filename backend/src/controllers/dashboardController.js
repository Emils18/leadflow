import prisma from '../utils/db.js';
import { isAdminUser } from '../middleware/auth.js';

export const loadMetrics = async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);

    const activityLimit = Math.min(
      Math.max(parseInt(req.query.activityLimit || '5', 10), 5),
      50
    );

    const leadWhere = isAdmin
      ? { deleted_at: null }
      : { deleted_at: null, assigned_user_id: req.user.id };

    const totalLeads = await prisma.lead.count({
      where: leadWhere,
    });

    const emailedCount = await prisma.lead.count({
      where: {
        ...leadWhere,
        status: { status_name: 'Emailed' },
      },
    });

    const repliesCount = await prisma.lead.count({
      where: {
        ...leadWhere,
        status: { status_name: 'Replied' },
      },
    });

    const convertedCount = await prisma.lead.count({
      where: {
        ...leadWhere,
        status: { status_name: 'Converted' },
      },
    });

    const statusCounts = await prisma.leadStatus.findMany({
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: {
            leads: {
              where: leadWhere,
            },
          },
        },
      },
    });

    const activities = await prisma.leadActivity.findMany({
      take: activityLimit,
      orderBy: { created_at: 'desc' },
      where: {
        lead: leadWhere,
      },
      include: {
        lead: {
          select: {
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
        user: {
          select: {
            first_name: true,
            last_name: true,
            avatar_initials: true,
          },
        },
      },
    });

    return res.json({
      scope: isAdmin ? 'admin' : 'staff',
      metrics: {
        totalLeads,
        emailedCount,
        repliesCount,
        convertedCount,
      },
      funnel: statusCounts.map((st) => ({
        name: st.status_name,
        count: st._count.leads,
        percent:
          totalLeads > 0
            ? Math.round((st._count.leads / totalLeads) * 100)
            : 0,
      })),
      activities: activities.map((a) => ({
        id: a.id,
        user: `${a.user.first_name} ${a.user.last_name || ''}`.trim(),
        avatar: a.user.avatar_initials,
        lead: `${a.lead.first_name} ${a.lead.last_name}`,
        company: a.lead.company_name,
        description: a.description,
        created_at: a.created_at,
      })),
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err);

    return res.status(500).json({
      error: 'Failed to process dashboard metrics.',
    });
  }
};