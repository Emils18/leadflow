import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, MessageCircle, CheckCircle2, TrendingUp, RefreshCcw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    metrics: { totalLeads: 0, emailedCount: 0, repliesCount: 0, convertedCount: 0 },
    funnel: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weeklyOutreachData = [
    { day: 'Mon', sent: 45, replies: 12 },
    { day: 'Tue', sent: 72, replies: 19 },
    { day: 'Wed', sent: 68, replies: 28 },
    { day: 'Thu', sent: 55, replies: 14 },
    { day: 'Fri', sent: 40, replies: 8 },
    { day: 'Sat', sent: 15, replies: 2 },
    { day: 'Sun', sent: 10, replies: 1 },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('lf_token');
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      } else {
        throw new Error(resData.error || 'Failed to fetch dashboard metrics.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-xs font-semibold text-slate-400 text-center uppercase tracking-widest animate-pulse">Loading dashboard analytics...</div>;
  if (error) return (
    <div className="p-8 text-center space-y-3 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 font-semibold flex flex-col items-center gap-2 animate-fade-in">
      <AlertCircle size={20} />
      <span>{error}</span>
      <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 text-xs bg-red-100 hover:bg-red-200 rounded-lg text-red-800 font-bold flex items-center gap-2">
        <RefreshCcw size={14} /> Retry
      </button>
    </div>
  );

  const stats = [
    { label: 'Total Leads', value: data.metrics.totalLeads, shift: '+12%', color: 'text-blue-600 bg-blue-50 shadow-blue-100/10', icon: <Sparkles size={16} /> },
    { label: 'Emailed Leads', value: data.metrics.emailedCount, shift: '+8%', color: 'text-blue-500 bg-blue-50/50 shadow-blue-100/10', icon: <Mail size={16} /> },
    { label: 'Replies Received', value: data.metrics.repliesCount, shift: '+21%', color: 'text-blue-700 bg-blue-50/70 shadow-blue-100/10', icon: <MessageCircle size={16} /> },
    { label: 'Converted', value: data.metrics.convertedCount, shift: '+6%', color: 'text-blue-800 bg-blue-100/30 shadow-blue-100/10', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="space-y-8 select-none text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">outreach performance analytics</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
        >
          <RefreshCcw size={13} />
          Refresh Data
        </button>
      </div>

      {/* 4 Stats Cards utilizing .hover-lift for physical tactile elevations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((c, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between hover-lift">
            <div className="space-y-2">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">{c.label}</span>
              <span className="block text-2xl font-black text-slate-800 tracking-tight">{c.value}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingUp size={10} />
                <span>{c.shift} vs last month</span>
              </span>
            </div>
            <div className={`p-3.5 rounded-xl ${c.color.split(' ')[0]} ${c.color.split(' ')[1]} shadow-sm`}>{c.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Conversion Funnel with hover progress transitions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 hover-lift">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Conversion Funnel</h3>
            <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Leads by stage counts</p>
          </div>
          <div className="space-y-4 pt-2">
            {data.funnel.map((stage, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{stage.name}</span>
                  <span className="text-blue-600">{stage.count}</span>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100/50 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${stage.percent}%` }}
                    title={`${stage.count} leads (${stage.percent}%)`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: Weekly Outreach */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 hover-lift">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Outreach</h3>
            <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Emails Sent vs Replies received</p>
          </div>
          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="flex-1 flex items-end justify-between px-2 gap-3">
              {weeklyOutreachData.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                    Sent: {day.sent} | Replied: {day.replies}
                  </div>
                  <div className="w-full flex justify-center gap-1 items-end h-44">
                    <div 
                      className="w-2.5 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all duration-300 group-hover:scale-y-105 origin-bottom cursor-pointer"
                      style={{ height: `${(day.sent / 80) * 100}%` }}
                    ></div>
                    <div 
                      className="w-2.5 bg-blue-300 hover:bg-blue-400 rounded-t-sm transition-all duration-300 group-hover:scale-y-105 origin-bottom cursor-pointer"
                      style={{ height: `${(day.replies / 80) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-50 pt-4 flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <span>Emails Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-300"></div>
                <span>Replies Received</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 max-w-4xl hover-lift">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
          <a href="#activities" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">View All</a>
        </div>
        <div className="space-y-4">
          {data.activities.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic text-center py-4">No recent activities to display.</p>
          ) : (
            data.activities.map((act, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs leading-normal pb-1">
                <p className="text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">{act.user}</span>: {act.description}
                </p>
                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 tracking-wider pl-4">{new Date(act.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}