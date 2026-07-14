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
  Plus,
  Send,
  Save,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Trash2,
  Edit3,
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
    name: 'Initial Outreach',
    subject: 'Quick question about your current workflow',
    body: 'Hi {{first_name}},\n\nI noticed your company may benefit from a better CRM workflow. I would love to connect and share how LeadFlow can help your team.\n\nBest regards,',
  },
  {
    id: 2,
    name: 'Follow-up Email',
    subject: 'Following up on my previous email',
    body: 'Hi {{first_name}},\n\nI just wanted to follow up and check if you had time to review my previous message.\n\nThank you,',
  },
  {
    id: 3,
    name: 'Demo Invitation',
    subject: 'Would you like to schedule a quick demo?',
    body: 'Hi {{first_name}},\n\nI would be happy to walk you through a short demo and show how LeadFlow can support your outreach process.\n\nBest regards,',
  },
];
const getUserRoleName = (user) => {
  return (
    user?.role?.role_name ||
    user?.role_name ||
    user?.role ||
    'Staff'
  );
};

const isAdminUser = (user) => {
  return getUserRoleName(user).toLowerCase() === 'admin';
};

const hasPermission = (user, permissionKey) => {
  if (!permissionKey) return true;
  if (isAdminUser(user)) return true;

  return user?.role?.[permissionKey] === true || user?.[permissionKey] === true;
};

const canAccessModule = (user, item) => {
  if (!item) return false;
  if (item.key === 'dashboard') return true;

  if (item.adminOnly) {
    return isAdminUser(user);
  }

  if (item.permission) {
    return hasPermission(user, item.permission);
  }

  return true;
};

function DashboardShell() {
  const { user, logout } = useAuth();

  const roleName = getUserRoleName(user);
  const isAdmin = isAdminUser(user);

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
  const [emailHistory, setEmailHistory] = useState([]);

  const [teamUsers, setTeamUsers] = useState([
    {
      id: 1,
      name: 'Emelio Innovations',
      email: user?.email || 'emelio@cubetech.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Alex Rivera',
      email: 'alex@cubetech.com',
      role: 'Staff',
      status: 'Active',
    },
  ]);

    const activePage = allowedNavigationItems.find((item) => item.key === tab);

  const userInitials =
    `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase() ||
    'EI';

  const displayName = `${user?.first_name || 'emelio'} ${user?.last_name || 'Innovations'}`;

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

    const templateResults = emailTemplates
      .filter((item) => item.name.toLowerCase().includes(value))
      .map((item) => ({
        type: 'template',
        key: 'templates',
        label: item.name,
        icon: FileText,
      }));

    return [...moduleResults, ...templateResults];
  }, [searchText, emailTemplates]);

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

  const pushNotification = (description) => {
    const item = {
      id: Date.now(),
      description,
      user: displayName,
      created_at: new Date().toISOString(),
    };

    setNotifications((prev) => [item, ...prev]);
    setUnreadCount((prev) => prev + 1);
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
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const merged = [
            ...prev,
            ...recent.filter((item) => !existingIds.has(item.id)),
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

      const currentItem = navigationItems.find((item) => item.key === tab);

    if (currentItem && !canAccessModule(user, currentItem)) {
      return <AccessDeniedPage />;
    }
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
      function AccessDeniedPage() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-center">
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
      return (
        
        <EmailCampaignsPage
          selectedTemplate={selectedTemplate}
          onTemplateUsed={() => setSelectedTemplate(null)}
          onSend={(historyItem) => {
            setEmailHistory((prev) => [historyItem, ...prev]);
            pushNotification(`Email campaign sent: ${historyItem.subject}`);
          }}
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
      return <UsersRolesPage users={teamUsers} setUsers={setTeamUsers} />;
    }

    if (tab === 'settings') {
      return <SettingsPage user={user} />;
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
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
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
              className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
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
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"
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
                                <p className="text-xs text-slate-400">{roleName}</p>
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
                  placeholder="Search modules..."
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
                <div className="absolute right-0 mt-2 w-[280px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
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
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 text-left"
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
                className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
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
                <div className="absolute right-0 mt-2 w-[260px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
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
                          {user?.email || 'Admin'}
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
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50"
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
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Account Settings
                  </button>

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

      {profileModalOpen && (
        <ProfileModal
          user={user}
          displayName={displayName}
          userInitials={userInitials}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

function EmailCampaignsPage({ selectedTemplate, onTemplateUsed, onSend }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadLeads = async () => {
      const token = localStorage.getItem('lf_token');

      try {
        const res = await fetch('http://localhost:5000/api/leads?limit=100', {
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
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.body);
      onTemplateUsed?.();
    }
  }, [selectedTemplate]);

  const toggleLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((lead) => lead.id));
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim() || selectedLeads.length === 0) {
      setSuccess('Please select leads and enter both subject and message.');
      return;
    }

    const historyItem = {
      id: Date.now(),
      recipient: `${selectedLeads.length} selected lead(s)`,
      subject,
      status: 'Sent',
      created_at: new Date().toISOString(),
    };

    onSend(historyItem);
    setSuccess('Email campaign prepared and saved to email history.');
    setSubject('');
    setBody('');
    setSelectedLeads([]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">Email Campaigns</h2>
        <p className="text-sm text-slate-500 mt-1">
          Compose and send bulk email campaigns to selected leads.
        </p>

        {success && (
          <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            {success}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Write your email message..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Send size={16} />
            Send Campaign
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 self-start">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Select Leads</h3>
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-medium text-blue-600"
          >
            {selectedLeads.length === leads.length ? 'Clear' : 'Select all'}
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto">
          {leads.length === 0 ? (
            <p className="text-sm text-slate-400">No leads found.</p>
          ) : (
            leads.map((lead) => (
              <label
                key={lead.id}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead.id)}
                  onChange={() => toggleLead(lead.id)}
                  className="h-4 w-4 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="text-xs text-slate-400">{lead.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmailTemplatesPage({ templates, setTemplates, onUseTemplate }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const createTemplate = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;

    setTemplates((prev) => [
      {
        id: Date.now(),
        name,
        subject,
        body,
      },
      ...prev,
    ]);

    setName('');
    setSubject('');
    setBody('');
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">Email Templates</h2>
        <p className="text-sm text-slate-500 mt-1">
          Create and reuse common outreach email templates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-slate-200 rounded-xl p-5 hover:shadow-sm bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{template.subject}</p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-4 line-clamp-3 whitespace-pre-line">
                {template.body}
              </p>

              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 self-start">
        <h3 className="text-lg font-semibold text-slate-900">Create Template</h3>

        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          />

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Template body"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
          />

          <button
            type="button"
            onClick={createTemplate}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailHistoryPage({ history }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Email History</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review sent campaign records.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Date / Time</th>
              <th className="px-6 py-3">Recipient</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  No email history yet.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.recipient}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {item.subject}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersRolesPage({ users, setUsers }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const updateRole = (id, role) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role } : user))
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RoleCard title="Admin" description="Full access to manage users, leads, settings, and reports." />
        <RoleCard title="Staff" description="Can manage assigned leads and daily outreach activities." />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Users & Roles</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage team members and their access level.
            </p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={item.role}
                      onChange={(e) => updateRole(item.id, e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                    >
                      <option>Admin</option>
                      <option>Staff</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ title, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <ShieldCheck size={20} />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function SettingsPage({ user }) {
  const [settings, setSettings] = useState({
    name: `${user?.first_name || 'emelio'} ${user?.last_name || 'Innovations'}`,
    email: user?.email || 'emelio@cubetech.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    fromName: 'LeadFlow CRM',
  });

  const [saved, setSaved] = useState(false);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information.
        </p>

        <div className="mt-6 space-y-4">
          <SettingsInput
            label="Full Name"
            value={settings.name}
            onChange={(value) => updateSetting('name', value)}
          />
          <SettingsInput
            label="Email Address"
            value={settings.email}
            onChange={(value) => updateSetting('email', value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">Email Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure SMTP information for email sending.
        </p>

        <div className="mt-6 space-y-4">
          <SettingsInput
            label="SMTP Host"
            value={settings.smtpHost}
            onChange={(value) => updateSetting('smtpHost', value)}
          />
          <SettingsInput
            label="SMTP Port"
            value={settings.smtpPort}
            onChange={(value) => updateSetting('smtpPort', value)}
          />
          <SettingsInput
            label="From Name"
            value={settings.fromName}
            onChange={(value) => updateSetting('fromName', value)}
          />

          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Save size={16} />
            Save Settings
          </button>

          {saved && (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Settings saved locally.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function ProfileModal({ user, displayName, userInitials, onClose }) {
  const [profile, setProfile] = useState({
    name: displayName,
    email: user?.email || 'emelio@cubetech.com',
        role: getUserRoleName(user),
    company: 'CubeTech Innovations',
  });

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
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
            </div>
          </div>

          <div className="space-y-4">
            <SettingsInput
              label="Full Name"
              value={profile.name}
              onChange={(value) => setProfile((prev) => ({ ...prev, name: value }))}
            />

            <SettingsInput
              label="Email"
              value={profile.email}
              onChange={(value) => setProfile((prev) => ({ ...prev, email: value }))}
            />

            <SettingsInput
              label="Company"
              value={profile.company}
              onChange={(value) =>
                setProfile((prev) => ({ ...prev, company: value }))
              }
            />

            <SettingsInput
              label="Role"
              value={profile.role}
              onChange={(value) => setProfile((prev) => ({ ...prev, role: value }))}
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