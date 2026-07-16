import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, FolderEdit } from 'lucide-react';

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

export default function EditLeadModal({ isOpen, leadId, onClose, onSaveSuccess }) {
  const [vars, setVars] = useState({ statuses: [], sources: [], staff: [] });

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    job_title: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    source_id: '',
    status_id: '',
    assigned_user_id: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const token = localStorage.getItem('lf_token');

    const loadData = async () => {
      setError('');

      try {
        const varsRes = await fetch('/api/leads/variables', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const varsData = await varsRes.json();
        setVars(varsData);

        const leadRes = await fetch(`/api/lead-details/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const lead = await leadRes.json();

        if (!leadRes.ok) {
          throw new Error(lead.error || 'Failed to load lead details.');
        }

        setForm({
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          company_name: lead.company_name || '',
          job_title: lead.job_title || '',
          email: lead.email || '',
          phone: lead.phone || '',
          website: lead.website || '',
          country: lead.country || 'United States',
          source_id: lead.source_id || '',
          status_id: lead.status_id || '',
          assigned_user_id: lead.assigned_user_id || '',
        });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load lead information.');
      }
    };

    loadData();
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('lf_token');

    try {
      const res = await fetch(`/api/lead-details/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update lead.');
      }

      onSaveSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[calc(100vh-48px)] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderEdit size={17} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Lead
              </h2>
              <p className="text-sm text-slate-500">
                Update the selected lead profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0">
          <div className="p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="px-4 py-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah"
                    className={inputClass}
                    value={form.first_name}
                    onChange={(e) => updateField('first_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Chen"
                    className={inputClass}
                    value={form.last_name}
                    onChange={(e) => updateField('last_name', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    className={inputClass}
                    value={form.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Job Title</label>
                  <input
                    type="text"
                    placeholder="VP Marketing"
                    className={inputClass}
                    value={form.job_title}
                    onChange={(e) => updateField('job_title', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@acmecorp.com"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 415 555 0100"
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Website</label>
                  <input
                    type="text"
                    placeholder="www.acmecorp.com"
                    className={inputClass}
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Country</label>
                  <select
                    className={inputClass}
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="pt-5 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Lead Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Lead Source</label>
                  <select
                    className={inputClass}
                    value={form.source_id}
                    onChange={(e) => updateField('source_id', e.target.value)}
                  >
                    {vars.sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.source_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={inputClass}
                    value={form.status_id}
                    onChange={(e) => updateField('status_id', e.target.value)}
                  >
                    {vars.statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Assign To</label>
                  <select
                    className={inputClass}
                    value={form.assigned_user_id}
                    onChange={(e) =>
                      updateField('assigned_user_id', e.target.value)
                    }
                  >
                    {vars.staff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[140px] px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="min-w-[160px] px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}