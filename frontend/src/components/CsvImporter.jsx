import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Mail,
  MapPin,
  Package,
  Upload,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

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

const normalizeHeader = (header) => {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const getValue = (row, keys) => {
  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null
    ) {
      return String(row[key]).trim();
    }
  }

  return '';
};

const normalizeInterestLevel = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  return ['cold', 'warm', 'hot'].includes(normalized)
    ? normalized
    : 'cold';
};

const normalizeSource = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

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

  return String(value || '').trim() || 'Others';
};

const normalizeBusinessType = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  const matchedType = BUSINESS_TYPES.find(
    (type) => type.toLowerCase() === normalized
  );

  return matchedType || 'Others';
};

const normalizeConvertedProduct = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  const matchedProduct = CONVERTED_PRODUCTS.find(
    (product) =>
      product.toLowerCase() === normalized
  );

  return matchedProduct || '';
};

const normalizePreferredContact = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  const methods = {
    email: 'Email',
    phone: 'Phone',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  };

  return methods[normalized] || '';
};

const normalizeDateValue = (value) => {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    const parsedDate =
      XLSX.SSF.parse_date_code(value);

    if (parsedDate) {
      const month = String(parsedDate.m).padStart(
        2,
        '0'
      );

      const day = String(parsedDate.d).padStart(
        2,
        '0'
      );

      return `${parsedDate.y}-${month}-${day}`;
    }
  }

  const stringValue = String(value).trim();

  const date = new Date(stringValue);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return stringValue;
};

const escapeCsv = (value) => {
  return `"${String(value ?? '').replace(
    /"/g,
    '""'
  )}"`;
};

export default function CsvImporter({
  onCompleted,
}) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] =
    useState(false);
  const [view, setView] = useState('upload');
  const [loading, setLoading] =
    useState(false);
  const [checking, setChecking] =
    useState(false);
  const [summary, setSummary] =
    useState(null);
  const [error, setError] = useState('');
  const [previewRows, setPreviewRows] =
    useState([]);

  const readFileRows = async (
    selectedFile
  ) => {
    const extension = selectedFile.name
      .split('.')
      .pop()
      .toLowerCase();

    if (extension === 'csv') {
      const text =
        await selectedFile.text();

      const workbook = XLSX.read(text, {
        type: 'string',
        cellDates: true,
      });

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      return XLSX.utils.sheet_to_json(
        sheet,
        {
          defval: '',
          raw: false,
        }
      );
    }

    const buffer =
      await selectedFile.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
    });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    return XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    });
  };

  const formatRows = (rawRows) => {
    return rawRows
      .map((raw, index) => {
        const normalized = {};

        Object.keys(raw).forEach((key) => {
          normalized[
            normalizeHeader(key)
          ] = raw[key];
        });

        const companyName = getValue(
          normalized,
          ['company_name', 'company']
        );

        const businessType =
          normalizeBusinessType(
            getValue(normalized, [
              'business_type',
              'industry',
              'industry_business_type',
              'company_type',
            ])
          );

        const firstName = getValue(
          normalized,
          [
            'first_name',
            'firstname',
            'first',
          ]
        );

        const lastName = getValue(
          normalized,
          [
            'last_name',
            'lastname',
            'last',
          ]
        );

        const jobTitle = getValue(
          normalized,
          [
            'job_title',
            'title',
            'position',
          ]
        );

        const email = getValue(normalized, [
          'email',
          'email_address',
        ]).toLowerCase();

        const phone = getValue(normalized, [
          'phone',
          'phone_number',
          'contact',
        ]);

        const website = getValue(
          normalized,
          ['website', 'site']
        );

        const socialMediaUrl = getValue(
          normalized,
          [
            'social_media_url',
            'social_url',
            'social_media',
            'facebook_instagram_linkedin',
            'social_page',
          ]
        );

        const completeAddress = getValue(
          normalized,
          [
            'complete_address',
            'full_address',
            'address',
          ]
        );

        const barangay = getValue(
          normalized,
          ['barangay', 'brgy']
        );

        const city = getValue(normalized, [
          'city',
          'municipality',
        ]);

        const province = getValue(
          normalized,
          ['province', 'state']
        );

        const country = getValue(
          normalized,
          ['country']
        );

        const source = normalizeSource(
          getValue(normalized, [
            'source',
            'lead_source',
            'source_name',
          ])
        );

        const status =
          getValue(normalized, [
            'status',
            'lead_status',
          ]) || 'New';

        const interestLevel =
          normalizeInterestLevel(
            getValue(normalized, [
              'interest_level',
              'interest',
            ])
          );

        const convertedProduct =
          normalizeConvertedProduct(
            getValue(normalized, [
              'converted_product',
              'product',
              'converted_to',
            ])
          );

        const preferredContact =
          normalizePreferredContact(
            getValue(normalized, [
              'preferred_contact_method',
              'preferred_contact',
              'contact_method',
            ])
          );

        const followUpDate =
          normalizeDateValue(
            normalized.next_follow_up_date ??
              normalized.follow_up_date ??
              normalized.next_followup ??
              ''
          );

        const notes = getValue(
          normalized,
          ['notes', 'note', 'remarks']
        );

        const tags = getValue(normalized, [
          'tags',
          'tag',
        ]);

        const validationErrors = [];

        if (!companyName) {
          validationErrors.push(
            'missing company name'
          );
        }

        if (!email) {
          validationErrors.push(
            'missing email'
          );
        }

        if (!city) {
          validationErrors.push(
            'missing city'
          );
        }

        if (!country) {
          validationErrors.push(
            'missing country'
          );
        }

        if (
          status.toLowerCase() ===
            'converted' &&
          !convertedProduct
        ) {
          validationErrors.push(
            'missing converted product'
          );
        }

        return {
          id: index + 1,
          company_name: companyName,
          business_type: businessType,
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          email,
          phone,
          website,
          social_media_url:
            socialMediaUrl,
          complete_address:
            completeAddress,
          barangay,
          city,
          province,
          country,
          source,
          status,
          interest_level:
            interestLevel,
          converted_product:
            convertedProduct,
          preferred_contact_method:
            preferredContact,
          next_follow_up_date:
            followUpDate,
          notes,
          tags,
          duplicate: false,
          duplicateReason: '',
          invalid:
            validationErrors.length > 0,
          validationReason:
            validationErrors.join(', '),
        };
      })
      .filter((row) => {
        return (
          row.company_name ||
          row.email ||
          row.first_name ||
          row.last_name
        );
      });
  };

  const checkDuplicateEmail = async (
    email
  ) => {
    if (!email) return false;

    const token =
      localStorage.getItem('lf_token');

    const response = await fetch(
      `/api/leads?search=${encodeURIComponent(
        email
      )}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    const leads = Array.isArray(data)
      ? data
      : Array.isArray(data.leads)
        ? data.leads
        : [];

    return leads.some(
      (lead) =>
        String(
          lead.email || ''
        ).toLowerCase() ===
        email.toLowerCase()
    );
  };

  const detectDuplicates = async (
    rows
  ) => {
    const emailCounter = {};

    rows.forEach((row) => {
      const email = String(
        row.email || ''
      ).toLowerCase();

      if (!email) return;

      emailCounter[email] =
        (emailCounter[email] || 0) + 1;
    });

    const uniqueEmails = [
      ...new Set(
        rows
          .map((row) =>
            String(
              row.email || ''
            ).toLowerCase()
          )
          .filter(Boolean)
      ),
    ];

    const existingEmailMap = {};

    await Promise.all(
      uniqueEmails.map(async (email) => {
        existingEmailMap[email] =
          await checkDuplicateEmail(email);
      })
    );

    return rows.map((row) => {
      const email = String(
        row.email || ''
      ).toLowerCase();

      if (!email) {
        return {
          ...row,
          duplicate: false,
          duplicateReason: '',
        };
      }

      if (emailCounter[email] > 1) {
        return {
          ...row,
          duplicate: true,
          duplicateReason:
            'duplicate in file',
        };
      }

      if (existingEmailMap[email]) {
        return {
          ...row,
          duplicate: true,
          duplicateReason:
            'already exists in CRM',
        };
      }

      return {
        ...row,
        duplicate: false,
        duplicateReason: '',
      };
    });
  };

  const handleFileSelect = async (
    selectedFile
  ) => {
    setError('');
    setSummary(null);

    if (!selectedFile) return;

    const allowed = [
      'csv',
      'xlsx',
      'xls',
    ];

    const extension = selectedFile.name
      .split('.')
      .pop()
      .toLowerCase();

    if (!allowed.includes(extension)) {
      setError(
        'Only CSV or Excel files are allowed.'
      );

      return;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      setError(
        'File size must not exceed 10 MB.'
      );

      return;
    }

    setFile(selectedFile);
    setChecking(true);

    try {
      const rawRows =
        await readFileRows(selectedFile);

      const formattedRows =
        formatRows(rawRows);

      if (!formattedRows.length) {
        throw new Error(
          'No valid rows were found in the file.'
        );
      }

      const checkedRows =
        await detectDuplicates(
          formattedRows
        );

      setPreviewRows(checkedRows);
      setView('preview');
    } catch (fileError) {
      console.error(fileError);

      setError(
        fileError.message ||
          'Failed to read the uploaded file.'
      );

      setFile(null);
      setPreviewRows([]);
      setView('upload');
    } finally {
      setChecking(false);
    }
  };

  const onFileChange = (event) => {
    handleFileSelect(
      event.target.files?.[0]
    );
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    handleFileSelect(
      event.dataTransfer.files?.[0]
    );
  };

  const downloadTemplate = () => {
    const headers = [
      'company_name',
      'business_type',
      'first_name',
      'last_name',
      'job_title',
      'email',
      'phone',
      'website',
      'social_media_url',
      'complete_address',
      'barangay',
      'city',
      'province',
      'country',
      'source',
      'status',
      'interest_level',
      'converted_product',
      'preferred_contact_method',
      'next_follow_up_date',
      'notes',
      'tags',
    ];

    const sampleRows = [
      [
        'Acme Café',
        'Café',
        'Sarah',
        'Chen',
        'Owner',
        'sarah@acmecafe.com',
        '+63 912 345 6789',
        'https://acmecafe.com',
        'https://facebook.com/acmecafe',
        'Unit 8, ACB Building',
        'Kasambagan',
        'Cebu City',
        'Cebu',
        'Philippines',
        'Facebook (FB)',
        'New',
        'warm',
        '',
        'Email',
        '2026-07-30',
        'Interested in learning more.',
        'Cafe|Cebu',
      ],

      [
        'Nova Restaurant',
        'Restaurant',
        '',
        '',
        '',
        'contact@novarestaurant.com',
        '+63 917 555 0199',
        'https://novarestaurant.com',
        'https://instagram.com/novarestaurant',
        'Pajac Road',
        'Pajac',
        'Lapu-Lapu City',
        'Cebu',
        'Philippines',
        'Instagram (IG)',
        'Converted',
        'hot',
        'SnapServe Lite',
        'Instagram',
        '2026-08-05',
        'Converted after product demonstration.',
        'Restaurant|Converted',
      ],
    ];

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...sampleRows.map((row) =>
        row.map(escapeCsv).join(',')
      ),
    ].join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      'leadflow_template.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const rowsToCsvFile = (
    rows,
    fileName
  ) => {
    const headers = [
      'company_name',
      'business_type',
      'first_name',
      'last_name',
      'job_title',
      'email',
      'phone',
      'website',
      'social_media_url',
      'complete_address',
      'barangay',
      'city',
      'province',
      'country',
      'source',
      'status',
      'interest_level',
      'converted_product',
      'preferred_contact_method',
      'next_follow_up_date',
      'notes',
      'tags',
    ];

    const csv = [
      headers.join(','),

      ...rows.map((row) => {
        return [
          row.company_name,
          row.business_type,
          row.first_name,
          row.last_name,
          row.job_title,
          row.email,
          row.phone,
          row.website,
          row.social_media_url,
          row.complete_address,
          row.barangay,
          row.city,
          row.province,
          row.country,
          row.source,
          row.status,
          row.interest_level,
          row.converted_product,
          row.preferred_contact_method,
          row.next_follow_up_date,
          row.notes,
          row.tags,
        ]
          .map(escapeCsv)
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    return new File(
      [blob],
      fileName,
      {
        type: 'text/csv',
      }
    );
  };

  const resetImport = () => {
    setFile(null);
    setView('upload');
    setSummary(null);
    setError('');
    setPreviewRows([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadRows = async (
    importOnlyValid
  ) => {
    const rowsToImport = importOnlyValid
      ? previewRows.filter(
          (row) =>
            !row.duplicate &&
            !row.invalid
        )
      : previewRows;

    if (!rowsToImport.length) {
      setError(
        'No rows are available to import.'
      );

      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    const token =
      localStorage.getItem('lf_token');

    const formData = new FormData();

    const csvFile = rowsToCsvFile(
      rowsToImport,
      importOnlyValid
        ? 'leadflow_valid_import.csv'
        : 'leadflow_full_import.csv'
    );

    formData.append('file', csvFile);

    try {
      const response = await fetch(
        '/api/imports/csv',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to import the file.'
        );
      }

      setSummary(data);
      setFile(null);
      setView('success');

      onCompleted?.();
    } catch (importError) {
      console.error(importError);

      setError(
        importError.message ||
          'Import failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const value = String(
      status || ''
    ).toLowerCase();

    if (value.includes('converted')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (value.includes('demo')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }

    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const duplicateCount =
    previewRows.filter(
      (row) => row.duplicate
    ).length;

  const invalidCount =
    previewRows.filter(
      (row) => row.invalid
    ).length;

  const importableCount =
    previewRows.filter(
      (row) =>
        !row.duplicate &&
        !row.invalid
    ).length;

  return (
    <div className="w-full min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          Import Leads from CSV / Excel
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Upload leads in bulk. Duplicate
          emails and missing required fields
          are checked before import.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle
            size={16}
            className="shrink-0 mt-0.5"
          />

          <span>{error}</span>
        </div>
      )}

      {checking && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          Reading the file and checking
          duplicate emails...
        </div>
      )}

      {view === 'upload' && (
        <UploadBox
          dragging={dragging}
          setDragging={setDragging}
          onDrop={onDrop}
          fileInputRef={fileInputRef}
          onFileChange={onFileChange}
          downloadTemplate={
            downloadTemplate
          }
        />
      )}

      {view === 'preview' && (
        <div className="space-y-4 min-w-0">
          {(duplicateCount > 0 ||
            invalidCount > 0) && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle size={16} />

                <span>
                  {duplicateCount} duplicate
                  {duplicateCount === 1
                    ? ''
                    : 's'}{' '}
                  and {invalidCount} invalid row
                  {invalidCount === 1
                    ? ''
                    : 's'}{' '}
                  found
                </span>
              </div>

              <p className="text-xs text-amber-700 mt-1 ml-6">
                Invalid or duplicate rows can
                be skipped before importing.
              </p>
            </div>
          )}

          {file && (
            <div className="inline-flex max-w-full items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              <FileSpreadsheet
                size={15}
                className="shrink-0"
              />

              <span className="truncate">
                {file.name}
              </span>

              <button
                type="button"
                onClick={resetImport}
                aria-label="Remove uploaded file"
                className="shrink-0 text-blue-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Phone and tablet cards */}
          <div className="lg:hidden space-y-3">
            {previewRows.map((row) => (
              <PreviewCard
                key={row.id}
                row={row}
                statusBadge={statusBadge}
              />
            ))}
          </div>

          {/* Desktop preview table */}
          <div className="hidden lg:block border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Company
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Contact
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Email
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Location
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Result
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {previewRows.map((row) => {
                    const hasProblem =
                      row.duplicate ||
                      row.invalid;

                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-100 ${
                          hasProblem
                            ? 'bg-red-50'
                            : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {row.company_name ||
                              '—'}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {row.business_type}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {[
                            row.first_name,
                            row.last_name,
                          ]
                            .filter(Boolean)
                            .join(' ') || '—'}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-700 break-all">
                          {row.email ||
                            'No email'}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {[
                            row.city,
                            row.province,
                            row.country,
                          ]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-md border text-xs font-medium ${statusBadge(
                              row.status
                            )}`}
                          >
                            {row.status ||
                              'New'}
                          </span>

                          <p className="text-[11px] text-slate-400 mt-1 capitalize">
                            {row.interest_level}{' '}
                            · {row.source}
                          </p>

                          {row.converted_product && (
                            <p className="text-[11px] text-blue-600 mt-1">
                              {
                                row.converted_product
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {row.duplicate && (
                            <ProblemBadge>
                              {
                                row.duplicateReason
                              }
                            </ProblemBadge>
                          )}

                          {row.invalid && (
                            <ProblemBadge>
                              {
                                row.validationReason
                              }
                            </ProblemBadge>
                          )}

                          {!hasProblem && (
                            <span className="inline-flex px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-1">
            <button
              type="button"
              disabled={
                loading ||
                importableCount === 0
              }
              onClick={() =>
                uploadRows(true)
              }
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {loading
                ? 'Processing...'
                : `Import Valid Rows (${importableCount})`}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                uploadRows(false)
              }
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? 'Importing...'
                : `Import All (${previewRows.length})`}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={resetImport}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="space-y-4">
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <CheckCircle size={16} />
              Import completed
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              <SummaryBox
                label="Total"
                value={
                  summary?.total_rows ?? 0
                }
              />

              <SummaryBox
                label="Imported"
                value={
                  summary?.imported_count ??
                  0
                }
                color="text-emerald-600"
              />

              <SummaryBox
                label="Duplicates"
                value={
                  summary?.duplicate_count ??
                  0
                }
                color="text-amber-600"
              />

              <SummaryBox
                label="Failed"
                value={
                  summary?.failed_count ?? 0
                }
                color="text-red-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetImport}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

function UploadBox({
  dragging,
  setDragging,
  onDrop,
  fileInputRef,
  onFileChange,
  downloadTemplate,
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() =>
        setDragging(false)
      }
      onDrop={onDrop}
      className={`relative min-h-[255px] px-5 py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition ${
        dragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="h-14 w-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Upload size={26} />
      </div>

      <p className="text-sm font-semibold text-slate-900">
        Drag and drop your CSV or Excel
        file here
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Supports .csv, .xlsx, and .xls —
        maximum 10 MB
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Browse File
        </button>

        <button
          type="button"
          onClick={downloadTemplate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          <Download size={15} />
          Download Template
        </button>
      </div>
    </div>
  );
}

function PreviewCard({
  row,
  statusBadge,
}) {
  const hasProblem =
    row.duplicate || row.invalid;

  return (
    <article
      className={`rounded-xl border p-4 ${
        hasProblem
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 break-words">
            {row.company_name || '—'}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {row.business_type}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex px-2 py-1 rounded-md border text-xs font-medium ${statusBadge(
            row.status
          )}`}
        >
          {row.status || 'New'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <PreviewInfo
          icon={Mail}
          label="Email"
          value={row.email || '—'}
        />

        <PreviewInfo
          icon={Building2}
          label="Contact"
          value={
            [
              row.first_name,
              row.last_name,
            ]
              .filter(Boolean)
              .join(' ') || '—'
          }
        />

        <PreviewInfo
          icon={MapPin}
          label="Location"
          value={
            [
              row.city,
              row.province,
              row.country,
            ]
              .filter(Boolean)
              .join(', ') || '—'
          }
        />

        <PreviewInfo
          icon={Package}
          label="Converted Product"
          value={
            row.converted_product || '—'
          }
        />
      </div>

      <p className="text-xs text-slate-400 capitalize mt-4">
        {row.interest_level} · {row.source}
      </p>

      {(row.duplicate || row.invalid) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {row.duplicate && (
            <ProblemBadge>
              {row.duplicateReason}
            </ProblemBadge>
          )}

          {row.invalid && (
            <ProblemBadge>
              {row.validationReason}
            </ProblemBadge>
          )}
        </div>
      )}
    </article>
  );
}

function PreviewInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon
        size={15}
        className="text-slate-400 mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm text-slate-700 mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProblemBadge({ children }) {
  return (
    <span className="inline-flex px-2 py-1 rounded-md bg-red-100 border border-red-200 text-[10px] text-red-700">
      {children}
    </span>
  );
}

function SummaryBox({
  label,
  value,
  color = 'text-slate-900',
}) {
  return (
    <div className="bg-white border border-emerald-100 rounded-lg p-3">
      <p
        className={`text-lg font-bold ${color}`}
      >
        {value}
      </p>

      <p className="text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}