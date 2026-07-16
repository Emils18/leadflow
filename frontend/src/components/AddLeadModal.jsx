import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, FolderPlus } from 'lucide-react';

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

const DEFAULT_COUNTRY = 'Philippines';
const DEFAULT_PHONE_PREFIX = COUNTRY_PHONE_PREFIX[DEFAULT_COUNTRY];

const createDefaultLeadForm = (vars = {}) => ({
  first_name: '',
  last_name: '',
  company_name: '',
  job_title: '',
  email: '',
  phone: DEFAULT_PHONE_PREFIX,
  website: '',
  country: DEFAULT_COUNTRY,
  source_id: vars.sources?.[0]?.id || '',
  status_id: vars.statuses?.[0]?.id || '',
  assigned_user_id: vars.staff?.[0]?.id || '',
});

export default function AddLeadModal({ isOpen, onClose, onSaveSuccess }) {
  const [vars, setVars] = useState({
    statuses: [],
    sources: [],
    staff: [],
  });

  const [form, setForm] = useState(() => createDefaultLeadForm());
  const [tagInput, setTagInput] = useState('');
  const [tagChips, setTagChips] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const firstInputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setLoading(false);
    setTagInput('');
    setTagChips([]);

    const token = localStorage.getItem('lf_token');

    fetch('/api/leads/variables', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const safeData = {
          statuses: Array.isArray(data.statuses) ? data.statuses : [],
          sources: Array.isArray(data.sources) ? data.sources : [],
          staff: Array.isArray(data.staff) ? data.staff : [],
        };

        setVars(safeData);
        setForm(createDefaultLeadForm(safeData));

        setTimeout(() => firstInputRef.current?.focus(), 100);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load lead form data.');
        setForm(createDefaultLeadForm());
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const phonePrefix = COUNTRY_PHONE_PREFIX[selectedCountry] || '';

    setForm((prev) => ({
      ...prev,
      country: selectedCountry,
      phone: phonePrefix,
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      const cleanTag = tagInput.trim().replace(/,$/, '');

      if (cleanTag && !tagChips.includes(cleanTag)) {
        setTagChips((prev) => [...prev, cleanTag]);
      }

      setTagInput('');
    }
  };

  const removeTagChip = (indexToRemove) => {
    setTagChips((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setForm(createDefaultLeadForm(vars));
    setTagInput('');
    setTagChips([]);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('lf_token');

    const payload = {
      ...form,
      tags: tagChips.join(','),
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save lead.');
      }

      onSaveSuccess?.();
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save lead.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[calc(100vh-48px)] flex flex-col animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderPlus size={17} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Lead
              </h2>

              <p className="text-sm text-slate-500">
                Create a new lead profile.
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
                    ref={firstInputRef}
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
                    placeholder="+63 912 345 6789"
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
                    onChange={handleCountryChange}
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
                    <option value="">Select source</option>

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
                    <option value="">Select status</option>

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
                    <option value="">Unassigned</option>

                    {vars.staff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className={labelClass}>Tags</label>

                  <input
                    type="text"
                    placeholder="SaaS, Enterprise, Q3-2026"
                    className={inputClass}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />

                  {tagChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagChips.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {tag}

                          <button
                            type="button"
                            onClick={() => removeTagChip(index)}
                            className="hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:justify-end gap-3 shrink-0">
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
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}