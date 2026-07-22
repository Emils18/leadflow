import prisma from '../utils/db.js';
import { isAdminUser } from '../middleware/auth.js';

const REQUIRED_LEAD_SOURCES = [
  {
    source_name: 'Facebook (FB)',
    description: 'Lead generated through Facebook.',
  },
  {
    source_name: 'Instagram (IG)',
    description: 'Lead generated through Instagram.',
  },
  {
    source_name: 'Others',
    description: 'Lead generated through another source.',
  },
];

const BUSINESS_TYPES = [
  'Café',
  'Restaurant',
  'Food Chain',
  'Hotel',
  'Others',
];

const CONVERTED_PRODUCTS = [
  'SnapServe Lite',
  'SnapServe Full',
  'Others',
];

const parseOptionalId = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseOptionalDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
};

const optionalText = (value) => {
  const normalized = String(value || '').trim();
  return normalized || null;
};

const normalizeInterestLevel = (value) => {
  const normalized = String(value || 'cold').trim().toLowerCase();

  if (['cold', 'warm', 'hot'].includes(normalized)) {
    return normalized;
  }

  return 'cold';
};

const normalizeTags = (tags) => {
  const rawTags = Array.isArray(tags)
    ? tags
    : String(tags || '').split(',');

  return [
    ...new Set(
      rawTags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    ),
  ];
};

const isConvertedStatus = (statusName) => {
  return String(statusName || '').trim().toLowerCase() === 'converted';
};

const ensureRequiredLeadSources = async () => {
  await Promise.all(
    REQUIRED_LEAD_SOURCES.map((source) =>
      prisma.leadSource.upsert({
        where: {
          source_name: source.source_name,
        },
        update: {
          description: source.description,
        },
        create: source,
      })
    )
  );
};

export const saveLead = async (req, res) => {
  const {
    company_name,
    first_name,
    last_name,
    business_type,
    job_title,
    email,
    phone,
    website,
    social_media_url,
    complete_address,
    barangay,
    city,
    province,
    country,
    preferred_contact_method,
    next_follow_up_date,
    notes,
    interest_level,
    converted_product,
    status_id,
    source_id,
    assigned_user_id,
    tags,
  } = req.body;

  const safeCompanyName = String(company_name || '').trim();
  const safeBusinessType = String(business_type || '').trim();
  const safeEmail = String(email || '').trim().toLowerCase();
  const safeCity = String(city || '').trim();
  const safeCountry = String(country || '').trim();

  if (
    !safeCompanyName ||
    !safeBusinessType ||
    !safeEmail ||
    !safeCity ||
    !safeCountry
  ) {
    return res.status(400).json({
      error:
        'Company Name, Business Type, Email Address, City, and Country are required.',
    });
  }

  if (!BUSINESS_TYPES.includes(safeBusinessType)) {
    return res.status(400).json({
      error: 'The selected Industry / Business Type is invalid.',
    });
  }

  const safeFollowUpDate = parseOptionalDate(next_follow_up_date);

  if (safeFollowUpDate === undefined) {
    return res.status(400).json({
      error: 'The selected Next Follow-up Date is invalid.',
    });
  }

  try {
    const isAdmin = isAdminUser(req.user);

    const existing = await prisma.lead.findUnique({
      where: {
        email: safeEmail,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'A lead with this email address is already registered.',
      });
    }

    const requestedStatusId = parseOptionalId(status_id);
    const requestedSourceId = parseOptionalId(source_id);
    const requestedAssignedId = parseOptionalId(assigned_user_id);

    const resolvedStatus = requestedStatusId
      ? await prisma.leadStatus.findUnique({
          where: {
            id: requestedStatusId,
          },
        })
      : await prisma.leadStatus.findFirst({
          orderBy: {
            display_order: 'asc',
          },
        });

    const resolvedSource = requestedSourceId
      ? await prisma.leadSource.findUnique({
          where: {
            id: requestedSourceId,
          },
        })
      : await prisma.leadSource.findFirst({
          orderBy: {
            id: 'asc',
          },
        });

    const resolvedAssignedId = isAdmin
      ? requestedAssignedId || req.user.id
      : req.user.id;

    if (!resolvedStatus || !resolvedSource) {
      return res.status(500).json({
        error:
          'Baseline pipeline statuses or sources are absent. Seed the database first.',
      });
    }

    const assignedUser = await prisma.user.findFirst({
      where: {
        id: resolvedAssignedId,
        status: 'active',
      },
    });

    if (!assignedUser) {
      return res.status(400).json({
        error: 'The selected assigned user is invalid or inactive.',
      });
    }

    const converted = isConvertedStatus(resolvedStatus.status_name);

    const safeConvertedProduct = converted
      ? String(converted_product || '').trim()
      : null;

    if (converted && !CONVERTED_PRODUCTS.includes(safeConvertedProduct)) {
      return res.status(400).json({
        error:
          'Please select SnapServe Lite, SnapServe Full, or Others as the Converted Product.',
      });
    }

    const tagNames = normalizeTags(tags);
    const safeNote = String(notes || '').trim();

    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          company_name: safeCompanyName,
          first_name: optionalText(first_name),
          last_name: optionalText(last_name),
          business_type: safeBusinessType,
          job_title: optionalText(job_title),
          email: safeEmail,
          phone: optionalText(phone),
          website: optionalText(website),
          social_media_url: optionalText(social_media_url),
          complete_address: optionalText(complete_address),
          barangay: optionalText(barangay),
          city: safeCity,
          province: optionalText(province),
          country: safeCountry,
          preferred_contact_method: optionalText(
            preferred_contact_method
          ),
          next_follow_up_date: safeFollowUpDate,
          interest_level: normalizeInterestLevel(interest_level),
          converted_product: safeConvertedProduct,
          status_id: resolvedStatus.id,
          source_id: resolvedSource.id,
          assigned_user_id: resolvedAssignedId,
          created_by: req.user.id,
        },
      });

      for (const tagName of tagNames) {
        const tag = await tx.leadTag.upsert({
          where: {
            tag_name: tagName,
          },
          update: {},
          create: {
            tag_name: tagName,
          },
        });

        await tx.leadTagMap.create({
          data: {
            lead_id: newLead.id,
            tag_id: tag.id,
          },
        });
      }

      if (safeNote) {
        await tx.leadNote.create({
          data: {
            lead_id: newLead.id,
            user_id: req.user.id,
            note: safeNote,
          },
        });
      }

      const contactName = [
        newLead.first_name,
        newLead.last_name,
      ]
        .filter(Boolean)
        .join(' ');

      const leadName = contactName
        ? `${contactName} at ${newLead.company_name}`
        : newLead.company_name;

      await tx.leadActivity.create({
        data: {
          lead_id: newLead.id,
          user_id: req.user.id,
          activity_type: 'created',
          description: `Lead created: ${leadName}.`,
        },
      });

      if (converted && safeConvertedProduct) {
        await tx.leadActivity.create({
          data: {
            lead_id: newLead.id,
            user_id: req.user.id,
            activity_type: 'converted',
            description: `Lead converted to "${safeConvertedProduct}".`,
          },
        });
      }

      if (safeNote) {
        await tx.leadActivity.create({
          data: {
            lead_id: newLead.id,
            user_id: req.user.id,
            activity_type: 'note',
            description: 'Initial CRM note added.',
          },
        });
      }

      return tx.lead.findUnique({
        where: {
          id: newLead.id,
        },
        include: {
          status: true,
          source: true,
          assigned_to: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return res.status(201).json(lead);
  } catch (err) {
    console.error('Lead manual addition error:', err);

    if (err?.code === 'P2002') {
      return res.status(409).json({
        error: 'A lead with this email address is already registered.',
      });
    }

    return res.status(500).json({
      error: 'Failed to write lead entry to database.',
    });
  }
};

export const fetchVariables = async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);

    await ensureRequiredLeadSources();

    const [statuses, sources, staff] = await Promise.all([
      prisma.leadStatus.findMany({
        orderBy: {
          display_order: 'asc',
        },
      }),

      prisma.leadSource.findMany({
        orderBy: {
          source_name: 'asc',
        },
      }),

      prisma.user.findMany({
        where: isAdmin
          ? {
              status: 'active',
            }
          : {
              id: req.user.id,
              status: 'active',
            },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: {
            select: {
              role_name: true,
            },
          },
        },
        orderBy: [
          {
            first_name: 'asc',
          },
          {
            last_name: 'asc',
          },
        ],
      }),
    ]);

    return res.json({
      statuses,
      sources,
      staff,
      business_types: BUSINESS_TYPES,
      converted_products: CONVERTED_PRODUCTS,
      interest_levels: [
        {
          value: 'cold',
          label: 'Cold',
        },
        {
          value: 'warm',
          label: 'Warm',
        },
        {
          value: 'hot',
          label: 'Hot',
        },
      ],
      scope: isAdmin ? 'admin' : 'staff',
    });
  } catch (err) {
    console.error('Lead variable loading error:', err);

    return res.status(500).json({
      error: 'Failed to load variables.',
    });
  }
};