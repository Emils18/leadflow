import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock3,
  FileText,
  Globe,
  Link2,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  Tag,
  X,
} from 'lucide-react';

const getLeadDisplayName = (lead) => {
  const contactName = `${lead?.first_name || ''} ${
    lead?.last_name || ''
  }`.trim();

  return (
    contactName ||
    lead?.company_name ||
    'Unnamed Lead'
  );
};

const normalizeUrl = (value) => {
  const url = String(value || '').trim();

  if (!url) return '';

  return /^https?:\/\//i.test(url)
    ? url
    : `https://${url}`;
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const replaceLeadVariables = (value, lead) => {
  const replacements = {
    first_name:
      lead?.first_name ||
      lead?.company_name ||
      '',
    last_name: lead?.last_name || '',
    company: lead?.company_name || '',
    company_name: lead?.company_name || '',
    email: lead?.email || '',
    job_title: lead?.job_title || '',
  };

  return String(value || '').replace(
    /\{\{\s*(first_name|last_name|company|company_name|email|job_title)\s*\}\}/gi,
    (_, key) =>
      replacements[key.toLowerCase()] || ''
  );
};

export default function LeadDetails({
  leadId,
  onBack,
  emailTemplates = [],
  senderEmail = '',
  canSendEmail = true,
  onSendEmail,
}) {
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] =
    useState(false);
  const [emailNotice, setEmailNotice] =
    useState('');

  const fetchProfile = async () => {
    const token =
      localStorage.getItem('lf_token');

    try {
      setLoading(true);

      const response = await fetch(
        `/api/lead-details/${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setLead(response.ok ? data : null);
    } catch (error) {
      console.error(error);
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [leadId]);

  const onAddNote = async (event) => {
    event.preventDefault();

    if (!note.trim()) return;

    const token =
      localStorage.getItem('lf_token');

    try {
      const response = await fetch(
        `/api/lead-details/${leadId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note }),
        }
      );

      if (response.ok) {
        setNote('');
        fetchProfile();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailRecorded = (
    historyItem
  ) => {
    onSendEmail?.(historyItem);
    setEmailModalOpen(false);
    setEmailNotice(
      'Email saved to Email History.'
    );
  };

  const getInitials = () => {
    const contactInitials = `${
      lead?.first_name?.[0] || ''
    }${lead?.last_name?.[0] || ''}`;

    if (contactInitials) {
      return contactInitials.toUpperCase();
    }

    return String(
      lead?.company_name || 'LF'
    )
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusStyle = (
    statusName = ''
  ) => {
    const name =
      statusName.toLowerCase();

    if (name.includes('converted')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (name.includes('demo')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }

    if (name.includes('replied')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }

    if (
      name.includes('emailed') &&
      !name.includes('not')
    ) {
      return 'bg-violet-50 text-violet-700 border-violet-200';
    }

    if (name.includes('follow')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    if (
      name.includes('not interested')
    ) {
      return 'bg-red-50 text-red-700 border-red-200';
    }

    if (name.includes('not emailed')) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }

    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getInterestStyle = (
    interestLevel = ''
  ) => {
    const value = String(
      interestLevel
    ).toLowerCase();

    if (value === 'hot') {
      return 'bg-red-50 text-red-700 border-red-200';
    }

    if (value === 'warm') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return 'bg-sky-50 text-sky-700 border-sky-200';
  };

  const formatInterestLevel = (
    interestLevel
  ) => {
    if (!interestLevel) return '—';

    const value = String(
      interestLevel
    ).toLowerCase();

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-500">
          Lead not found.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const displayName =
    getLeadDisplayName(lead);

  const assignedName =
    lead.assigned_to
      ? `${
          lead.assigned_to.first_name ||
          ''
        } ${
          lead.assigned_to.last_name ||
          ''
        }`.trim() ||
        lead.assigned_to.email
      : 'Unassigned';

  return (
    <div className="space-y-5 min-w-0">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Leads
      </button>

      {emailNotice && (
        <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
          {emailNotice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] gap-5 min-w-0">
        <div className="space-y-5 min-w-0">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 shrink-0 rounded-full bg-cyan-600 text-white flex items-center justify-center text-lg font-bold">
                  {getInitials()}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900 break-words">
                    {displayName}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 break-words">
                    {lead.job_title
                      ? `${lead.job_title} at ${lead.company_name}`
                      : displayName ===
                          lead.company_name
                        ? lead.business_type ||
                          'Company lead'
                        : lead.company_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:justify-end gap-2">
                {canSendEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailNotice('');
                      setEmailModalOpen(
                        true
                      );
                    }}
                    disabled={!lead.email}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={15} />
                    Send Email
                  </button>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-md border text-sm font-medium ${getStatusStyle(
                      lead.status
                        ?.status_name
                    )}`}
                  >
                    {lead.status
                      ?.status_name ||
                      'New'}
                  </span>

                  <span
                    className={`inline-flex px-3 py-1 rounded-md border text-sm font-medium ${getInterestStyle(
                      lead.interest_level
                    )}`}
                  >
                    {formatInterestLevel(
                      lead.interest_level
                    )}
                  </span>
                </div>
              </div>
            </div>

            {lead.converted_product && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex justify-start lg:justify-end">
                <div className="inline-flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50/60 text-sm">
                  <Package
                    size={15}
                    className="text-slate-400"
                  />

                  <span className="text-slate-500">
                    Converted Product:
                  </span>

                  <span className="font-semibold text-blue-700">
                    {
                      lead.converted_product
                    }
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Contact & Company
                Information
              </h3>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard
                  icon={Mail}
                  label="Email"
                  value={
                    lead.email ||
                    'No email address'
                  }
                />

                <InfoCard
                  icon={Phone}
                  label="Phone"
                  value={
                    lead.phone ||
                    'No phone number'
                  }
                />

                <InfoCard
                  icon={Building2}
                  label="Company"
                  value={
                    lead.company_name
                  }
                />

                <InfoCard
                  icon={Tag}
                  label="Industry / Business Type"
                  value={
                    lead.business_type ||
                    'Not specified'
                  }
                />

                <InfoCard
                  icon={Globe}
                  label="Website"
                  value={
                    lead.website ||
                    'No website'
                  }
                  href={normalizeUrl(
                    lead.website
                  )}
                />

                <InfoCard
                  icon={Link2}
                  label="Social Page"
                  value={
                    lead.social_media_url ||
                    'No social page'
                  }
                  href={normalizeUrl(
                    lead.social_media_url
                  )}
                />
              </div>

              <InfoCard
                icon={MapPin}
                label="Complete Address"
                value={
                  lead.complete_address ||
                  'No complete address'
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <AddressCard
                  label="Barangay"
                  value={
                    lead.barangay || '—'
                  }
                />

                <AddressCard
                  label="City"
                  value={lead.city || '—'}
                />

                <AddressCard
                  label="Province"
                  value={
                    lead.province || '—'
                  }
                />

                <AddressCard
                  label="Country"
                  value={
                    lead.country || '—'
                  }
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                CRM Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
              <CrmItem
                label="Lead Source"
                value={
                  lead.source
                    ?.source_name || '—'
                }
              />

              <CrmItem
                label="Assigned To"
                value={assignedName}
              />

              <CrmItem
                label="Preferred Contact"
                value={
                  lead.preferred_contact_method ||
                  '—'
                }
              />

              <CrmItem
                label="Next Follow-up Date"
                value={formatDate(
                  lead.next_follow_up_date
                )}
                icon={Calendar}
              />

              <CrmItem
                label="Created"
                value={formatDate(
                  lead.created_at
                )}
                icon={Calendar}
                last
              />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <FileText
                size={18}
                className="text-slate-400"
              />

              <h3 className="text-lg font-semibold text-slate-900">
                Notes
              </h3>
            </div>

            <div className="p-4 sm:p-5">
              <form
                onSubmit={onAddNote}
                className="flex flex-col sm:flex-row gap-3 mb-5"
              >
                <input
                  type="text"
                  placeholder="Add an internal note..."
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  <Send size={15} />
                  Post Note
                </button>
              </form>

              <div className="space-y-3">
                {!lead.notes?.length ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No notes yet.
                  </p>
                ) : (
                  lead.notes.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 border border-slate-100 rounded-lg p-4 min-w-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.user
                              ?.first_name ||
                              'User'}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatDateTime(
                              item.created_at
                            )}
                          </p>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed break-words">
                          {item.note}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm self-start overflow-hidden min-w-0 xl:sticky xl:top-0">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <Clock3
              size={18}
              className="text-slate-400"
            />

            <h3 className="text-lg font-semibold text-slate-900">
              Activity Timeline
            </h3>
          </div>

          <div className="p-4 sm:p-5">
            {!lead.activities?.length ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No activities yet.
              </p>
            ) : (
              <div className="space-y-5">
                {lead.activities.map(
                  (activity, index) => (
                    <div
                      key={activity.id}
                      className="relative pl-6 min-w-0"
                    >
                      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                      {index <
                        lead.activities
                          .length -
                          1 && (
                        <div className="absolute left-[5px] top-5 bottom-[-22px] w-px bg-slate-200" />
                      )}

                      <p className="text-sm text-slate-700 leading-relaxed break-words">
                        {
                          activity.description
                        }
                      </p>

                      <p className="text-xs text-slate-400 mt-1.5">
                        {formatDateTime(
                          activity.created_at
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {emailModalOpen && (
        <LeadEmailModal
          lead={lead}
          templates={emailTemplates}
          senderEmail={senderEmail}
          onClose={() =>
            setEmailModalOpen(false)
          }
          onSend={handleEmailRecorded}
        />
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  href = '',
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 min-w-0">
      <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">
          {label}
        </p>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-blue-700 font-semibold mt-1 break-all hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-slate-800 font-semibold mt-1 break-words">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function AddressCard({ label, value }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 min-w-0">
      <MapPin
        size={17}
        className="text-slate-400 mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">
          {label}
        </p>

        <p className="text-sm text-slate-800 font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function CrmItem({
  label,
  value,
  icon: Icon,
  last = false,
}) {
  return (
    <div
      className={`p-4 min-w-0 ${
        last
          ? ''
          : 'border-b sm:border-b-0 sm:border-r border-slate-200'
      }`}
    >
      <p className="text-xs text-slate-400 font-medium">
        {label}
      </p>

      <div className="flex items-center gap-1.5 mt-1">
        {Icon && (
          <Icon
            size={14}
            className="text-slate-400 shrink-0"
          />
        )}

        <p className="text-sm text-slate-800 font-semibold break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function LeadEmailModal({
  lead,
  templates,
  senderEmail,
  onClose,
  onSend,
}) {
  const [
    selectedTemplateId,
    setSelectedTemplateId,
  ] = useState('');

  const [subject, setSubject] =
    useState('');
  const [body, setBody] = useState('');
  const [error, setError] =
    useState('');

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleEscape
      );
  }, [onClose]);

  const applyTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setError('');

    if (!templateId) {
      setSubject('');
      setBody('');
      return;
    }

    const template = templates.find(
      (item) =>
        String(item.id) ===
        String(templateId)
    );

    if (!template) return;

    setSubject(
      replaceLeadVariables(
        template.subject,
        lead
      )
    );

    setBody(
      replaceLeadVariables(
        template.body,
        lead
      )
    );
  };

  const handleSend = () => {
    setError('');

    if (!lead.email) {
      setError(
        'This lead does not have an email address.'
      );
      return;
    }

    if (
      !subject.trim() ||
      !body.trim()
    ) {
      setError(
        'Please enter both subject and message.'
      );
      return;
    }

    onSend({
      id: Date.now(),
      date: new Date().toLocaleString(),
      recipient:
        getLeadDisplayName(lead),
      email: lead.email,
      subject: subject.trim(),
      status: 'Sent',
      body: body.trim(),
      lead_id: lead.id,
      template_id:
        selectedTemplateId || null,
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-32px)] sm:max-w-2xl bg-white sm:rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-900">
              Send Email
            </h3>

            <p className="text-sm text-slate-500 mt-1 truncate">
              Compose an email for{' '}
              {getLeadDisplayName(lead)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close email modal"
            className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EmailField
              label="From"
              value={senderEmail}
            />

            <EmailField
              label="To"
              value={lead.email || ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Template
            </label>

            <select
              value={selectedTemplateId}
              onChange={(event) =>
                applyTemplate(
                  event.target.value
                )
              }
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">
                No template — write manually
              </option>

              {templates.map(
                (template) => (
                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(event) => {
                setSubject(
                  event.target.value
                );
                setError('');
              }}
              placeholder="Enter subject line..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>

            <textarea
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setError('');
              }}
              rows={11}
              placeholder="Write your email message..."
              className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 leading-6 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          <p className="text-xs text-slate-400">
            Template variables such as{' '}
            {'{{first_name}}'} and{' '}
            {'{{company}}'} are replaced
            automatically.
          </p>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto sm:min-w-[120px] px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="w-full sm:w-auto sm:min-w-[145px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Send size={15} />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}

function EmailField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>

      <input
        type="email"
        value={value}
        readOnly
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
      />
    </div>
  );
}