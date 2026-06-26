import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Sparkles, FolderPlus, Tag } from 'lucide-react';

export default function AddLeadModal({ isOpen, onClose, onSaveSuccess }) {
  const [vars, setVars] = useState({ statuses: [], sources: [], staff: [] });
  const [form, setForm] = useState({
    first_name: '', last_name: '', company_name: '', job_title: '',
    email: '', phone: '', website: '', country: '',
    source_id: '', status_id: '', assigned_user_id: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [tagChips, setTagChips] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      const token = localStorage.getItem('lf_token');
      fetch('http://localhost:5000/api/leads/variables', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setVars(data);
        if (data.statuses.length && data.sources.length) {
          setForm(prev => ({
            ...prev,
            status_id: data.statuses[0].id,
            source_id: data.sources[0].id,
            assigned_user_id: data.staff[0]?.id || ''
          }));
        }
        setTimeout(() => firstInputRef.current?.focus(), 50);
      })
      .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTagKeyDown = (e) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/,$/, '');
      if (cleanTag && !tagChips.includes(cleanTag)) {
        setTagChips([...tagChips, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTagChip = (indexToRemove) => {
    setTagChips(tagChips.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('lf_token');
    const payload = { ...form, tags: tagChips.join(',') };

    try {
      const res = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      onSaveSuccess();
      onClose();
      setForm({
        first_name: '', last_name: '', company_name: '', job_title: '',
        email: '', phone: '', website: '', country: '',
        source_id: '', status_id: '', assigned_user_id: ''
      });
      setTagChips([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden my-auto max-h-[calc(100vh-4rem)] flex flex-col">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FolderPlus size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base tracking-tight">Register Lead Profile</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Establish database metadata</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 font-bold text-lg">&times;</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-xs text-red-700 font-semibold">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name *</label>
              <input type="text" ref={firstInputRef} required className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name *</label>
              <input type="text" required className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company *</label>
              <input type="text" required className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
              <input type="text" className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input type="email" required className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Website</label>
              <input type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="https://" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
              <input type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 bg-slate-50/30 -mx-6 px-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pipeline Status</label>
              <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all focus:border-blue-500" value={form.status_id} onChange={e => setForm({ ...form, status_id: e.target.value })} >
                {vars.statuses.map(st => <option key={st.id} value={st.id}>{st.status_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Channel Source</label>
              <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all focus:border-blue-500" value={form.source_id} onChange={e => setForm({ ...form, source_id: e.target.value })} >
                {vars.sources.map(sc => <option key={sc.id} value={sc.id}>{sc.source_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Agent</label>
              <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all focus:border-blue-500" value={form.assigned_user_id} onChange={e => setForm({ ...form, assigned_user_id: e.target.value })} >
                {vars.staff.map(stf => <option key={stf.id} value={stf.id}>{stf.first_name} {stf.last_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tags (Comma-separated)</label>
            <input 
              type="text" 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 mb-2" 
              placeholder="e.g. SaaS, Enterprise, Q3-2026 (Press enter or comma to add)"
              value={tagInput}
              onKeyDown={handleTagKeyDown}
              onChange={e => setTagInput(e.target.value)}
            />
            {tagChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagChips.map((chip, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg select-none">
                    <span>{chip}</span>
                    <button type="button" onClick={() => removeTagChip(idx)} className="hover:text-red-500 transition-colors h-3 w-3 flex items-center justify-center font-bold">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider active:scale-95">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md active:scale-95 disabled:opacity-50">
              {loading ? 'Registering...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}