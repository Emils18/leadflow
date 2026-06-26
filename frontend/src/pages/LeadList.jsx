import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Eye, Edit3, Trash2, ChevronLeft, ChevronRight, AlertCircle, Calendar, ChevronDown, User } from 'lucide-react';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

export default function LeadList({ onSelectLead }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const [statusId, setStatusId] = useState('');
  const [sourceId, setSourceId] = useState('');

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatusName, setSelectedStatusName] = useState('All Statuses');
  const [aux, setAux] = useState({ statuses: [], sources: [] });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAuxVariables = async () => {
    const token = localStorage.getItem('lf_token');
    try {
      const res = await fetch('http://localhost:5000/api/leads/variables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAux(data);
    } catch (err) {
      console.error('Error fetching list parameters:', err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('lf_token');
      const queryParams = new URLSearchParams({
        search: search,
        status_id: statusId,
        source_id: sourceId,
        page: page.toString(),
        limit: '10'
      });
      
      const res = await fetch(`http://localhost:5000/api/leads?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch leads');
      
      const data = await res.json();
      setLeads(data);
      setTotalLeads(data.length || 0);
    } catch (err) {
      console.error(err);
      setError('Could not load pipeline directory. Please verify your XAMPP connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxVariables();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, statusId, sourceId, page]);

  const handleDeleteLead = async (id, first, last) => {
    if (!window.confirm(`Are you sure you want to delete lead: "${first} ${last}"?`)) return;
    
    const token = localStorage.getItem('lf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLeads();
      } else {
        throw new Error('Failed to delete lead from pipeline.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusSelect = (statusName, id) => {
    setSelectedStatusName(statusName);
    setStatusId(id || '');
    setStatusDropdownOpen(false);
    setPage(1);
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (first, last) => {
    const fullName = `${first || ''} ${last || ''}`.toLowerCase();
    if (fullName.includes('sarah chen')) return 'bg-cyan-500 text-white';
    if (fullName.includes('james okafor')) return 'bg-emerald-500 text-white';
    if (fullName.includes('priya sharma')) return 'bg-emerald-500 text-white';
    if (fullName.includes('lucas martins')) return 'bg-rose-500 text-white';
    if (fullName.includes('emma vandenberg')) return 'bg-rose-500 text-white';
    if (fullName.includes('kwame asante')) return 'bg-indigo-500 text-white';
    if (fullName.includes('yuki tanaka')) return 'bg-red-500 text-white';
    if (fullName.includes('aisha patel')) return 'bg-sky-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getStatusStyle = (statusName) => {
    const name = statusName?.toLowerCase() || '';
    if (name.includes('new')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (name.includes('converted')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (name.includes('not interested')) return 'bg-red-50 text-red-700 border-red-100';
    if (name.includes('emailed')) return 'bg-sky-50 text-sky-700 border-sky-100';
    if (name.includes('replied')) return 'bg-blue-100/50 text-blue-800 border-blue-200/50';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 select-none text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pipeline Directory</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">all active leads • real-time tracking</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/10 hover-lift"
        >
          <Plus size={14} /> Create Lead
        </button>
      </div>

      {/* Filter Row with hover-glow focus borders */}
      <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center z-30 relative">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs outline-none hover-glow focus:bg-white"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Source Filter Select */}
        <select 
          className="w-full md:w-48 border border-slate-200 rounded-xl p-2.5 text-xs bg-white text-slate-500 outline-none cursor-pointer font-semibold shadow-xs hover-glow" 
          value={sourceId} 
          onChange={(e) => { setSourceId(e.target.value); setPage(1); }}
        >
          <option value="">All Sources</option>
          {aux.sources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
        </select>

        {/* Custom Status Dropdown Menu */}
        <div className="relative w-full md:w-56" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-semibold flex items-center justify-between shadow-xs hover:border-slate-300 outline-none hover-glow"
          >
            <span>{selectedStatusName}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {statusDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleStatusSelect('All Statuses', '')}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                All Statuses
              </button>
              {aux.statuses.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStatusSelect(s.status_name, s.id)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors ${statusId === s.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
                >
                  {s.status_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden z-10 relative hover-lift">
        {loading ? (
          <div className="p-16 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Querying database...</div>
        ) : leads.length === 0 ? (
          <div className="p-20 text-center space-y-3">
            <User size={40} className="mx-auto text-slate-200 animate-pulse" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No active leads in pipeline</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Contacted</th>
                  <th className="px-6 py-4">Assigned</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody key={`${statusId}-${search}-${sourceId}`} className="divide-y divide-slate-100 font-medium text-slate-700">
                {leads.map((lead, idx) => {
                  const initials = getInitials(lead.first_name, lead.last_name);
                  const staffInitials = lead.assigned_to ? getInitials(lead.assigned_to.first_name, lead.assigned_to.last_name) : 'UN';
                  const avatarColor = getAvatarColor(lead.first_name, lead.last_name);
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors animate-row" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 ${avatarColor} font-black rounded-full flex items-center justify-center text-[10px] shrink-0 shadow-sm`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{lead.first_name} {lead.last_name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">ID: #{lead.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">{lead.company_name}</td>
                      <td className="px-6 py-4 text-slate-500">{lead.job_title || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{lead.email}</td>
                      <td className="px-6 py-4 text-slate-500">{lead.country || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500">{lead.source?.source_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${getStatusStyle(lead.status?.status_name)}`}>
                          {lead.status?.status_name || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold flex items-center gap-1.5 h-full">
                        <Calendar size={12} className="text-slate-300" />
                        <span>{lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : new Date(lead.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-slate-100 text-slate-500 font-bold rounded-full flex items-center justify-center text-[9px] shrink-0 uppercase">
                            {staffInitials}
                          </div>
                          <span className="text-slate-600 font-semibold">
                            {lead.assigned_to ? lead.assigned_to.first_name : 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5 text-slate-400 shrink-0">
                          <button onClick={() => onSelectLead && onSelectLead(lead.id)} title="Review Profile" className="hover:text-blue-600 transition-colors p-1 transform hover:scale-110">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => setEditLeadId(lead.id)} title="Edit Lead" className="hover:text-blue-600 transition-colors p-1 transform hover:scale-110">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteLead(lead.id, lead.first_name, lead.last_name)} title="Delete Lead" className="hover:text-red-500 transition-colors p-1 transform hover:scale-110">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddLeadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaveSuccess={fetchLeads} />
      <EditLeadModal isOpen={!!editLeadId} leadId={editLeadId} onClose={() => setEditLeadId(null)} onSaveSuccess={fetchLeads} />
    </div>
  );
}