import React, { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetails from './pages/LeadDetails';
import CsvImporter from './components/CsvImporter';
import ReactDOM from 'react-dom';

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
  Plus,
  Send,
  Save,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  AlertCircle,
  RefreshCcw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignJustify,
} from 'lucide-react';

const navigationItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'leads',
    label: 'Leads',
    icon: Users,
    permission: 'can_manage_leads',
  },
  {
    key: 'import',
    label: 'Import Leads',
    icon: Upload,
    adminOnly: true,
  },
  {
    key: 'campaigns',
    label: 'Email Campaigns',
    icon: Mail,
    permission: 'can_send_email',
  },
  {
    key: 'templates',
    label: 'Email Templates',
    icon: FileText,
    permission: 'can_send_email',
  },
  {
    key: 'history',
    label: 'Email History',
    icon: Clock3,
    permission: 'can_send_email',
  },
  {
    key: 'users',
    label: 'Users & Roles',
    icon: UserCog,
    permission: 'can_manage_users',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    permission: 'can_manage_settings',
  },
];

const defaultTemplates = [
  {
    id: 1,
    name: 'Cold Outreach — SaaS Founders',
    modified: 'Jun 20, 2026',
    subject: 'Quick question about your current workflow',
    body:
      "Hi {{first_name}},\n\nI noticed you've been scaling {{company}} recently — congrats on the growth! I wanted to reach out because we've been helping companies like {{company}} significantly improve their lead generation and outreach results.\n\nWould you be open to a quick 15-minute call this week to explore how we might help?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
  },
  {
    id: 2,
    name: 'Follow-Up After Demo',
    modified: 'Jun 18, 2026',
    subject: 'LeadFlow Demo — Schedule Confirmation',
    body:
      "Hi {{first_name}},\n\nThanks for joining our demo yesterday. Here's a quick recap of what we covered and the next steps we discussed.\n\nWould you like me to send a formal implementation plan for {{company}}?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
  },
  {
    id: 3,
    name: 'Re-engagement — 30 Days Inactive',
    modified: 'Jun 15, 2026',
    subject: 'Still interested in improving your outreach workflow?',
    body:
      "Hi {{first_name}},\n\nIt's been a while! I wanted to circle back with something new that might be relevant to what you're building at {{company}}.\n\nWould it make sense to reconnect this week?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
  },
  {
    id: 4,
    name: 'Partnership Introduction',
    modified: 'Jun 10, 2026',
    subject: 'Partnership Opportunity at {{company}}',
    body:
      "Hi {{first_name}},\n\nI'm reaching out because we've been helping companies like {{company}} generate qualified leads at scale with a clean CRM outreach workflow.\n\nWould you be open to exploring a possible partnership?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
  },
];

const defaultEmailHistory = [
  {
    id: 1,
    date: 'Jun 22, 2026 09:14',
    recipient: 'Sarah Chen',
    email: 'sarah@acmecorp.com',
    subject: 'Re: Partnership Opportunity at Acme',
    status: 'Replied',
    body: 'Sarah replied to the partnership email.',
  },
  {
    id: 2,
    date: 'Jun 21, 2026 14:32',
    recipient: 'James Okafor',
    email: 'james@novatech.io',
    subject: 'LeadFlow Demo — Schedule Confirmation',
    status: 'Opened',
    body: 'James opened the demo confirmation email.',
  },
  {
    id: 3,
    date: 'Jun 20, 2026 11:05',
    recipient: 'Priya Sharma',
    email: 'priya@cloudstack.dev',
    subject: 'Intro: Save 8hrs/week with LeadFlow',
    status: 'Delivered',
    body: 'Introductory outreach email delivered successfully.',
  },
  {
    id: 4,
    date: 'Jun 20, 2026 09:00',
    recipient: 'Lucas Martins',
    email: 'lucas@brightai.com',
    subject: 'Quick question about your outreach workflow',
    status: 'Sent',
    body: 'Cold outreach email was sent.',
  },
  {
    id: 5,
    date: 'Jun 19, 2026 16:45',
    recipient: 'Yuki Tanaka',
    email: 'yuki@ryokan.jp',
    subject: 'Follow-up: Our last conversation',
    status: 'Failed',
    body: 'The email failed to send.',
  },
  {
    id: 6,
    date: 'Jun 19, 2026 10:30',
    recipient: 'Emma Vandenberg',
    email: 'emma@fintechone.eu',
    subject: 'Case study — how FinTech teams grow pipeline',
    status: 'Opened',
    body: 'Emma opened the case study email.',
  },
];

const fallbackRoles = [
  {
    id: 1,
    role_name: 'Admin',
    can_manage_leads: true,
    can_send_email: true,
    can_manage_users: true,
    can_manage_settings: true,
  },
  {
    id: 2,
    role_name: 'Staff',
    can_manage_leads: true,
    can_send_email: true,
    can_manage_users: false,
    can_manage_settings: false,
  },
];

const fallbackUsers = [
  {
    id: 1,
    name: 'Alex Rivera',
    first_name: 'Alex',
    last_name: 'Rivera',
    email: 'alex@leadflow.io',
    role_id: 1,
    role: 'Admin',
    status: 'active',
    avatar_initials: 'AR',
    last_login_at: 'Jun 22, 2026 08:45',
  },
  {
    id: 2,
    name: 'Maria Lopez',
    first_name: 'Maria',
    last_name: 'Lopez',
    email: 'maria@leadflow.io',
    role_id: 2,
    role: 'Staff',
    status: 'active',
    avatar_initials: 'ML',
    last_login_at: 'Jun 22, 2026 09:12',
  },
  {
    id: 3,
    name: 'Tom Harris',
    first_name: 'Tom',
    last_name: 'Harris',
    email: 'tom@leadflow.io',
    role_id: 2,
    role: 'Staff',
    status: 'active',
    avatar_initials: 'TH',
    last_login_at: 'Jun 21, 2026 17:30',
  },
  {
    id: 4,
    name: 'Lisa Park',
    first_name: 'Lisa',
    last_name: 'Park',
    email: 'lisa@leadflow.io',
    role_id: 2,
    role: 'Staff',
    status: 'inactive',
    avatar_initials: 'LP',
    last_login_at: 'Jun 10, 2026 11:00',
  },
];

function getAuthHeaders() {
  const token = localStorage.getItem('lf_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function getUserRoleName(user) {
  return user?.role?.role_name || user?.role_name || user?.role || 'Staff';
}

function getUserFullName(user) {
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user?.name || user?.email || 'LeadFlow User';
}

function getUserInitials(user, displayName) {
  if (user?.avatar_initials) return user.avatar_initials;

  const source = displayName || user?.email || 'LU';

  return source
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function isAdminUser(user) {
  return getUserRoleName(user).toLowerCase() === 'admin';
}

function hasPermission(user, permissionKey) {
  if (!permissionKey) return true;
  if (isAdminUser(user)) return true;

  return (
    user?.permissions?.[permissionKey] === true ||
    user?.role?.[permissionKey] === true ||
    user?.[permissionKey] === true
  );
}

function canAccessModule(user, item) {
  if (!item) return false;
  if (item.key === 'dashboard') return true;

  if (item.adminOnly) {
    return isAdminUser(user);
  }

  if (item.permission) {
    return hasPermission(user, item.permission);
  }

  return true;
}

function getRoleById(roles, roleId) {
  return roles.find((role) => Number(role.id) === Number(roleId));
}

function getRoleName(roles, user) {
  const fromRole = getRoleById(roles, user.role_id);
  return fromRole?.role_name || user.role?.role_name || user.role || 'Staff';
}

function statusBadgeClass(status) {
  const value = String(status || '').toLowerCase();

  if (value === 'replied') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (value === 'opened') {
    return 'bg-violet-50 text-violet-700 border-violet-100';
  }

  if (value === 'delivered') {
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }

  if (value === 'failed') {
    return 'bg-red-50 text-red-700 border-red-100';
  }

  if (value === 'draft') {
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }

  return 'bg-slate-100 text-slate-600 border-slate-100';
}

function AccessDeniedPage() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-center animate-fade-in">
      <div className="mx-auto h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
        <ShieldCheck size={22} />
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mt-4">
        Access Restricted
      </h2>

      <p className="text-sm text-slate-500 mt-2">
        Your current role does not have permission to open this module.
      </p>
    </div>
  );
}

function DashboardShell() {
  const { user, logout } = useAuth();

  const displayName = getUserFullName(user);
  const roleName = getUserRoleName(user);
  const userInitials = getUserInitials(user, displayName);

  const allowedNavigationItems = useMemo(() => {
    return navigationItems.filter((item) => canAccessModule(user, item));
  }, [user]);

  const [tab, setTab] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [emailTemplates, setEmailTemplates] = useState(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailHistory, setEmailHistory] = useState(defaultEmailHistory);

  const activePage = allowedNavigationItems.find((item) => item.key === tab);

  useEffect(() => {
    const currentItem = navigationItems.find((item) => item.key === tab);

    if (currentItem && !canAccessModule(user, currentItem)) {
      setTab('dashboard');
      setSelectedLeadId(null);
    }
  }, [tab, user]);

  const searchResults = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) return [];

    const moduleResults = allowedNavigationItems
      .filter((item) => item.label.toLowerCase().includes(value))
      .map((item) => ({
        type: 'module',
        key: item.key,
        label: item.label,
        icon: item.icon,
      }));

    const canSearchTemplates = canAccessModule(
      user,
      navigationItems.find((item) => item.key === 'templates')
    );

    const templateResults = canSearchTemplates
      ? emailTemplates
          .filter((item) => item.name.toLowerCase().includes(value))
          .map((item) => ({
            type: 'template',
            key: 'templates',
            label: item.name,
            icon: FileText,
          }))
      : [];

    return [...moduleResults, ...templateResults];
  }, [searchText, emailTemplates, allowedNavigationItems, user]);

  const openTab = (key) => {
    const targetItem = navigationItems.find((item) => item.key === key);

    if (targetItem && !canAccessModule(user, targetItem)) {
      setTab('dashboard');
      setSelectedLeadId(null);
      setMobileSidebarOpen(false);
      setSearchOpen(false);
      setSearchText('');
      return;
    }

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

  const pushNotification = (description) => {
    const item = {
      id: Date.now(),
      description,
      user: displayName,
      created_at: new Date().toISOString(),
    };

    setNotifications((prev) => [item, ...prev].slice(0, 8));
    setUnreadCount((prev) => prev + 1);
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('lf_token');

    if (!token) return;

    try {
      const res = await fetch('/api/dashboard/metrics?activityLimit=5', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.activities)) {
        const recent = data.activities.slice(0, 5);

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const merged = [
            ...recent.filter((item) => !existingIds.has(item.id)),
            ...prev,
          ];

          return merged.slice(0, 8);
        });

        setUnreadCount((prev) => Math.max(prev, recent.length));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const renderActiveTab = () => {
    const currentItem = navigationItems.find((item) => item.key === tab);

    if (currentItem && !canAccessModule(user, currentItem)) {
      return <AccessDeniedPage />;
    }

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
      return (
        <CsvImporter
          onCompleted={() => {
            loadNotifications();
            pushNotification('Lead import completed successfully.');
          }}
        />
      );
    }

    if (tab === 'campaigns') {
      return (
        <EmailCampaignsPage
          templates={emailTemplates}
          selectedTemplate={selectedTemplate}
          onTemplateUsed={() => setSelectedTemplate(null)}
          onSend={(historyItem) => {
            setEmailHistory((prev) => [historyItem, ...prev]);
            pushNotification(`Email campaign saved: ${historyItem.subject}`);
          }}
          user={user}
        />
      );
    }

    if (tab === 'templates') {
      return (
        <EmailTemplatesPage
          templates={emailTemplates}
          setTemplates={setEmailTemplates}
          onUseTemplate={(template) => {
            setSelectedTemplate(template);
            openTab('campaigns');
          }}
        />
      );
    }

    if (tab === 'history') {
      return <EmailHistoryPage history={emailHistory} />;
    }

    if (tab === 'users') {
      return <UsersRolesPage currentUser={user} />;
    }

    if (tab === 'settings') {
      return <SettingsPage user={user} roleName={roleName} />;
    }

    return <Dashboard />;
  };

  const SidebarContent = () => (
    <aside
      className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-[76px]' : 'w-[220px]'
      }`}
    >
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
            <TrendingUp size={18} />
          </div>

          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-slate-900 truncate">
              LeadFlow
            </span>
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

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {allowedNavigationItems.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key && !selectedLeadId;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => openTab(item.key)}
            title={sidebarCollapsed ? item.label : ''}
            className={`relative w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
              sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
            } ${
              active
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {active && !sidebarCollapsed && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
            )}

            <Icon size={18} className="shrink-0" />

            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-3">
        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-all"
        >
          {sidebarCollapsed ? (
            <ChevronsRight size={16} />
          ) : (
            <ChevronsLeft size={16} />
          )}

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

                <p className="text-xs text-slate-400 truncate">{roleName}</p>
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
      <div className="hidden lg:block h-full shrink-0">
        <SidebarContent />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden animate-fade-in">
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
                  className="w-[190px] md:w-[260px] pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </form>

              {searchOpen && searchText.trim() && (
                <div className="absolute right-0 mt-2 w-[280px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">
                      No result found.
                    </div>
                  ) : (
                    searchResults.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={`${item.label}-${index}`}
                          type="button"
                          onClick={() => openTab(item.key)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 text-left transition-all"
                        >
                          <Icon size={16} className="text-slate-400" />

                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-slate-400">
                              {item.type === 'template'
                                ? 'Email template'
                                : 'Module'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                  setUnreadCount(0);
                }}
                className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
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
                          className="px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
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
                <div className="absolute right-0 mt-2 w-[260px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                        {userInitials}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {displayName}
                        </p>

                        <p className="text-xs text-slate-400 truncate">
                          {user?.email || 'No email'}
                        </p>

                        <p className="text-xs text-blue-500 font-medium truncate mt-0.5">
                          {roleName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalOpen(true);
                      setProfileOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCog size={16} />
                    Manage Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openTab('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={16} />
                    Account Settings
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="w-full max-w-[1440px] mx-auto">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {profileModalOpen && (
        <ProfileModal
          user={user}
          displayName={displayName}
          userInitials={userInitials}
          roleName={roleName}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

function EmailCampaignsPage({
  templates,
  selectedTemplate,
  onTemplateUsed,
  onSend,
  user,
}) {
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    from: user?.email || 'alex@leadflow.io',
    to: '',
    subject: '',
    body:
      "Hi {{first_name}},\n\nI hope this finds you well. I wanted to reach out because we've been helping companies like {{company}} significantly improve their lead generation and outreach results.\n\nWould you be open to a quick 15-minute call this week to explore how we might help?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
  });

  useEffect(() => {
    const loadLeads = async () => {
      const token = localStorage.getItem('lf_token');

      try {
        const res = await fetch('/api/leads?limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.leads)
            ? data.leads
            : [];

        setLeads(list);
      } catch (err) {
        console.error(err);
      }
    };

    loadLeads();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setSelectedTemplateId(String(selectedTemplate.id));
      setForm((prev) => ({
        ...prev,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
      }));
      onTemplateUsed?.();
    }
  }, [selectedTemplate, onTemplateUsed]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSuccess('');
  };

  const handleTemplateChange = (value) => {
    setSelectedTemplateId(value);

    if (!value) return;

    const template = templates.find((item) => String(item.id) === String(value));

    if (template) {
      setForm((prev) => ({
        ...prev,
        subject: template.subject,
        body: template.body,
      }));
    }
  };

  const toggleLead = (lead) => {
    setSelectedLeads((prev) => {
      const exists = prev.some((item) => item.id === lead.id);

      if (exists) {
        return prev.filter((item) => item.id !== lead.id);
      }

      return [...prev, lead];
    });
  };

  const applySelectedLeads = () => {
    const emails = selectedLeads
      .map((lead) => lead.email)
      .filter(Boolean)
      .join(', ');

    setForm((prev) => ({
      ...prev,
      to: emails,
    }));

    setShowLeadPicker(false);
  };

  const createHistoryItem = (status) => ({
    id: Date.now(),
    date: new Date().toLocaleString(),
    recipient: selectedLeads.length
      ? `${selectedLeads.length} selected lead(s)`
      : form.to || 'Manual recipient',
    email: form.to || '',
    subject: form.subject || 'Untitled Email',
    status,
    body: form.body,
  });

  const handleSend = () => {
    if (!form.subject.trim() || !form.body.trim()) {
      setSuccess('Please enter both subject and message.');
      return;
    }

    onSend(createHistoryItem('Sent'));
    setSuccess('Email saved to Email History.');
  };

  const handleSaveDraft = () => {
    if (!form.subject.trim() && !form.body.trim()) {
      setSuccess('Please enter a subject or message before saving a draft.');
      return;
    }

    onSend(createHistoryItem('Draft'));
    setSuccess('Draft saved to Email History.');
  };

  return (
   <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Email Campaigns
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Compose and send targeted outreach to your leads
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLeadPicker(true)}
            className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
          >
            Select Leads
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20"
          >
            <Send size={16} />
            Send Bulk Email
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-3xl hover-lift">
        <h3 className="text-base font-semibold text-slate-900 mb-5">
          Compose Email
        </h3>

        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 animate-fade-in">
            {success}
          </div>
        )}

        <div className="space-y-0 border-b border-slate-100">
          <EmailLine label="From">
            <input
              value={form.from}
              onChange={(e) => updateForm('from', e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700"
            />
          </EmailLine>

          <EmailLine label="To">
            <input
              value={form.to}
              onChange={(e) => updateForm('to', e.target.value)}
              placeholder="Select leads or enter addresses..."
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </EmailLine>

          <EmailLine label="Subject">
            <input
              value={form.subject}
              onChange={(e) => updateForm('subject', e.target.value)}
              placeholder="Enter subject line..."
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </EmailLine>

          <EmailLine label="Template" noBorder>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700"
            >
              <option value="">No template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </EmailLine>
        </div>

        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
          <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 text-slate-500">
            <div className="flex items-center gap-4">
              <Bold size={14} />
              <Italic size={14} />
              <Underline size={14} />
              <span className="text-slate-300">|</span>
              <AlignLeft size={14} />
              <AlignJustify size={14} />
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-500">Link</span>
            </div>

            <div className="text-xs text-slate-400">
              {'{{first_name}}'} {'{{company}}'}
            </div>
          </div>

          <textarea
            value={form.body}
            onChange={(e) => updateForm('body', e.target.value)}
            rows={12}
            className="w-full p-5 resize-none outline-none text-sm text-slate-800 leading-7"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20"
          >
            <Send size={16} />
            Send Email
          </button>
        </div>
      </div>

      {showLeadPicker && (
        <LeadPickerModal
          leads={leads}
          selectedLeads={selectedLeads}
          onToggleLead={toggleLead}
          onApply={applySelectedLeads}
          onClose={() => setShowLeadPicker(false)}
        />
      )}
    </div>
  );
}

function EmailLine({ label, children, noBorder = false }) {
  return (
    <div
      className={`grid grid-cols-[70px_1fr] items-center px-3 py-3 ${
        noBorder ? '' : 'border-b border-slate-100'
      }`}
    >
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function LeadPickerModal({
  leads,
  selectedLeads,
  onToggleLead,
  onApply,
  onClose,
}) {
  const fallbackLeads = [
    {
      id: 1,
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah@acmecorp.com',
    },
    {
      id: 2,
      first_name: 'James',
      last_name: 'Okafor',
      email: 'james@novatech.io',
    },
    {
      id: 3,
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya@cloudstack.dev',
    },
  ];

  const safeLeads = leads.length ? leads : fallbackLeads;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-pop">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Select Leads</h3>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-4 space-y-2">
          {safeLeads.map((lead) => {
            const selected = selectedLeads.some((item) => item.id === lead.id);

            return (
              <label
                key={lead.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selected
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleLead(lead)}
                  className="h-4 w-4 accent-blue-600"
                />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {lead.first_name} {lead.last_name}
                  </p>

                  <p className="text-xs text-slate-400">{lead.email}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onApply}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}







function EmailTemplatesPage({ templates, setTemplates, onUseTemplate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const openCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const saveTemplate = (template) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === editingTemplate.id
            ? {
                ...item,
                ...template,
                modified: new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              }
            : item
        )
      );
    } else {
      setTemplates((prev) => [
        {
          id: Date.now(),
          ...template,
          modified: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
    setEditingTemplate(null);
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Email Templates
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {templates.length} templates
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-5xl">
        {templates.map((template, index) => (
          <div
            key={template.id}
            className="group animate-row bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover-lift hover:border-blue-200 transition-all duration-300"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={18} />
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => openEdit(template)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteTemplate(template.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h3 className="text-base font-semibold text-slate-900 mt-5">
              {template.name}
            </h3>

            <p className="text-sm text-slate-400 mt-3 line-clamp-2 leading-6">
              {template.body}
            </p>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-400">
                Modified {template.modified || 'Recently'}
              </p>

              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-all hover:-translate-y-0.5"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <TemplateModal
          template={editingTemplate}
          onSave={saveTemplate}
          onClose={() => {
            setModalOpen(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateModal({ template, onSave, onClose }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return;
    onSave(form);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-pop">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {template ? 'Edit Template' : 'Create Template'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <SettingsInput
            label="Template Name"
            value={form.name}
            onChange={(value) => updateForm('name', value)}
          />

          <SettingsInput
            label="Subject"
            value={form.subject}
            onChange={(value) => updateForm('subject', value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Body
            </label>

            <textarea
              value={form.body}
              onChange={(e) => updateForm('body', e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Save size={16} />
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}





function EmailHistoryPage({ history }) {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [page, setPage] = useState(1);

  const filteredHistory = history.filter((item) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      item.recipient.toLowerCase().includes(searchValue) ||
      item.email.toLowerCase().includes(searchValue) ||
      item.subject.toLowerCase().includes(searchValue);

    const matchesStatus =
      status === 'All Statuses' || item.status.toLowerCase() === status.toLowerCase();

    const matchesDate = !date || item.date.includes(date);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const pageSize = 6;
  const pageCount = Math.max(Math.ceil(filteredHistory.length / pageSize), 1);

  const visibleRows = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search email history..."
            className="w-full lg:w-[260px] pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <input
          type="text"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          placeholder="mm/dd/yyyy"
          className="w-full lg:w-[180px] px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full lg:w-[150px] px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        >
          <option>All Statuses</option>
          <option>Sent</option>
          <option>Delivered</option>
          <option>Opened</option>
          <option>Replied</option>
          <option>Failed</option>
          <option>Draft</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-5xl hover-lift">
        <div className="overflow-x-auto responsive-table">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400">
                    No email history found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group animate-row border-t border-slate-100 hover:bg-slate-50/80 transition-all duration-200"
                    style={{ animationDelay: `${index * 55}ms` }}
                  >
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                          {item.recipient
                            .split(' ')
                            .map((part) => part.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.recipient}
                          </p>

                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700 max-w-[280px] truncate">
                      {item.subject}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-md border text-xs font-medium ${statusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedHistory(item)}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{visibleRows.length}</span> of 248 emails
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>

            {[1, 2].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                  page === item
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedHistory && (
        <EmailViewModal
          item={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}
    </div>
  );
}


function EmailViewModal({ item, onClose }) {
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-pop">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Email Details
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DetailBlock
            label="Recipient"
            value={`${item.recipient} — ${item.email}`}
          />
          <DetailBlock label="Subject" value={item.subject} />
          <DetailBlock label="Status" value={item.status} />
          <DetailBlock label="Date" value={item.date} />

          <div>
            <p className="text-xs text-slate-400 uppercase">Message</p>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line leading-6">
              {item.body || 'No message body saved.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}







function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function UsersRolesPage({ currentUser }) {
  const [users, setUsers] = useState(fallbackUsers);
  const [roles, setRoles] = useState(fallbackRoles);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  const loadUsersAndRoles = async () => {
    setLoading(true);

    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/users/roles', {
          headers: getAuthHeaders(),
        }),
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      if (usersRes.ok && Array.isArray(usersData)) {
        setUsers(usersData);
      }

      if (rolesRes.ok && Array.isArray(rolesData)) {
        setRoles(rolesData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  const adminCount = users.filter(
    (user) => getRoleName(roles, user).toLowerCase() === 'admin'
  ).length;

  const staffCount = users.filter(
    (user) => getRoleName(roles, user).toLowerCase() === 'staff'
  ).length;

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const saveUser = async (payload) => {
    setMessage('');

    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        ...payload,
        id: editingUser.id,
        role: getRoleById(roles, payload.role_id)?.role_name || editingUser.role,
      };

      setUsers((prev) =>
        prev.map((item) => (item.id === editingUser.id ? updatedUser : item))
      );

      try {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            role_id: Number(payload.role_id),
            status: payload.status,
          }),
        });
      } catch (err) {
        console.error(err);
      }

      setMessage('User updated successfully.');
    } else {
      const newItem = {
        id: Date.now(),
        ...payload,
        name: `${payload.first_name} ${payload.last_name}`,
        role: getRoleById(roles, payload.role_id)?.role_name || 'Staff',
        avatar_initials: `${payload.first_name?.[0] || ''}${payload.last_name?.[0] || ''}`.toUpperCase(),
        last_login_at: 'Never',
      };

      setUsers((prev) => [newItem, ...prev]);

      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...payload,
            role_id: Number(payload.role_id),
          }),
        });
      } catch (err) {
        console.error(err);
      }

      setMessage('User created successfully.');
    }

    setModalOpen(false);
    setEditingUser(null);
  };

  const deactivateUser = async (user) => {
    const nextStatus =
      String(user.status).toLowerCase() === 'active' ? 'inactive' : 'active';

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const currentUserId = Number(currentUser?.id);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Users & Roles
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {users.length} members
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <RoleSummaryCard
          title="Admin"
          description="Full system access — manage leads, emails, users, and settings."
          count={`${adminCount} user${adminCount === 1 ? '' : 's'}`}
        />

        <RoleSummaryCard
          title="Staff"
          description="Manage assigned leads and run email outreach campaigns."
          count={`${staffCount} user${staffCount === 1 ? '' : 's'}`}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover-lift">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {loading ? 'Refreshing users...' : 'Team member access list'}
          </div>

          <button
            type="button"
            onClick={loadUsersAndRoles}
            className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
          >
            <RefreshCcw size={16} />
          </button>
        </div>

        <div className="overflow-x-auto responsive-table">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => {
                const name =
                  user.name ||
                  `${user.first_name || ''} ${user.last_name || ''}`.trim();

                const role = getRoleName(roles, user);
                const isSelf = Number(user.id) === currentUserId;
                const active = String(user.status).toLowerCase() === 'active';

                return (
                  <tr
                    key={user.id}
                    className="group animate-row border-t border-slate-100 hover:bg-slate-50/80 transition-all duration-200"
                    style={{ animationDelay: `${index * 55}ms` }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                          {user.avatar_initials ||
                            name
                              .split(' ')
                              .map((part) => part.charAt(0))
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                        </div>

                        <p className="font-semibold text-slate-900 max-w-[120px]">
                          {name}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-md border text-xs font-medium ${
                          role.toLowerCase() === 'admin'
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                      {user.last_login_at || 'Never'}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${
                          active ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            active ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => deactivateUser(user)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <UserModal
          user={editingUser}
          roles={roles}
          onSave={saveUser}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function RoleSummaryCard({ title, description, count }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover-lift">
      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 rounded-md border text-sm font-medium ${
            title === 'Admin'
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {title}
        </span>

        <p className="text-sm text-slate-500 flex-1">{description}</p>

        <p className="text-sm text-slate-400 whitespace-nowrap">{count}</p>
      </div>
    </div>
  );
}


function UserModal({ user, roles, onSave, onClose }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || user?.name?.split(' ')?.[0] || '',
    last_name: user?.last_name || user?.name?.split(' ')?.slice(1).join(' ') || '',
    email: user?.email || '',
    password: '',
    role_id: user?.role_id || roles[0]?.id || '',
    status: user?.status || 'active',
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      return;
    }

    onSave({
      ...form,
      role_id: Number(form.role_id),
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-pop">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {user ? 'Edit User' : 'Add User'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <SettingsInput
            label="First Name"
            value={form.first_name}
            onChange={(value) => updateForm('first_name', value)}
          />

          <SettingsInput
            label="Last Name"
            value={form.last_name}
            onChange={(value) => updateForm('last_name', value)}
          />

          <SettingsInput
            label="Email"
            value={form.email}
            onChange={(value) => updateForm('email', value)}
          />

          {!user && (
            <SettingsInput
              label="Temporary Password"
              value={form.password}
              type="password"
              onChange={(value) => updateForm('password', value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>

            <select
              value={form.role_id}
              onChange={(e) => updateForm('role_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) => updateForm('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Save size={16} />
            {user ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}






function SettingsPage({ user, roleName }) {
  const [accountSettings, setAccountSettings] = useState({
    companyName: 'LeadFlow Inc.',
    adminEmail: user?.email || 'alex@leadflow.io',
    timezone: 'UTC-5 (Eastern Time)',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    fromName: getUserFullName(user),
  });

  const [saved, setSaved] = useState('');

  const updateAccountSetting = (key, value) => {
    setAccountSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved('');
  };

  const updateEmailSetting = (key, value) => {
    setEmailSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved('');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {saved && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {saved}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover-lift">
        <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>

        <div className="mt-5 space-y-4">
          <SettingsInput
            label="Company Name"
            value={accountSettings.companyName}
            onChange={(value) => updateAccountSetting('companyName', value)}
          />

          <SettingsInput
            label="Admin Email"
            value={accountSettings.adminEmail}
            onChange={(value) => updateAccountSetting('adminEmail', value)}
          />

          <SettingsInput
            label="Timezone"
            value={accountSettings.timezone}
            onChange={(value) => updateAccountSetting('timezone', value)}
          />

          <SettingsInput
            label="Current Role"
            value={roleName}
            readOnly
            onChange={() => {}}
          />

          <button
            type="button"
            onClick={() => setSaved('Account settings saved.')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover-lift">
        <h2 className="text-lg font-semibold text-slate-900">Email Configuration</h2>

        <div className="mt-5 space-y-4">
          <SettingsInput
            label="SMTP Host"
            value={emailSettings.smtpHost}
            onChange={(value) => updateEmailSetting('smtpHost', value)}
          />

          <SettingsInput
            label="SMTP Port"
            value={emailSettings.smtpPort}
            onChange={(value) => updateEmailSetting('smtpPort', value)}
          />

          <SettingsInput
            label="From Name"
            value={emailSettings.fromName}
            onChange={(value) => updateEmailSetting('fromName', value)}
          />

          <button
            type="button"
            onClick={() => setSaved('Email configuration saved.')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
          readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white'
        }`}
      />
    </div>
  );
}

function ProfileModal({ user, displayName, userInitials, roleName, onClose }) {
  const [profile, setProfile] = useState({
    name: displayName,
    email: user?.email || '',
    role: roleName,
    company: 'CubeTech Innovations',
  });

  useEffect(() => {
    setProfile({
      name: displayName,
      email: user?.email || '',
      role: roleName,
      company: 'CubeTech Innovations',
    });
  }, [user, displayName, roleName]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Manage Profile</h2>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
              {userInitials}
            </div>

            <div>
              <p className="font-semibold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-400">{profile.email}</p>
              <p className="text-sm text-blue-500 font-medium">{profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <SettingsInput
              label="Full Name"
              value={profile.name}
              onChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
            />

            <SettingsInput
              label="Email"
              value={profile.email}
              onChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  email: value,
                }))
              }
            />

            <SettingsInput
              label="Company"
              value={profile.company}
              onChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  company: value,
                }))
              }
            />

            <SettingsInput
              label="Role"
              value={profile.role}
              readOnly
              onChange={() => {}}
            />

            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              <Save size={16} />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-400">
        Loading LeadFlow CRM...
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