import prisma from '../utils/db.js';
import { isAdminUser } from '../middleware/auth.js';

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

const parseLeadId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

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

const getAccessibleLead = async (leadId, user, include = {}) => {
  const isAdmin = isAdminUser(user);

  return prisma.lead.findFirst({
    where: {
      id: leadId,
      deleted_at: null,
      ...(isAdmin
        ? {}
        : {
            assigned_user_id: user.id,
          }),
    },
    include,
  });
};

export const getDetails = async (req, res) => {
  const leadId = parseLeadId(req.params.id);

  if (!leadId) {
    return res.status(400).json({
      error: 'Invalid lead ID.',
    });
  }

  try {
    const lead = await getAccessibleLead(leadId, req.user, {
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

      tags: {
        include: {
          tag: true,
        },
      },

      notes: {
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              first_name: true,
              avatar_initials: true,
            },
          },
        },
      },

      activities: {
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              first_name: true,
            },
          },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({
        error: 'Lead profile not found or access is restricted.',
      });
    }

    return res.json(lead);
  } catch (err) {
    console.error('Lead profile lookup error:', err);

    return res.status(500).json({
      error: 'Profile lookup error.',
    });
  }
};

export const editLead = async (req, res) => {
  const leadId = parseLeadId(req.params.id);

  if (!leadId) {
    return res.status(400).json({
      error: 'Invalid lead ID.',
    });
  }

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

  try {
    const isAdmin = isAdminUser(req.user);

    const oldLead = await getAccessibleLead(leadId, req.user, {
      status: true,
      source: true,
      tags: {
        include: {
          tag: true,
        },
      },
    });

    if (!oldLead) {
      return res.status(404).json({
        error: 'Lead profile not found or access is restricted.',
      });
    }

    const safeCompanyName = String(
      company_name ?? oldLead.company_name ?? ''
    ).trim();

    const safeBusinessType = String(
      business_type ?? oldLead.business_type ?? ''
    ).trim();

    const safeEmail = String(email ?? oldLead.email ?? '')
      .trim()
      .toLowerCase();

    const safeCity = String(city ?? oldLead.city ?? '').trim();

    const safeCountry = String(
      country ?? oldLead.country ?? ''
    ).trim();

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

    const requestedStatusId =
      parseOptionalId(status_id) || oldLead.status_id;

    const requestedSourceId =
      parseOptionalId(source_id) || oldLead.source_id;

    const resolvedStatus = await prisma.leadStatus.findUnique({
      where: {
        id: requestedStatusId,
      },
    });

    const resolvedSource = await prisma.leadSource.findUnique({
      where: {
        id: requestedSourceId,
      },
    });

    if (!resolvedStatus || !resolvedSource) {
      return res.status(400).json({
        error: 'The selected status or lead source is invalid.',
      });
    }

    const requestedAssignedId =
      parseOptionalId(assigned_user_id) ||
      oldLead.assigned_user_id;

    const resolvedAssignedId = isAdmin
      ? requestedAssignedId
      : req.user.id;

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
      ? String(
          converted_product ?? oldLead.converted_product ?? ''
        ).trim()
      : null;

    if (
      converted &&
      !CONVERTED_PRODUCTS.includes(safeConvertedProduct)
    ) {
      return res.status(400).json({
        error:
          'Please select SnapServe Lite, SnapServe Full, or Others as the Converted Product.',
      });
    }

    const nextFollowUpDate =
      next_follow_up_date === undefined
        ? oldLead.next_follow_up_date
        : parseOptionalDate(next_follow_up_date);

    if (nextFollowUpDate === undefined) {
      return res.status(400).json({
        error: 'The selected Next Follow-up Date is invalid.',
      });
    }

    const tagNames =
      tags === undefined ? null : normalizeTags(tags);

    const safeNote = String(notes || '').trim();

    const updated = await prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: {
          id: leadId,
        },
        data: {
          company_name: safeCompanyName,
          first_name: optionalText(
            first_name ?? oldLead.first_name
          ),
          last_name: optionalText(
            last_name ?? oldLead.last_name
          ),
          business_type: safeBusinessType,
          job_title: optionalText(
            job_title ?? oldLead.job_title
          ),
          email: safeEmail,
          phone: optionalText(phone ?? oldLead.phone),
          website: optionalText(
            website ?? oldLead.website
          ),
          social_media_url: optionalText(
            social_media_url ?? oldLead.social_media_url
          ),
          complete_address: optionalText(
            complete_address ?? oldLead.complete_address
          ),
          barangay: optionalText(
            barangay ?? oldLead.barangay
          ),
          city: safeCity,
          province: optionalText(
            province ?? oldLead.province
          ),
          country: safeCountry,
          preferred_contact_method: optionalText(
            preferred_contact_method ??
              oldLead.preferred_contact_method
          ),
          next_follow_up_date: nextFollowUpDate,
          interest_level: normalizeInterestLevel(
            interest_level ?? oldLead.interest_level
          ),
          converted_product: safeConvertedProduct,
          status_id: resolvedStatus.id,
          source_id: resolvedSource.id,
          assigned_user_id: resolvedAssignedId,
        },
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
      });

      if (tagNames !== null) {
        await tx.leadTagMap.deleteMany({
          where: {
            lead_id: leadId,
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
              lead_id: leadId,
              tag_id: tag.id,
            },
          });
        }
      }

      const statusChanged =
        oldLead.status_id !== updatedLead.status_id;

      const convertedProductChanged =
        String(oldLead.converted_product || '') !==
        String(updatedLead.converted_product || '');

      if (statusChanged) {
        await tx.leadActivity.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            activity_type: isConvertedStatus(
              updatedLead.status.status_name
            )
              ? 'converted'
              : 'updated',
            description: `Lead status changed from "${oldLead.status.status_name}" to "${updatedLead.status.status_name}".`,
          },
        });
      }

      if (convertedProductChanged) {
        await tx.leadActivity.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            activity_type: updatedLead.converted_product
              ? 'converted'
              : 'updated',
            description: updatedLead.converted_product
              ? `Converted Product changed from "${
                  oldLead.converted_product || 'None'
                }" to "${updatedLead.converted_product}".`
              : `Converted Product "${oldLead.converted_product}" was removed.`,
          },
        });
      }

      if (!statusChanged && !convertedProductChanged) {
        await tx.leadActivity.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            activity_type: 'updated',
            description: 'Lead profile information was updated.',
          },
        });
      }

      if (safeNote) {
        await tx.leadNote.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            note: safeNote,
          },
        });

        await tx.leadActivity.create({
          data: {
            lead_id: leadId,
            user_id: req.user.id,
            activity_type: 'note',
            description: 'Internal CRM note added.',
          },
        });
      }

      return tx.lead.findUnique({
        where: {
          id: leadId,
        },
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
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return res.json(updated);
  } catch (err) {
    console.error('Lead update error:', err);

    if (err?.code === 'P2002') {
      return res.status(409).json({
        error: 'Another lead already uses this email address.',
      });
    }

    return res.status(500).json({
      error: 'Failed to update lead properties.',
    });
  }
};

export const addNote = async (req, res) => {
  const leadId = parseLeadId(req.params.id);
  const note = String(req.body.note || '').trim();

  if (!leadId) {
    return res.status(400).json({
      error: 'Invalid lead ID.',
    });
  }

  if (!note) {
    return res.status(400).json({
      error: 'Note text cannot be empty.',
    });
  }

  try {
    const lead = await getAccessibleLead(leadId, req.user);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead profile not found or access is restricted.',
      });
    }

    const added = await prisma.$transaction(async (tx) => {
      const newNote = await tx.leadNote.create({
        data: {
          lead_id: leadId,
          user_id: req.user.id,
          note,
        },
        include: {
          user: {
            select: {
              first_name: true,
              avatar_initials: true,
            },
          },
        },
      });

      await tx.leadActivity.create({
        data: {
          lead_id: leadId,
          user_id: req.user.id,
          activity_type: 'note',
          description: 'Internal CRM note added.',
        },
      });

      return newNote;
    });

    return res.status(201).json(added);
  } catch (err) {
    console.error('Lead note creation error:', err);

    return res.status(500).json({
      error: 'Failed to append note.',
    });
  }
};