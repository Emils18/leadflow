import prisma from '../utils/db.js';

const REQUIRED_SOURCES = [
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

const PREFERRED_CONTACT_METHODS = [
  'Email',
  'Phone',
  'Facebook',
  'Instagram',
  'LinkedIn',
];

const cleanValue = (value) => {
  return String(value ?? '').trim();
};

const optionalText = (value) => {
  const cleaned = cleanValue(value);
  return cleaned || null;
};

const normalizeHeader = (value) => {
  return cleanValue(value)
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const parseCSV = (text) => {
  const rows = [];

  let currentRow = [];
  let currentValue = '';
  let insideQuotes = false;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (
        insideQuotes &&
        nextCharacter === '"'
      ) {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (
      character === ',' &&
      !insideQuotes
    ) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if (
      character === '\n' &&
      !insideQuotes
    ) {
      currentRow.push(currentValue);

      const hasContent = currentRow.some(
        (value) => cleanValue(value)
      );

      if (hasContent) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = '';
      continue;
    }

    if (
      character === '\r' &&
      !insideQuotes
    ) {
      continue;
    }

    currentValue += character;
  }

  if (
    currentValue.length > 0 ||
    currentRow.length > 0
  ) {
    currentRow.push(currentValue);

    const hasContent = currentRow.some(
      (value) => cleanValue(value)
    );

    if (hasContent) {
      rows.push(currentRow);
    }
  }

  return rows;
};

const findHeaderIndex = (
  headers,
  acceptedHeaders
) => {
  return headers.findIndex((header) =>
    acceptedHeaders.includes(header)
  );
};

const getColumnValue = (
  columns,
  index
) => {
  if (
    index === -1 ||
    index === undefined
  ) {
    return '';
  }

  return cleanValue(columns[index]);
};

const serializeRawRow = (
  headers,
  columns
) => {
  const rawObject = {};

  headers.forEach((header, index) => {
    const key =
      header || `column_${index + 1}`;

    rawObject[key] = getColumnValue(
      columns,
      index
    );
  });

  return JSON.stringify(rawObject);
};

const normalizeInterestLevel = (
  value
) => {
  const normalized = cleanValue(
    value
  ).toLowerCase();

  if (
    ['cold', 'warm', 'hot'].includes(
      normalized
    )
  ) {
    return normalized;
  }

  return 'cold';
};

const normalizeSourceName = (value) => {
  const normalized = cleanValue(
    value
  ).toLowerCase();

  if (
    normalized === 'fb' ||
    normalized === 'facebook' ||
    normalized === 'facebook (fb)'
  ) {
    return 'Facebook (FB)';
  }

  if (
    normalized === 'ig' ||
    normalized === 'instagram' ||
    normalized === 'instagram (ig)'
  ) {
    return 'Instagram (IG)';
  }

  if (
    normalized === 'other' ||
    normalized === 'others'
  ) {
    return 'Others';
  }

  return cleanValue(value);
};

const normalizeBusinessType = (
  value
) => {
  const normalized = cleanValue(
    value
  ).toLowerCase();

  if (
    normalized === 'cafe' ||
    normalized === 'café'
  ) {
    return 'Café';
  }

  return (
    BUSINESS_TYPES.find(
      (businessType) =>
        businessType.toLowerCase() ===
        normalized
    ) || null
  );
};

const normalizeConvertedProduct = (
  value
) => {
  const normalized = cleanValue(
    value
  ).toLowerCase();

  return (
    CONVERTED_PRODUCTS.find(
      (product) =>
        product.toLowerCase() ===
        normalized
    ) || null
  );
};

const normalizePreferredContactMethod = (
  value
) => {
  const cleaned = cleanValue(value);

  if (!cleaned) {
    return null;
  }

  const normalized =
    cleaned.toLowerCase();

  return (
    PREFERRED_CONTACT_METHODS.find(
      (method) =>
        method.toLowerCase() ===
        normalized
    ) || undefined
  );
};

const parseOptionalDate = (value) => {
  const cleaned = cleanValue(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const normalizeTags = (value) => {
  return [
    ...new Set(
      cleanValue(value)
        .split(/[|;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  ];
};

const isConvertedStatus = (
  statusName
) => {
  return (
    cleanValue(statusName).toLowerCase() ===
    'converted'
  );
};

const ensureRequiredSources =
  async () => {
    await Promise.all(
      REQUIRED_SOURCES.map((source) =>
        prisma.leadSource.upsert({
          where: {
            source_name:
              source.source_name,
          },

          update: {
            description:
              source.description,
          },

          create: source,
        })
      )
    );
  };

export const handleCSVImport = async (
  req,
  res
) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Please upload a CSV file.',
    });
  }

  let batchId = null;

  try {
    const text = req.file.buffer
      .toString('utf-8')
      .replace(/^\uFEFF/, '');

    const rows = parseCSV(text);

    if (rows.length <= 1) {
      return res.status(400).json({
        error:
          'The uploaded CSV file contains no data rows.',
      });
    }

    const headers = rows[0].map(
      normalizeHeader
    );

    const dataRows = rows.slice(1);

    const indexes = {
      company_name: findHeaderIndex(
        headers,
        ['company_name', 'company']
      ),

      business_type: findHeaderIndex(
        headers,
        [
          'business_type',
          'industry',
          'industry_business_type',
          'company_type',
        ]
      ),

      first_name: findHeaderIndex(
        headers,
        [
          'first_name',
          'firstname',
          'first',
        ]
      ),

      last_name: findHeaderIndex(
        headers,
        [
          'last_name',
          'lastname',
          'last',
        ]
      ),

      job_title: findHeaderIndex(
        headers,
        [
          'job_title',
          'title',
          'position',
        ]
      ),

      email: findHeaderIndex(
        headers,
        ['email', 'email_address']
      ),

      phone: findHeaderIndex(
        headers,
        [
          'phone',
          'phone_number',
          'contact',
        ]
      ),

      website: findHeaderIndex(
        headers,
        ['website', 'site']
      ),

      social_media_url:
        findHeaderIndex(headers, [
          'social_media_url',
          'social_url',
          'social_media',
          'social_page',
          'facebook_instagram_linkedin',
        ]),

      complete_address:
        findHeaderIndex(headers, [
          'complete_address',
          'full_address',
          'address',
        ]),

      barangay: findHeaderIndex(
        headers,
        ['barangay', 'brgy']
      ),

      city: findHeaderIndex(
        headers,
        ['city', 'municipality']
      ),

      province: findHeaderIndex(
        headers,
        ['province', 'state']
      ),

      country: findHeaderIndex(
        headers,
        ['country']
      ),

      source: findHeaderIndex(
        headers,
        [
          'source',
          'lead_source',
          'source_name',
        ]
      ),

      status: findHeaderIndex(
        headers,
        ['status', 'lead_status']
      ),

      interest_level:
        findHeaderIndex(headers, [
          'interest_level',
          'interest',
        ]),

      converted_product:
        findHeaderIndex(headers, [
          'converted_product',
          'converted_to',
          'product',
        ]),

      preferred_contact_method:
        findHeaderIndex(headers, [
          'preferred_contact_method',
          'preferred_contact',
          'contact_method',
        ]),

      next_follow_up_date:
        findHeaderIndex(headers, [
          'next_follow_up_date',
          'follow_up_date',
          'next_followup',
        ]),

      notes: findHeaderIndex(
        headers,
        ['notes', 'note', 'remarks']
      ),

      tags: findHeaderIndex(
        headers,
        ['tags', 'tag']
      ),
    };

    const missingHeaders = [];

    if (indexes.company_name === -1) {
      missingHeaders.push(
        'company_name'
      );
    }

    if (indexes.business_type === -1) {
      missingHeaders.push(
        'business_type'
      );
    }

    if (indexes.email === -1) {
      missingHeaders.push('email');
    }

    if (indexes.city === -1) {
      missingHeaders.push('city');
    }

    if (indexes.country === -1) {
      missingHeaders.push('country');
    }

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: `CSV headers must include: ${missingHeaders.join(
          ', '
        )}.`,
      });
    }

    await ensureRequiredSources();

    const [statuses, sources] =
      await Promise.all([
        prisma.leadStatus.findMany({
          orderBy: {
            display_order: 'asc',
          },
        }),

        prisma.leadSource.findMany({
          orderBy: {
            id: 'asc',
          },
        }),
      ]);

    const defaultStatus = statuses[0];

    const defaultSource =
      sources.find(
        (source) =>
          source.source_name.toLowerCase() ===
          'others'
      ) || sources[0];

    if (!defaultStatus || !defaultSource) {
      return res.status(500).json({
        error:
          'Baseline pipeline configurations are missing. Please seed the database.',
      });
    }

    const findStatus = (statusName) => {
      const normalized = cleanValue(
        statusName
      ).toLowerCase();

      if (!normalized) {
        return defaultStatus;
      }

      return (
        statuses.find(
          (status) =>
            status.status_name.toLowerCase() ===
            normalized
        ) || defaultStatus
      );
    };

    const findSource = (sourceName) => {
      const normalizedName =
        normalizeSourceName(
          sourceName
        ).toLowerCase();

      if (!normalizedName) {
        return defaultSource;
      }

      return (
        sources.find(
          (source) =>
            source.source_name.toLowerCase() ===
            normalizedName
        ) || defaultSource
      );
    };

    const batch =
      await prisma.importBatch.create({
        data: {
          file_name:
            req.file.originalname,

          file_type: 'csv',
          uploaded_by: req.user.id,
          total_rows: dataRows.length,
          imported_count: 0,
          duplicate_count: 0,
          failed_count: 0,
          status: 'processing',
        },
      });

    batchId = batch.id;

    let imported = 0;
    let duplicates = 0;
    let failed = 0;

    for (
      let rowIndex = 0;
      rowIndex < dataRows.length;
      rowIndex += 1
    ) {
      const columns =
        dataRows[rowIndex];

      const rowNumber =
        rowIndex + 2;

      const rawData = serializeRawRow(
        headers,
        columns
      );

      const companyName =
        getColumnValue(
          columns,
          indexes.company_name
        );

      const businessTypeValue =
        getColumnValue(
          columns,
          indexes.business_type
        );

      const businessType =
        normalizeBusinessType(
          businessTypeValue
        );

      const firstName = getColumnValue(
        columns,
        indexes.first_name
      );

      const lastName = getColumnValue(
        columns,
        indexes.last_name
      );

      const email = getColumnValue(
        columns,
        indexes.email
      ).toLowerCase();

      const city = getColumnValue(
        columns,
        indexes.city
      );

      const country = getColumnValue(
        columns,
        indexes.country
      );

      const requiredFieldErrors = [];

      if (!companyName) {
        requiredFieldErrors.push(
          'Company Name'
        );
      }

      if (!businessTypeValue) {
        requiredFieldErrors.push(
          'Business Type'
        );
      }

      if (!email) {
        requiredFieldErrors.push(
          'Email Address'
        );
      }

      if (!city) {
        requiredFieldErrors.push(
          'City'
        );
      }

      if (!country) {
        requiredFieldErrors.push(
          'Country'
        );
      }

      if (requiredFieldErrors.length > 0) {
        failed += 1;

        await prisma.importRow.create({
          data: {
            batch_id: batch.id,
            row_number: rowNumber,
            email: email || 'unknown',
            raw_data: rawData,
            import_status: 'failed',
            error_message: `Missing required fields: ${requiredFieldErrors.join(
              ', '
            )}.`,
          },
        });

        continue;
      }

      if (!businessType) {
        failed += 1;

        await prisma.importRow.create({
          data: {
            batch_id: batch.id,
            row_number: rowNumber,
            email,
            raw_data: rawData,
            import_status: 'failed',
            error_message:
              'Business Type must be Café, Restaurant, Food Chain, Hotel, or Others.',
          },
        });

        continue;
      }

      const existingLead =
        await prisma.lead.findUnique({
          where: {
            email,
          },
        });

      if (existingLead) {
        duplicates += 1;

        await prisma.importRow.create({
          data: {
            batch_id: batch.id,
            row_number: rowNumber,
            email,
            raw_data: rawData,
            import_status:
              'duplicate',
            error_message:
              'Email already exists in the database.',
          },
        });

        continue;
      }

      try {
        const jobTitle =
          getColumnValue(
            columns,
            indexes.job_title
          );

        const phone = getColumnValue(
          columns,
          indexes.phone
        );

        const website = getColumnValue(
          columns,
          indexes.website
        );

        const socialMediaUrl =
          getColumnValue(
            columns,
            indexes.social_media_url
          );

        const completeAddress =
          getColumnValue(
            columns,
            indexes.complete_address
          );

        const barangay =
          getColumnValue(
            columns,
            indexes.barangay
          );

        const province =
          getColumnValue(
            columns,
            indexes.province
          );

        const statusValue =
          getColumnValue(
            columns,
            indexes.status
          );

        const sourceValue =
          getColumnValue(
            columns,
            indexes.source
          );

        const interestLevel =
          normalizeInterestLevel(
            getColumnValue(
              columns,
              indexes.interest_level
            )
          );

        const convertedProductValue =
          getColumnValue(
            columns,
            indexes.converted_product
          );

        const preferredContactValue =
          getColumnValue(
            columns,
            indexes.preferred_contact_method
          );

        const preferredContactMethod =
          normalizePreferredContactMethod(
            preferredContactValue
          );

        const nextFollowUpDate =
          parseOptionalDate(
            getColumnValue(
              columns,
              indexes.next_follow_up_date
            )
          );

        const notes = getColumnValue(
          columns,
          indexes.notes
        );

        const tagNames = normalizeTags(
          getColumnValue(
            columns,
            indexes.tags
          )
        );

        if (
          preferredContactMethod ===
          undefined
        ) {
          throw new Error(
            'Preferred Contact Method must be Email, Phone, Facebook, Instagram, LinkedIn, or blank.'
          );
        }

        if (
          nextFollowUpDate === undefined
        ) {
          throw new Error(
            'Next Follow-up Date is invalid.'
          );
        }

        const selectedStatus =
          findStatus(statusValue);

        const selectedSource =
          findSource(sourceValue);

        const converted =
          isConvertedStatus(
            selectedStatus.status_name
          );

        const convertedProduct =
          converted
            ? normalizeConvertedProduct(
                convertedProductValue
              )
            : null;

        if (
          converted &&
          !convertedProduct
        ) {
          throw new Error(
            'Converted leads must use SnapServe Lite, SnapServe Full, or Others as the Converted Product.'
          );
        }

        const newLead =
          await prisma.$transaction(
            async (tx) => {
              const lead =
                await tx.lead.create({
                  data: {
                    company_name:
                      companyName,

                    business_type:
                      businessType,

                    first_name:
                      optionalText(
                        firstName
                      ),

                    last_name:
                      optionalText(lastName),

                    job_title:
                      optionalText(
                        jobTitle
                      ),

                    email,
                    phone:
                      optionalText(phone),

                    website:
                      optionalText(
                        website
                      ),

                    social_media_url:
                      optionalText(
                        socialMediaUrl
                      ),

                    complete_address:
                      optionalText(
                        completeAddress
                      ),

                    barangay:
                      optionalText(
                        barangay
                      ),

                    city,
                    province:
                      optionalText(
                        province
                      ),

                    country,

                    preferred_contact_method:
                      preferredContactMethod,

                    next_follow_up_date:
                      nextFollowUpDate,

                    interest_level:
                      interestLevel,

                    converted_product:
                      convertedProduct,

                    status_id:
                      selectedStatus.id,

                    source_id:
                      selectedSource.id,

                    assigned_user_id:
                      req.user.id,

                    created_by:
                      req.user.id,
                  },
                });

              for (const tagName of tagNames) {
                const tag =
                  await tx.leadTag.upsert({
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
                    lead_id: lead.id,
                    tag_id: tag.id,
                  },
                });
              }

              if (notes) {
                await tx.leadNote.create({
                  data: {
                    lead_id: lead.id,
                    user_id: req.user.id,
                    note: notes,
                  },
                });
              }

              const contactName = [
                lead.first_name,
                lead.last_name,
              ]
                .filter(Boolean)
                .join(' ');

              const leadDescription =
                contactName
                  ? `${contactName} at ${lead.company_name}`
                  : lead.company_name;

              await tx.leadActivity.create({
                data: {
                  lead_id: lead.id,
                  user_id: req.user.id,
                  activity_type:
                    'imported',
                  description: `Lead imported through Batch File Upload #${batch.id}: ${leadDescription}.`,
                },
              });

              if (
                converted &&
                convertedProduct
              ) {
                await tx.leadActivity.create({
                  data: {
                    lead_id: lead.id,
                    user_id: req.user.id,
                    activity_type:
                      'converted',
                    description: `Converted Product set to "${convertedProduct}".`,
                  },
                });
              }

              if (notes) {
                await tx.leadActivity.create({
                  data: {
                    lead_id: lead.id,
                    user_id: req.user.id,
                    activity_type: 'note',
                    description:
                      'Initial CRM note added during CSV import.',
                  },
                });
              }

              return lead;
            }
          );

        imported += 1;

        await prisma.importRow.create({
          data: {
            batch_id: batch.id,
            row_number: rowNumber,
            email,
            raw_data: rawData,
            import_status:
              'imported',
            lead_id: newLead.id,
          },
        });
      } catch (rowError) {
        console.error(
          `CSV import row ${rowNumber} failed:`,
          rowError
        );

        failed += 1;

        await prisma.importRow.create({
          data: {
            batch_id: batch.id,
            row_number: rowNumber,
            email,
            raw_data: rawData,
            import_status: 'failed',
            error_message:
              rowError.message ||
              'Failed to import row.',
          },
        });
      }
    }

    const finishedBatch =
      await prisma.importBatch.update({
        where: {
          id: batch.id,
        },

        data: {
          imported_count: imported,
          duplicate_count:
            duplicates,
          failed_count: failed,
          status: 'completed',
        },
      });

    return res.json(finishedBatch);
  } catch (error) {
    console.error(
      'CSV import error:',
      error
    );

    if (batchId) {
      await prisma.importBatch
        .update({
          where: {
            id: batchId,
          },

          data: {
            status: 'failed',
          },
        })
        .catch((batchError) => {
          console.error(
            'Failed to mark import batch as failed:',
            batchError
          );
        });
    }

    return res.status(500).json({
      error:
        'Failed to process the uploaded CSV file.',
    });
  }
};