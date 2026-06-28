import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  MessageSquare,
  Trophy,
  TrendingUp,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    metrics: {
      totalLeads: 0,
      emailedCount: 0,
      repliesCount: 0,
      convertedCount: 0,
    },
    funnel: [],
    activities: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('lf_token');

    try {
      const res = await fetch('http://localhost:5000/api/dashboard/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to load dashboard.');
      }

      setData(result);
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

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={18} />
          {error}
        </div>

        <button
          onClick={fetchDashboardData}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          <RefreshCcw size={15} />
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Leads',
      value: data.metrics.totalLeads,
      change: '+12%',
      icon: Users,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Emailed Leads',
      value: data.metrics.emailedCount,
      change: '+8%',
      icon: Mail,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Replies Received',
      value: data.metrics.repliesCount,
      change: '+21%',
      icon: MessageSquare,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Converted',
      value: data.metrics.convertedCount,
      change: '+6%',
      icon: Trophy,
      iconClass: 'bg-orange-50 text-orange-500',
    },
  ];

  const weeklyOutreach = [
    { day: 'Mon', sent: 48, replies: 10 },
    { day: 'Tue', sent: 65, replies: 17 },
    { day: 'Wed', sent: 50, replies: 13 },
    { day: 'Thu', sent: 82, replies: 22 },
    { day: 'Fri', sent: 66, replies: 18 },
    { day: 'Sat', sent: 12, replies: 5 },
    { day: 'Sun', sent: 8, replies: 2 },
  ];

  const maxFunnelCount = Math.max(
    ...data.funnel.map((item) => item.count || 0),
    1
  );

  const funnelColors = [
    'bg-blue-500',
    'bg-slate-400',
    'bg-blue-400',
    'bg-emerald-500',
    'bg-orange-400',
    'bg-cyan-500',
    'bg-green-600',
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {item.value}
                </h2>

                <div className="inline-flex items-center gap-1 mt-4 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
                  <TrendingUp size={12} />
                  {item.change}
                </div>

                <span className="ml-2 text-xs text-slate-400">
                  vs last month
                </span>
              </div>

              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center ${item.iconClass}`}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Lead Conversion Funnel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Lead Conversion Funnel
              </h3>
              <p className="text-sm text-slate-400 mt-1">Leads by stage</p>
            </div>

            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500">
              <option>This Month</option>
              <option>This Week</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-64 mt-6 flex items-end justify-between gap-5 border-b border-slate-100 px-2">
            {data.funnel.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                No funnel data yet.
              </div>
            ) : (
              data.funnel.map((item, index) => {
                const height = Math.max((item.count / maxFunnelCount) * 100, 8);

                return (
                  <div
                    key={item.name}
                    className="flex-1 h-full flex flex-col items-center justify-end gap-3"
                  >
                    <div
                      className={`w-9 rounded-t-md ${
                        funnelColors[index % funnelColors.length]
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.name}: ${item.count}`}
                    />

                    <p className="text-xs text-slate-400 text-center whitespace-nowrap">
                      {item.name}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Outreach */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Weekly Outreach
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Emails sent vs replies
            </p>
          </div>

          <div className="flex items-center gap-5 mt-5 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2 w-4 bg-blue-500 rounded-full" />
              Sent
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2 w-4 bg-emerald-500 rounded-full" />
              Replies
            </div>
          </div>

          <div className="h-64 mt-4 flex items-end justify-between gap-5 border-b border-slate-100 px-2">
            {weeklyOutreach.map((item) => (
              <div
                key={item.day}
                className="flex-1 h-full flex flex-col items-center justify-end gap-2"
              >
                <div className="h-full w-full flex items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t-md bg-blue-500"
                    style={{ height: `${item.sent}%` }}
                    title={`Sent: ${item.sent}`}
                  />

                  <div
                    className="w-3 rounded-t-md bg-emerald-500"
                    style={{ height: `${item.replies * 3}%` }}
                    title={`Replies: ${item.replies}`}
                  />
                </div>

                <p className="text-xs text-slate-400">{item.day}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </button>
        </div>

        <div>
          {data.activities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No recent activities yet.
            </div>
          ) : (
            data.activities.map((activity) => (
              <div
                key={activity.id}
                className="px-5 py-4 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {activity.avatar || activity.user?.charAt(0) || 'A'}
                  </div>

                  <div>
                    <p className="text-sm text-slate-700">
                      {activity.description}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}