import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  UserRound,
  FileText,
  Clock3,
  Send,
} from 'lucide-react';

export default function LeadDetails({ leadId, onBack }) {
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('lf_token');

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5000/api/lead-details/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setLead(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [leadId]);

  const onAddNote = async (e) => {
    e.preventDefault();

    if (!note.trim()) return;

    const token = localStorage.getItem('lf_token');

    try {
      const res = await fetch(`http://localhost:5000/api/lead-details/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });

      if (res.ok) {
        setNote('');
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

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
        <p className="text-sm text-slate-500">Lead not found.</p>

        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const initials = getInitials(lead.first_name, lead.last_name);

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Leads
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left/Main Profile */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-cyan-600 text-white flex items-center justify-center text-lg font-bold">
                  {initials}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {lead.first_name} {lead.last_name}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {lead.job_title || 'No job title'} at {lead.company_name}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit px-3 py-1 rounded-md border text-sm font-medium ${getStatusStyle(
                  lead.status?.status_name
                )}`}
              >
                {lead.status?.status_name || 'New'}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Lead Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email" value={lead.email} />
                <InfoItem icon={Phone} label="Phone" value={lead.phone || 'No phone number'} />
                <InfoItem icon={Building2} label="Company" value={lead.company_name} />
                <InfoItem icon={UserRound} label="Job Title" value={lead.job_title || 'No job title'} />
                <InfoItem icon={Globe} label="Website" value={lead.website || 'No website'} />
                <InfoItem icon={MapPin} label="Country" value={lead.country || 'No country'} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200">
                <SmallInfo label="Source" value={lead.source?.source_name || '—'} />
                <SmallInfo
                  label="Assigned To"
                  value={
                    lead.assigned_to
                      ? `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}`
                      : 'Unassigned'
                  }
                />
                <SmallInfo label="Created" value={formatDate(lead.created_at)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <FileText size={18} className="text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
            </div>

            <div className="p-6">
              <form onSubmit={onAddNote} className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                  type="text"
                  placeholder="Add an internal note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
                {lead.notes?.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No notes yet.
                  </p>
                ) : (
                  lead.notes?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-100 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.user?.first_name || 'User'}
                        </p>

                        <p className="text-xs text-slate-400">
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm self-start overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Clock3 size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">
              Activity Timeline
            </h3>
          </div>

          <div className="p-6">
            {lead.activities?.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No activities yet.
              </p>
            ) : (
              <div className="space-y-5">
                {lead.activities?.map((activity) => (
                  <div key={activity.id} className="relative pl-6">
                    <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-blue-600" />
                    <div className="absolute left-[5px] top-5 bottom-[-20px] w-px bg-slate-200" />

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {activity.description}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
      <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-800 font-semibold mt-1">{value}</p>
    </div>
  );
}