import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FolderEdit, Info, X } from 'lucide-react';

const countries = [
  'United States',
  'United Kingdom',
  'Philippines',
  'India',
  'Brazil',
  'Netherlands',
  'Ghana',
  'Japan',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'Malaysia',
];

const COUNTRY_PHONE_PREFIX = {
  'United States': '+1',
  'United Kingdom': '+44',
  Philippines: '+63',
  India: '+91',
  Brazil: '+55',
  Netherlands: '+31',
  Ghana: '+233',
  Japan: '+81',
  Canada: '+1',
  Australia: '+61',
  Germany: '+49',
  France: '+33',
  Singapore: '+65',
  Malaysia: '+60',
};

const DEFAULT_INTEREST_LEVELS = [
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
];

const DEFAULT_BUSINESS_TYPES = [
  'Café',
  'Restaurant',
  'Food Chain',
  'Hotel',
  'Others',
];

const DEFAULT_CONVERTED_PRODUCTS = [
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

const normalizeExternalUrl = (value) => {
  const url = String(value || '').trim();

  if (!url) return '';

  return /^https?:\/\//i.test(url)
    ? url
    : `https://${url}`;
};

const createEmptyForm = () => ({
  company_name: '',
  business_type: '',
  source_id: '',
  interest_level: 'cold',
  status_id: '',
  converted_product: '',

  first_name: '',
  last_name: '',
  job_title: '',
  phone: '',
  email: '',
  website: '',
  social_media_url: '',

  complete_address: '',
  barangay: '',
  city: '',
  province: '',
  country: 'Philippines',

  assigned_user_id: '',
  preferred_contact_method: '',
  next_follow_up_date: '',
  notes: '',
});

const formatDateForInput = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

function SectionTitle({ number, title }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 shrink-0 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
  optional = false,
  info = false,
}) {
  return (
    <label className="flex flex-wrap items-center gap-1.5 mb-1.5 text-xs sm:text-sm font-medium text-slate-700">
      <span>
        {children}
        {required && ' *'}
      </span>

      {optional && (
        <span className="font-normal text-slate-400">
          (Optional)
        </span>
      )}

      {info && (
        <Info
          size={13}
          className="text-slate-400"
        />
      )}
    </label>
  );
}

function SocialPlatformButtons() {
  const platforms = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com',
      className:
        'bg-[#1877F2] hover:bg-[#166FE5] shadow-blue-500/20',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M13.5 8.5H16l.4-3h-2.9C10.5 5.5 9 7.3 9 10.2V13H6v3h3v8h3.5v-8h3l.5-3h-3.5v-2.4c0-1.4.4-2.1 2-2.1Z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com',
      className:
        'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-pink-500/20',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
          />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com',
      className:
        'bg-[#0A66C2] hover:bg-[#095BAA] shadow-blue-600/20',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M6.5 8.4H3.3V21h3.2V8.4ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.4H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.3-3.2 2 0 2 1.8 2 3.3V21H20v-7.2Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-10 px-2.5 shrink-0 flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50">
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noreferrer"
          title={`Open ${platform.name}`}
          aria-label={`Open ${platform.name}`}
          className={`h-7 w-7 rounded-lg text-white flex items-center justify-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${platform.className}`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}

export default function EditLeadModal({
  isOpen,
  leadId,
  onClose,
  onSaveSuccess,
}) {
  const [vars, setVars] = useState({
    statuses: [],
    sources: [],
    staff: [],
    interest_levels: DEFAULT_INTEREST_LEVELS,
    business_types: DEFAULT_BUSINESS_TYPES,
    converted_products: DEFAULT_CONVERTED_PRODUCTS,
  });

  const [form, setForm] = useState(createEmptyForm);
  const [tagInput, setTagInput] = useState('');
  const [tagChips, setTagChips] = useState([]);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const token = localStorage.getItem('lf_token');

    const loadData = async () => {
      setError('');
      setLoadingData(true);
      setTagInput('');
      setTagChips([]);

      try {
        const [variablesResponse, leadResponse] =
          await Promise.all([
            fetch('/api/leads/variables', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`/api/lead-details/${leadId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const variablesData =
          await variablesResponse.json();

        const lead = await leadResponse.json();

        if (!variablesResponse.ok) {
          throw new Error(
            variablesData.error ||
              'Failed to load lead form options.'
          );
        }

        if (!leadResponse.ok) {
          throw new Error(
            lead.error ||
              'Failed to load lead details.'
          );
        }

        const safeVariables = {
          statuses: Array.isArray(
            variablesData.statuses
          )
            ? variablesData.statuses
            : [],

          sources: Array.isArray(
            variablesData.sources
          )
            ? variablesData.sources
            : [],

          staff: Array.isArray(
            variablesData.staff
          )
            ? variablesData.staff
            : [],

          interest_levels:
            Array.isArray(
              variablesData.interest_levels
            ) &&
            variablesData.interest_levels.length > 0
              ? variablesData.interest_levels
              : DEFAULT_INTEREST_LEVELS,

          business_types:
            Array.isArray(
              variablesData.business_types
            ) &&
            variablesData.business_types.length > 0
              ? variablesData.business_types
              : DEFAULT_BUSINESS_TYPES,

          converted_products:
            Array.isArray(
              variablesData.converted_products
            ) &&
            variablesData.converted_products.length > 0
              ? variablesData.converted_products
              : DEFAULT_CONVERTED_PRODUCTS,
        };

        setVars(safeVariables);

        setForm({
          company_name: lead.company_name || '',
          business_type:
            lead.business_type || 'Others',
          source_id: lead.source_id || '',
          interest_level:
            lead.interest_level || 'cold',
          status_id: lead.status_id || '',
          converted_product:
            lead.converted_product || '',

          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          job_title: lead.job_title || '',
          phone: lead.phone || '',
          email: lead.email || '',
          website: lead.website || '',
          social_media_url:
            lead.social_media_url || '',

          complete_address:
            lead.complete_address || '',
          barangay: lead.barangay || '',
          city: lead.city || '',
          province: lead.province || '',
          country:
            lead.country || 'Philippines',

          assigned_user_id:
            lead.assigned_user_id || '',
          preferred_contact_method:
            lead.preferred_contact_method || '',
          next_follow_up_date:
            formatDateForInput(
              lead.next_follow_up_date
            ),
          notes: '',
        });

        const existingTags = Array.isArray(
          lead.tags
        )
          ? lead.tags
              .map(
                (item) =>
                  item?.tag?.tag_name ||
                  item?.tag_name
              )
              .filter(Boolean)
          : [];

        setTagChips(existingTags);
      } catch (loadError) {
        console.error(loadError);

        setError(
          loadError.message ||
            'Failed to load lead information.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  const selectedStatus = vars.statuses.find(
    (status) =>
      String(status.id) === String(form.status_id)
  );

  const isConvertedStatus =
    String(selectedStatus?.status_name || '')
      .trim()
      .toLowerCase() === 'converted';

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError('');
  };

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    const nextPrefix =
      COUNTRY_PHONE_PREFIX[selectedCountry] || '';

    setForm((previous) => {
      const previousPrefix =
        COUNTRY_PHONE_PREFIX[previous.country] || '';

      const currentPhone = String(
        previous.phone || ''
      ).trim();

      const shouldReplacePrefix =
        !currentPhone ||
        currentPhone === previousPrefix;

      return {
        ...previous,
        country: selectedCountry,
        phone: shouldReplacePrefix
          ? nextPrefix
          : previous.phone,
      };
    });

    setError('');
  };

  const handleStatusChange = (event) => {
    const selectedStatusId = event.target.value;

    const nextStatus = vars.statuses.find(
      (status) =>
        String(status.id) ===
        String(selectedStatusId)
    );

    const nextStatusIsConverted =
      String(nextStatus?.status_name || '')
        .trim()
        .toLowerCase() === 'converted';

    setForm((previous) => ({
      ...previous,
      status_id: selectedStatusId,
      converted_product: nextStatusIsConverted
        ? previous.converted_product ||
          vars.converted_products[0] ||
          ''
        : '',
    }));

    setError('');
  };

  const handleTagKeyDown = (event) => {
    if (
      event.key !== 'Enter' &&
      event.key !== ','
    ) {
      return;
    }

    event.preventDefault();

    const cleanTag = tagInput
      .trim()
      .replace(/,$/, '');

    if (
      cleanTag &&
      !tagChips.includes(cleanTag)
    ) {
      setTagChips((previous) => [
        ...previous,
        cleanTag,
      ]);
    }

    setTagInput('');
  };

  const removeTagChip = (indexToRemove) => {
    setTagChips((previous) =>
      previous.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const token = localStorage.getItem('lf_token');

    const payload = {
      ...form,
      converted_product: isConvertedStatus
        ? form.converted_product
        : '',
      tags: tagChips.join(','),
    };

    try {
      const response = await fetch(
        `/api/lead-details/${leadId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update lead.'
        );
      }

      onSaveSuccess?.(data);
      onClose();
    } catch (submitError) {
      console.error(submitError);

      setError(
        submitError.message ||
          'Failed to update lead.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full min-w-0 h-10 px-3 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

  const textareaClass =
    'w-full min-w-0 px-3 py-2.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-3">
      <div
        className="absolute inset-0 bg-slate-900/45"
        onClick={onClose}
      />

      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-24px)] sm:max-w-[1120px] bg-white sm:rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <header className="px-4 sm:px-6 py-3.5 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderEdit size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                Edit Lead
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 truncate">
                Update the selected lead profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Edit Lead form"
            className="h-9 w-9 shrink-0 rounded-lg text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={19} />
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex-1 min-h-0 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-5 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}

            {loadingData ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Loading lead information...
              </div>
            ) : (
              <>
                <section>
                  <SectionTitle
                    number="1"
                    title="Lead Information"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                    <div className="md:col-span-2">
                      <FieldLabel required>
                        Company Name
                      </FieldLabel>

                      <input
                        type="text"
                        required
                        placeholder="Enter company name"
                        className={inputClass}
                        value={form.company_name}
                        onChange={(event) =>
                          updateField(
                            'company_name',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel required>
                        Industry / Business Type
                      </FieldLabel>

                      <select
                        required
                        className={inputClass}
                        value={form.business_type}
                        onChange={(event) =>
                          updateField(
                            'business_type',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select industry / business type
                        </option>

                        {vars.business_types.map(
                          (businessType) => (
                            <option
                              key={businessType}
                              value={businessType}
                            >
                              {businessType}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>
                        Lead Source
                      </FieldLabel>

                      <select
                        className={inputClass}
                        value={form.source_id}
                        onChange={(event) =>
                          updateField(
                            'source_id',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select lead source
                        </option>

                        {vars.sources.map(
                          (source) => (
                            <option
                              key={source.id}
                              value={source.id}
                            >
                              {source.source_name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <FieldLabel info>
                        Interest Level
                      </FieldLabel>

                      <select
                        className={inputClass}
                        value={form.interest_level}
                        onChange={(event) =>
                          updateField(
                            'interest_level',
                            event.target.value
                          )
                        }
                      >
                        {vars.interest_levels.map(
                          (level) => (
                            <option
                              key={level.value}
                              value={level.value}
                            >
                              {level.label}
                            </option>
                          )
                        )}
                      </select>

                      <p className="mt-1 text-[11px] sm:text-xs leading-4 text-slate-400">
                        Cold — little/no response, Warm —
                        wants more information, Hot —
                        interested in demo, pricing, or
                        onboarding.
                      </p>
                    </div>

                    <div>
                      <FieldLabel>
                        Lead Status
                      </FieldLabel>

                      <select
                        className={inputClass}
                        value={form.status_id}
                        onChange={handleStatusChange}
                      >
                        <option value="">
                          Select lead status
                        </option>

                        {vars.statuses.map(
                          (status) => (
                            <option
                              key={status.id}
                              value={status.id}
                            >
                              {status.status_name}
                            </option>
                          )
                        )}
                      </select>

                      {isConvertedStatus && (
                        <div className="mt-3">
                          <FieldLabel required>
                            Converted Product
                          </FieldLabel>

                          <select
                            required
                            className={inputClass}
                            value={
                              form.converted_product
                            }
                            onChange={(event) =>
                              updateField(
                                'converted_product',
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Select converted product
                            </option>

                            {vars.converted_products.map(
                              (product) => (
                                <option
                                  key={product}
                                  value={product}
                                >
                                  {product}
                                </option>
                              )
                            )}
                          </select>

                          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                            Options: SnapServe Lite,
                            SnapServe Full, Others
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-200">
                  <SectionTitle
                    number="2"
                    title="Contact Person"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                    <div>
                      <FieldLabel>
                        First Name
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter first name"
                        className={inputClass}
                        value={form.first_name}
                        onChange={(event) =>
                          updateField(
                            'first_name',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Last Name
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter last name"
                        className={inputClass}
                        value={form.last_name}
                        onChange={(event) =>
                          updateField(
                            'last_name',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Job Title
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter job title"
                        className={inputClass}
                        value={form.job_title}
                        onChange={(event) =>
                          updateField(
                            'job_title',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Phone Number
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="+63 912 345 6789"
                        className={inputClass}
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            'phone',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel required>
                        Email Address
                      </FieldLabel>

                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        className={inputClass}
                        value={form.email}
                        onChange={(event) =>
                          updateField(
                            'email',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Website
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="https://company.com"
                        className={inputClass}
                        value={form.website}
                        onChange={(event) =>
                          updateField(
                            'website',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel optional>
                        Facebook / Instagram / LinkedIn Page
                      </FieldLabel>

                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 items-center">
  <SocialPlatformButtons />

  <input
    type="text"
    placeholder="Paste social media page or profile URL"
    className={inputClass}
    value={form.social_media_url}
    onChange={(event) =>
      updateField(
        'social_media_url',
        event.target.value
      )
    }
  />

  {form.social_media_url.trim() && (
    <a
      href={normalizeExternalUrl(
        form.social_media_url
      )}
      target="_blank"
      rel="noreferrer"
      className="col-span-2 sm:col-span-1 sm:col-start-2 h-10 px-4 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center hover:bg-blue-100"
    >
      Open Link
    </a>
  )}
</div>

                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Open a platform, copy the business
                        page URL, then paste it here.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-200">
                  <SectionTitle
                    number="3"
                    title="Address"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-3">
                    <div className="md:col-span-3">
                      <FieldLabel optional>
                        Complete Address
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter complete address"
                        className={inputClass}
                        value={
                          form.complete_address
                        }
                        onChange={(event) =>
                          updateField(
                            'complete_address',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel optional>
                        Barangay
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter barangay"
                        className={inputClass}
                        value={form.barangay}
                        onChange={(event) =>
                          updateField(
                            'barangay',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel required>
                        City
                      </FieldLabel>

                      <input
                        type="text"
                        required
                        placeholder="Enter city"
                        className={inputClass}
                        value={form.city}
                        onChange={(event) =>
                          updateField(
                            'city',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel optional>
                        Province
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Enter province"
                        className={inputClass}
                        value={form.province}
                        onChange={(event) =>
                          updateField(
                            'province',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-3">
                      <FieldLabel required>
                        Country
                      </FieldLabel>

                      <select
                        required
                        className={inputClass}
                        value={form.country}
                        onChange={handleCountryChange}
                      >
                        {countries.map((country) => (
                          <option
                            key={country}
                            value={country}
                          >
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-200">
                  <SectionTitle
                    number="4"
                    title="CRM Details"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-3">
                    <div>
                      <FieldLabel>
                        Assigned To / Lead Owner
                      </FieldLabel>

                      <select
                        className={inputClass}
                        value={
                          form.assigned_user_id
                        }
                        onChange={(event) =>
                          updateField(
                            'assigned_user_id',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select owner
                        </option>

                        {vars.staff.map((staff) => (
                          <option
                            key={staff.id}
                            value={staff.id}
                          >
                            {staff.first_name}{' '}
                            {staff.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>
                        Preferred Contact Method
                      </FieldLabel>

                      <select
                        className={inputClass}
                        value={
                          form.preferred_contact_method
                        }
                        onChange={(event) =>
                          updateField(
                            'preferred_contact_method',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select preferred contact method
                        </option>

                        {PREFERRED_CONTACT_METHODS.map(
                          (method) => (
                            <option
                              key={method}
                              value={method}
                            >
                              {method}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>
                        Next Follow-up Date
                      </FieldLabel>

                      <input
                        type="date"
                        className={inputClass}
                        value={
                          form.next_follow_up_date
                        }
                        onChange={(event) =>
                          updateField(
                            'next_follow_up_date',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-3">
                      <FieldLabel optional>
                        Add Note
                      </FieldLabel>

                      <textarea
                        rows={3}
                        maxLength={1000}
                        placeholder="Add a new internal note..."
                        className={`${textareaClass} resize-none`}
                        value={form.notes}
                        onChange={(event) =>
                          updateField(
                            'notes',
                            event.target.value
                          )
                        }
                      />

                      <p className="mt-1 text-right text-[11px] text-slate-400">
                        {form.notes.length}/1000
                      </p>
                    </div>

                    <div className="md:col-span-3">
                      <FieldLabel optional>
                        Tags
                      </FieldLabel>

                      <input
                        type="text"
                        placeholder="Type a tag and press Enter"
                        className={inputClass}
                        value={tagInput}
                        onChange={(event) =>
                          setTagInput(
                            event.target.value
                          )
                        }
                        onKeyDown={handleTagKeyDown}
                      />

                      {tagChips.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tagChips.map(
                            (tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {tag}

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeTagChip(
                                      index
                                    )
                                  }
                                  aria-label={`Remove ${tag}`}
                                  className="hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          <footer className="px-4 sm:px-6 py-3 shrink-0 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto sm:min-w-[115px] px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingData}
              className="w-full sm:w-auto sm:min-w-[140px] px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : 'Save Updates'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}