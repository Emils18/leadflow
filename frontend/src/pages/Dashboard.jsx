import React, { useEffect, useMemo, useState } from 'react';
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
    scope: 'staff',
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
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [selectedWeeklyPoint, setSelectedWeeklyPoint] = useState(null);

  const fetchDashboardData = async (showAll = showAllActivities) => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('lf_token');
    const activityLimit = showAll ? 50 : 5;

    try {
      const res = await fetch(`/api/dashboard/metrics?activityLimit=${activityLimit}`, {
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
    fetchDashboardData(false);
  }, []);

  const toggleActivities = () => {
    const nextValue = !showAllActivities;
    setShowAllActivities(nextValue);
    fetchDashboardData(nextValue);
  };

  const stats = [
    {
      label: data.scope === 'admin' ? 'Total Leads' : 'My Assigned Leads',
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
      iconClass: 'bg-violet-50 text-violet-600',
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
    { day: 'Tue', sent: 66, replies: 17 },
    { day: 'Wed', sent: 52, replies: 14 },
    { day: 'Thu', sent: 82, replies: 22 },
    { day: 'Fri', sent: 68, replies: 18 },
    { day: 'Sat', sent: 12, replies: 4 },
    { day: 'Sun', sent: 8, replies: 2 },
  ];

  const funnelColors = [
    'bg-blue-500',
    'bg-slate-400',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-400',
    'bg-cyan-500',
    'bg-green-600',
    'bg-blue-400',
  ];

  const maxFunnelCount = Math.max(
    ...data.funnel.map((item) => item.count || 0),
    1
  );

  const chart = useMemo(() => {
    const width = 520;
    const height = 210;
    const paddingX = 26;
    const paddingY = 24;

    const maxValue = Math.max(
      ...weeklyOutreach.flatMap((item) => [item.sent, item.replies]),
      1
    );

    const makePoints = (key) =>
      weeklyOutreach.map((item, index) => {
        const usableWidth = width - paddingX * 2;
        const usableHeight = height - paddingY * 2;

        const x =
          paddingX + (index / (weeklyOutreach.length - 1)) * usableWidth;

        const y =
          height -
          paddingY -
          (item[key] / maxValue) * usableHeight;

        return {
          x,
          y,
          xPercent: (x / width) * 100,
          yPercent: (y / height) * 100,
          day: item.day,
          sent: item.sent,
          replies: item.replies,
        };
      });

    const sentPoints = makePoints('sent');
    const repliesPoints = makePoints('replies');

    const toPolyline = (points) =>
      points.map((point) => `${point.x},${point.y}`).join(' ');

    return {
      width,
      height,
      sentPoints,
      repliesPoints,
      sentPolyline: toPolyline(sentPoints),
      repliesPolyline: toPolyline(repliesPoints),
    };
  }, []);

  const formatActivityDate = (value) => {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-400 animate-fade-in">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-700 animate-fade-in">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={18} />
          {error}
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardData(showAllActivities)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          <RefreshCcw size={15} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {data.scope === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {data.scope === 'admin'
              ? 'Showing all system leads and activities.'
              : 'Showing only your assigned leads and related activities.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="dashboard-card bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-start justify-between hover-lift"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {Number(item.value || 0).toLocaleString()}
                </h2>

                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
                    <TrendingUp size={12} />
                    {item.change}
                  </span>

                  <span className="text-xs text-slate-400">
                    vs last month
                  </span>
                </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="dashboard-card bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Lead Conversion Funnel
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {data.scope === 'admin'
                  ? 'All leads by stage'
                  : 'Your assigned leads by stage'}
              </p>
            </div>

            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 90 Days</option>
            </select>
          </div>

          <div className="relative h-[285px] mt-5 px-5 pb-7 pt-3">
            <div className="absolute inset-x-5 top-7 bottom-12 pointer-events-none">
              {[0, 1, 2, 3].map((line) => (
                <div
                  key={line}
                  className="h-1/4 border-t border-dashed border-slate-100"
                />
              ))}
            </div>

            {data.funnel.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No funnel data yet.
              </div>
            ) : (
              <div className="relative h-full flex items-end justify-between gap-4">
                {data.funnel.map((item, index) => {
                  const height = Math.max(
                    (item.count / maxFunnelCount) * 82,
                    8
                  );

                  const isSelected = selectedFunnel?.name === item.name;

                  return (
                    <div
                      key={item.name}
                      className="relative flex-1 h-full flex flex-col items-center justify-end gap-3"
                      onMouseEnter={() => setSelectedFunnel(item)}
                      onMouseLeave={() => setSelectedFunnel(null)}
                    >
                      {isSelected && (
                        <div className="absolute bottom-[92px] z-10 bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs animate-pop">
                          <p className="font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-slate-500 mt-1">
                            Leads: {item.count}
                          </p>
                        </div>
                      )}

                      <div
                        className={`dashboard-bar w-9 rounded-md ${
                          funnelColors[index % funnelColors.length]
                        }`}
                        style={{
                          '--bar-height': `${height}%`,
                          animationDelay: `${index * 90}ms`,
                        }}
                      />

                      <p className="text-xs text-slate-400 text-center whitespace-nowrap">
                        {item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Weekly Outreach
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Emails sent vs replies
            </p>
          </div>

          <div className="flex items-center gap-5 mt-5 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-1.5 w-4 bg-blue-500 rounded-full" />
              Sent
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-1.5 w-4 bg-emerald-500 rounded-full" />
              Replies
            </div>
          </div>

          <div className="relative mt-4 h-[285px] overflow-hidden">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="w-full h-[235px]"
              preserveAspectRatio="none"
            >
              {[42, 84, 126, 168].map((y) => (
                <line
                  key={y}
                  x1="26"
                  x2="494"
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {selectedWeeklyPoint && (
                <line
                  x1={selectedWeeklyPoint.x}
                  x2={selectedWeeklyPoint.x}
                  y1="20"
                  y2="185"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              )}

              <polyline
                points={chart.sentPolyline}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dashboard-line"
              />

              <polyline
                points={chart.repliesPolyline}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dashboard-line dashboard-line-delay"
              />

              {chart.sentPoints.map((point) => (
                <circle
                  key={`sent-${point.day}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3b82f6"
                  className="dashboard-dot cursor-pointer"
                  onMouseEnter={() =>
                    setSelectedWeeklyPoint({
                      ...point,
                      type: 'Sent',
                    })
                  }
                  onMouseLeave={() => setSelectedWeeklyPoint(null)}
                />
              ))}

              {chart.repliesPoints.map((point) => (
                <circle
                  key={`reply-${point.day}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#10b981"
                  className="dashboard-dot cursor-pointer"
                  onMouseEnter={() =>
                    setSelectedWeeklyPoint({
                      ...point,
                      type: 'Replies',
                    })
                  }
                  onMouseLeave={() => setSelectedWeeklyPoint(null)}
                />
              ))}
            </svg>

            {selectedWeeklyPoint && (
              <div
                className="absolute z-20 bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs animate-pop pointer-events-none"
                style={{
                  left: `clamp(80px, ${selectedWeeklyPoint.xPercent}%, calc(100% - 80px))`,
                  top: `clamp(20px, ${selectedWeeklyPoint.yPercent - 8}%, 170px)`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <p className="font-semibold text-slate-800">
                  {selectedWeeklyPoint.day}
                </p>
                <p className="text-blue-600 mt-1">
                  Sent: {selectedWeeklyPoint.sent}
                </p>
                <p className="text-emerald-600 mt-1">
                  Replies: {selectedWeeklyPoint.replies}
                </p>
              </div>
            )}

            <div className="grid grid-cols-7 text-xs text-slate-400 px-3">
              {weeklyOutreach.map((item) => (
                <span key={item.day} className="text-center">
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {showAllActivities
                ? 'Showing more activity records'
                : 'Showing latest 5 activity records'}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleActivities}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAllActivities ? 'Show less' : 'View all'}
          </button>
        </div>

        <div>
          {data.activities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No recent activities yet.
            </div>
          ) : (
            data.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-row px-5 py-4 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-4 hover:bg-slate-50"
                style={{ animationDelay: `${index * 70}ms` }}
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
                  {formatActivityDate(activity.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}