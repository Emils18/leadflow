import React, { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetails from './pages/LeadDetails';
import CsvImporter from './components/CsvImporter';

import {
  LayoutDashboard,
  Users,
  Upload,
  Mail,
  FileText,
  Clock3,
  UserCog,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  TrendingUp,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'import', label: 'Import Leads', icon: Upload },
  { key: 'campaigns', label: 'Email Campaigns', icon: Mail },
  { key: 'templates', label: 'Email Templates', icon: FileText },
  { key: 'history', label: 'Email History', icon: Clock3 },
  { key: 'users', label: 'Users & Roles', icon: UserCog },
  { key: 'settings', label: 'Settings', icon: Settings },
];

function PlaceholderPage({ title }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-2">
        This module is shown in the Figma design but is not yet implemented in the current codebase.
      </p>
    </div>
  );
}

function DashboardShell() {
  const { user, logout } = useAuth();

  const [tab, setTab] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const activePage = navigationItems.find((item) => item.key === tab);

  const userInitials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase() || 'EI';

  const displayName = `${user?.first_name || 'emelio'} ${user?.last_name || 'Innovations'}`;

  const searchResults = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) return [];

    return navigationItems.filter((item) =>
      item.label.toLowerCase().includes(value)
    );
  }, [searchText]);

  const openTab = (key) => {
    setTab(key);
    setSelectedLeadId(null);
    setMobileSidebarOpen(false);
    setSearchOpen(false);
    setSearchText('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchResults.length > 0) {
      openTab(searchResults[0].key);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('lf_token');

    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/dashboard/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.activities)) {
        const recent = data.activities.slice(0, 5);
        setNotifications(recent);
        setUnreadCount(recent.length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const renderActiveTab = () => {
    if (selectedLeadId) {
      return (
        <LeadDetails
          leadId={selectedLeadId}
          onBack={() => setSelectedLeadId(null)}
        />
      );
    }

    if (tab === 'dashboard') return <Dashboard />;

    if (tab === 'leads') {
      return <LeadList onSelectLead={(id) => setSelectedLeadId(id)} />;
    }

    if (tab === 'import') {
      return <CsvImporter onCompleted={loadNotifications} />;
    }

    if (tab === 'campaigns') return <PlaceholderPage title="Email Campaigns" />;
    if (tab === 'templates') return <PlaceholderPage title="Email Templates" />;
    if (tab === 'history') return <PlaceholderPage title="Email History" />;
    if (tab === 'users') return <PlaceholderPage title="Users & Roles" />;
    if (tab === 'settings') return <PlaceholderPage title="Settings" />;

    return <Dashboard />;
  };

  const SidebarContent = () => (
    <aside
      className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-[76px]' : 'w-[220px]'
      }`}
    >
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>

          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-slate-900">LeadFlow</span>
          )}
        </div>

        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key && !selectedLeadId;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              title={sidebarCollapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-3">
        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"
        >
          {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>

        {!sidebarCollapsed && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userInitials}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 flex items-center justify-center"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative h-full w-[240px] bg-white">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600"
            >
              <Menu size={19} />
            </button>

            <h1 className="text-base font-semibold text-slate-900 truncate">
              {selectedLeadId ? 'Lead Details' : activePage?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <form onSubmit={handleSearchSubmit}>
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setSearchOpen(true);
                  }}
                  className="w-[190px] md:w-[260px] pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </form>

              {searchOpen && searchText.trim() && (
                <div className="absolute right-0 mt-2 w-[260px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">
                      No module found.
                    </div>
                  ) : (
                    searchResults.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openTab(item.key)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Icon size={16} className="text-slate-400" />
                          {item.label}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                  setUnreadCount(0);
                }}
                className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h3>

                    <button
                      type="button"
                      onClick={loadNotifications}
                      className="text-xs font-medium text-blue-600"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-sm text-slate-400 text-center">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                        >
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-400">
                              by {item.user || 'system'}
                            </span>

                            <span className="text-xs text-slate-400">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString()
                                : ''}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <div className="h-9 w-9 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                  {userInitials}
                </div>

                <ChevronDown size={15} className="hidden sm:block text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-[220px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || 'Admin'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Loading LeadFlow...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <DashboardShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}