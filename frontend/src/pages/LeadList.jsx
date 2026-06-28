import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Download,
} from 'lucide-react';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

export default function LeadList({ onSelectLead }) {
  const [leads, setLeads] = useState([]);
  const [aux, setAux] = useState({ statuses: [], sources: [], staff: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusId, setStatusId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [error, setError] = useState('');

  const fetchAuxVariables = async () => {
    const token = localStorage.getItem('lf_token');

    try {
      const res = await fetch('http://localhost:5000/api/leads/variables', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setAux(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('lf_token');

      const queryParams = new URLSearchParams({
        search,
        status_id: statusId,
      });

      const res = await fetch(
        `http://localhost:5000/api/leads?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch leads.');
      }

      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not load leads. Please check backend and database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxVariables();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, statusId]);

  const handleDeleteLead = async (id, firstName, lastName) => {
    if (!window.confirm(`Delete lead: ${firstName} ${lastName}?`)) return;

    const token = localStorage.getItem('lf_token');

    try {
      const res = await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete lead.');
      }

      fetchLeads();
    } catch (err) {
      alert(err.message);
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
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

  const getStatusStyle = (statusName = '') => {
    const name = statusName.toLowerCase();

    if (name.includes('converted')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (name.includes('demo')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (name.includes('replied')) return 'bg-green-50 text-green-700 border-green-200';
    if (name.includes('emailed') && !name.includes('not')) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (name.includes('follow')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (name.includes('not interested')) return 'bg-red-50 text-red-700 border-red-200';
    if (name.includes('not emailed')) return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';

    return new Date(dateValue).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    if (!leads.length) return;

    const headers = [
      'Name',
      'Company',
      'Job Title',
      'Email',
      'Country',
      'Source',
      'Status',
      'Assigned',
    ];

    const rows = leads.map((lead) => [
      `${lead.first_name} ${lead.last_name}`,
      lead.company_name,
      lead.job_title || '',
      lead.email,
      lead.country || '',
      lead.source?.source_name || '',
      lead.status?.status_name || '',
      lead.assigned_to?.first_name || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'leadflow-leads.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">All Statuses</option>
            {aux.statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="px-4 py-3 bg-red-50 text-red-700 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading leads...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="h-4 w-4 accent-blue-600" />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Contacted</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-12 text-center text-sm text-slate-400">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => {
                    const initials = getInitials(lead.first_name, lead.last_name);
                    const assignedInitials = lead.assigned_to
                      ? getInitials(lead.assigned_to.first_name, lead.assigned_to.last_name)
                      : 'NA';

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50 transition-colors animate-row"
                        style={{ animationDelay: `${index * 25}ms` }}
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" className="h-4 w-4 accent-blue-600" />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full ${avatarColors[index % avatarColors.length]} text-white flex items-center justify-center text-xs font-bold`}
                            >
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {lead.first_name} {lead.last_name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.company_name}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.job_title || '—'}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.email}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.country || '—'}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.source?.source_name || '—'}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusStyle(
                              lead.status?.status_name
                            )}`}
                          >
                            {lead.status?.status_name || 'New'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500">
                          {formatDate(lead.last_contacted_at || lead.created_at)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                              {assignedInitials}
                            </div>
                            <span className="text-sm text-slate-600">
                              {lead.assigned_to?.first_name || 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              onClick={() => onSelectLead && onSelectLead(lead.id)}
                              className="hover:text-blue-600"
                              title="View"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => setEditLeadId(lead.id)}
                              className="hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteLead(lead.id, lead.first_name, lead.last_name)
                              }
                              className="hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold">{leads.length}</span> of{' '}
            <span className="font-semibold">{leads.length}</span> leads
          </p>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      <AddLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={fetchLeads}
      />

      <EditLeadModal
        isOpen={!!editLeadId}
        leadId={editLeadId}
        onClose={() => setEditLeadId(null)}
        onSaveSuccess={fetchLeads}
      />
    </div>
  );
}