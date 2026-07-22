import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Download,
  Building2,
  MapPin,
  Mail,
  CalendarDays,
  Package,
  UserRound,
} from 'lucide-react';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

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

const getAssignedName = (lead) => {
  if (!lead?.assigned_to) {
    return 'Unassigned';
  }

  const name = `${
    lead.assigned_to.first_name || ''
  } ${lead.assigned_to.last_name || ''}`.trim();

  return (
    name ||
    lead.assigned_to.email ||
    'Unassigned'
  );
};

const getInitials = (lead) => {
  const firstInitial =
    lead?.first_name?.charAt(0) || '';

  const lastInitial =
    lead?.last_name?.charAt(0) || '';

  const contactInitials =
    `${firstInitial}${lastInitial}`.toUpperCase();

  if (contactInitials) {
    return contactInitials;
  }

  return String(
    lead?.company_name || 'LF'
  )
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const formatInterestLevel = (interestLevel) => {
  if (!interestLevel) return '—';

  const value = String(
    interestLevel
  ).toLowerCase();

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return '—';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getLocation = (lead) => {
  return [
    lead?.barangay,
    lead?.city,
    lead?.province,
    lead?.country,
  ]
    .filter(Boolean)
    .join(', ') || '—';
};

const escapeCsv = (value) => {
  return `"${String(value ?? '').replace(
    /"/g,
    '""'
  )}"`;
};

export default function LeadList({
  onSelectLead,
}) {
  const [leads, setLeads] = useState([]);

  const [aux, setAux] = useState({
    statuses: [],
    sources: [],
    staff: [],
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusId, setStatusId] = useState('');
  const [modalOpen, setModalOpen] =
    useState(false);
  const [editLeadId, setEditLeadId] =
    useState(null);
  const [error, setError] = useState('');

  const fetchAuxVariables = async () => {
    const token =
      localStorage.getItem('lf_token');

    try {
      const response = await fetch(
        '/api/leads/variables',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to load lead variables.'
        );
      }

      setAux({
        statuses: Array.isArray(
          data.statuses
        )
          ? data.statuses
          : [],

        sources: Array.isArray(
          data.sources
        )
          ? data.sources
          : [],

        staff: Array.isArray(data.staff)
          ? data.staff
          : [],
      });
    } catch (requestError) {
      console.error(requestError);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    setError('');

    try {
      const token =
        localStorage.getItem('lf_token');

      const queryParams =
        new URLSearchParams();

      if (search.trim()) {
        queryParams.set(
          'search',
          search.trim()
        );
      }

      if (statusId) {
        queryParams.set(
          'status_id',
          statusId
        );
      }

      const response = await fetch(
        `/api/leads?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to fetch leads.'
        );
      }

      setLeads(
        Array.isArray(data)
          ? data
          : Array.isArray(data.leads)
            ? data.leads
            : []
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          'Could not load leads. Please check the backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxVariables();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLeads();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search, statusId]);

  const handleDeleteLead = async (lead) => {
    const displayName =
      getLeadDisplayName(lead);

    if (
      !window.confirm(
        `Delete lead: ${displayName}?`
      )
    ) {
      return;
    }

    const token =
      localStorage.getItem('lf_token');

    try {
      const response = await fetch(
        `/api/leads/${lead.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to delete lead.'
        );
      }

      await fetchLeads();
    } catch (deleteError) {
      window.alert(
        deleteError.message ||
          'Failed to delete lead.'
      );
    }
  };

  const avatarColors = [
    'bg-cyan-600',
    'bg-emerald-500',
    'bg-green-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-sky-600',
    'bg-blue-600',
  ];

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

    if (value === 'cold') {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }

    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const handleExport = () => {
    if (!leads.length) {
      window.alert(
        'There are no leads to export.'
      );

      return;
    }

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
      'assigned_to',
      'preferred_contact_method',
      'next_follow_up_date',
      'created_at',
    ];

    const rows = leads.map((lead) => [
      lead.company_name || '',
      lead.business_type || '',
      lead.first_name || '',
      lead.last_name || '',
      lead.job_title || '',
      lead.email || '',
      lead.phone || '',
      lead.website || '',
      lead.social_media_url || '',
      lead.complete_address || '',
      lead.barangay || '',
      lead.city || '',
      lead.province || '',
      lead.country || '',
      lead.source?.source_name || '',
      lead.status?.status_name || '',
      formatInterestLevel(
        lead.interest_level
      ),
      lead.converted_product || '',
      getAssignedName(lead),
      lead.preferred_contact_method ||
        '',
      lead.next_follow_up_date
        ? new Date(
            lead.next_follow_up_date
          )
            .toISOString()
            .slice(0, 10)
        : '',
      lead.created_at
        ? new Date(lead.created_at)
            .toISOString()
            .slice(0, 10)
        : '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map(escapeCsv).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      'leadflow-leads.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_190px] gap-3 w-full xl:max-w-2xl">
          <div className="relative min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search name, company, or email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusId}
            onChange={(event) =>
              setStatusId(
                event.target.value
              )
            }
            className="w-full min-w-0 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">
              All Statuses
            </option>

            {aux.statuses.map(
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
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExport}
            disabled={!leads.length}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            Export
          </button>

          <button
            type="button"
            onClick={() =>
              setModalOpen(true)
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm border border-red-100 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-400">
          Loading leads...
        </div>
      ) : (
        <>
          {/* Phone and tablet layout */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.length === 0 ? (
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
                No leads found.
              </div>
            ) : (
              leads.map((lead, index) => {
                const displayName =
                  getLeadDisplayName(lead);

                return (
                  <article
                    key={lead.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 min-w-0 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-11 w-11 shrink-0 rounded-full ${
                            avatarColors[
                              index %
                                avatarColors.length
                            ]
                          } text-white flex items-center justify-center text-xs font-bold`}
                        >
                          {getInitials(lead)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 break-words">
                            {displayName}
                          </p>

                          <p className="text-xs text-slate-500 mt-1 break-words">
                            {lead.company_name ||
                              'No company'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <ActionButton
                          title="View lead"
                          onClick={() =>
                            onSelectLead?.(
                              lead.id
                            )
                          }
                        >
                          <Eye size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Edit lead"
                          onClick={() =>
                            setEditLeadId(
                              lead.id
                            )
                          }
                        >
                          <Edit3 size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Delete lead"
                          danger
                          onClick={() =>
                            handleDeleteLead(
                              lead
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </ActionButton>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusStyle(
                          lead.status
                            ?.status_name
                        )}`}
                      >
                        {lead.status
                          ?.status_name ||
                          'New'}
                      </span>

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${getInterestStyle(
                          lead.interest_level
                        )}`}
                      >
                        {formatInterestLevel(
                          lead.interest_level
                        )}
                      </span>

                      {lead.business_type && (
                        <span className="inline-flex px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium">
                          {lead.business_type}
                        </span>
                      )}
                    </div>

                    {lead.converted_product && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                        <Package
                          size={14}
                          className="shrink-0"
                        />

                        <span className="font-medium">
                          {
                            lead.converted_product
                          }
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <MobileInfo
                        icon={Mail}
                        label="Email"
                        value={
                          lead.email || '—'
                        }
                      />

                      <MobileInfo
                        icon={Building2}
                        label="Business Type"
                        value={
                          lead.business_type ||
                          '—'
                        }
                      />

                      <MobileInfo
                        icon={MapPin}
                        label="Location"
                        value={getLocation(
                          lead
                        )}
                      />

                      <MobileInfo
                        icon={UserRound}
                        label="Assigned"
                        value={getAssignedName(
                          lead
                        )}
                      />

                      <MobileInfo
                        icon={CalendarDays}
                        label="Follow-up"
                        value={formatDate(
                          lead.next_follow_up_date
                        )}
                      />

                      <MobileInfo
                        icon={CalendarDays}
                        label="Created"
                        value={formatDate(
                          lead.created_at
                        )}
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all leads"
                        className="h-4 w-4 accent-blue-600"
                      />
                    </th>

                    <th className="px-4 py-3">
                      Lead
                    </th>

                    <th className="px-4 py-3">
                      Business
                    </th>

                    <th className="px-4 py-3">
                      Email
                    </th>

                    <th className="px-4 py-3">
                      Location
                    </th>

                    <th className="px-4 py-3">
                      Source
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Interest
                    </th>

                    <th className="px-4 py-3">
                      Follow-up
                    </th>

                    <th className="px-4 py-3">
                      Assigned
                    </th>

                    <th className="px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {leads.length === 0 ? (
                    <tr>
                      <td
                        colSpan="11"
                        className="p-12 text-center text-sm text-slate-400"
                      >
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    leads.map(
                      (lead, index) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              aria-label={`Select ${getLeadDisplayName(
                                lead
                              )}`}
                              className="h-4 w-4 accent-blue-600"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-[190px]">
                              <div
                                className={`h-9 w-9 shrink-0 rounded-full ${
                                  avatarColors[
                                    index %
                                      avatarColors.length
                                  ]
                                } text-white flex items-center justify-center text-xs font-bold`}
                              >
                                {getInitials(
                                  lead
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 break-words">
                                  {getLeadDisplayName(
                                    lead
                                  )}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {lead.job_title ||
                                    'No job title'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">
                              {lead.company_name ||
                                '—'}
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {lead.business_type ||
                                'Not specified'}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-600 break-all">
                            {lead.email || '—'}
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px]">
                            <span className="line-clamp-2">
                              {getLocation(
                                lead
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-600">
                            {lead.source
                              ?.source_name ||
                              '—'}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusStyle(
                                lead.status
                                  ?.status_name
                              )}`}
                            >
                              {lead.status
                                ?.status_name ||
                                'New'}
                            </span>

                            {lead.converted_product && (
                              <p className="text-[11px] text-blue-600 mt-1.5 font-medium">
                                {
                                  lead.converted_product
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${getInterestStyle(
                                lead.interest_level
                              )}`}
                            >
                              {formatInterestLevel(
                                lead.interest_level
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                            {formatDate(
                              lead.next_follow_up_date
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <div className="h-7 w-7 shrink-0 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                                {getInitials({
                                  first_name:
                                    lead.assigned_to
                                      ?.first_name,
                                  last_name:
                                    lead.assigned_to
                                      ?.last_name,
                                  company_name:
                                    'NA',
                                })}
                              </div>

                              <span className="text-sm text-slate-600">
                                {getAssignedName(
                                  lead
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-slate-400">
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectLead?.(
                                    lead.id
                                  )
                                }
                                className="hover:text-blue-600"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditLeadId(
                                    lead.id
                                  )
                                }
                                className="hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteLead(
                                    lead
                                  )
                                }
                                className="hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold">
                  {leads.length}
                </span>{' '}
                lead
                {leads.length === 1
                  ? ''
                  : 's'}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                >
                  1
                </button>

                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AddLeadModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSaveSuccess={fetchLeads}
      />

      <EditLeadModal
        isOpen={Boolean(editLeadId)}
        leadId={editLeadId}
        onClose={() =>
          setEditLeadId(null)
        }
        onSaveSuccess={fetchLeads}
      />
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  danger = false,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 transition ${
        danger
          ? 'text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
          : 'text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  );
}

function MobileInfo({
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
        <p className="text-xs text-slate-400 font-medium">
          {label}
        </p>

        <p className="text-sm text-slate-700 font-medium mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}