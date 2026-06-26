import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

export default function LeadDetails({ leadId, onBack }) {
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');

  const fetchProfile = async () => {
    const token = localStorage.getItem('lf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/lead-details/${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLead(data);
      }
    } catch (err) {
      console.error(err);
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        setNote('');
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!lead) return <div className="p-8 text-xs text-slate-400 font-bold tracking-widest text-center uppercase">Loading details...</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in text-left">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 text-xs font-bold transition-colors uppercase tracking-wider">
        <ArrowLeft size={14} /> Back to Directory
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Core details card (Pure Read-Only Profile) */}
        <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">{lead.first_name} {lead.last_name}</h2>
            <p className="text-xs text-slate-400 mt-1">{lead.company_name} &bull; {lead.job_title || 'No Title'}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Email</span>
              <span className="text-slate-800 font-semibold">{lead.email}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Phone Contact</span>
              <span className="text-slate-800 font-semibold">{lead.phone || 'No Contact Number'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Website</span>
              <span className="text-slate-800 font-semibold">{lead.website || 'No Website'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Country</span>
              <span className="text-slate-800 font-semibold">{lead.country || 'No Country Specified'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Pipeline State</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1" style={{ backgroundColor: `${lead.status?.color_hex}15`, color: lead.status?.color_hex }}>
                {lead.status?.status_name}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Channel</span>
              <span className="text-slate-800 font-semibold">{lead.source?.source_name}</span>
            </div>
            <div className="col-span-2 border-t border-slate-50 pt-3">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Assigned Owner</span>
              <span className="text-slate-800 font-semibold">{lead.assigned_to.first_name} {lead.assigned_to.last_name}</span>
            </div>
          </div>

          {/* Notes Streams */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
              <FileText size={14} className="text-slate-400" />
              Notes Logs
            </h3>
            <form onSubmit={onAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Log internal updates note..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 rounded-xl text-[10px] uppercase tracking-wider transition-colors">
                Post Note
              </button>
            </form>

            <div className="space-y-2">
              {lead.notes.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No recorded log notes found.</p>
              ) : (
                lead.notes.map(n => (
                  <div key={n.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs animate-fade-in">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                      <span>{n.user.first_name}</span>
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 leading-normal font-medium">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Audit trail */}
        <div className="w-full lg:w-72 bg-white border border-slate-100 shadow-sm p-6 rounded-xl self-start">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1 border-b border-slate-50 pb-2">
            <Clock size={14} className="text-slate-400" /> Audit Trail History
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {lead.activities.map(act => (
              <div key={act.id} className="text-[11px] border-l-2 border-slate-100 pl-3 relative">
                <div className="absolute left-[-4px] top-1 h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                <p className="text-slate-600 leading-normal font-medium">{act.description}</p>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(act.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}