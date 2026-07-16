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
  CheckCircle2,
  Trash2,
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

const defaultTemplates = [
  {
    id: 1,
    name: 'Cold Outreach — SaaS Founders',
    subject: 'Scaling {{company}} with better lead outreach',
    body: "Hi {{first_name}},\n\nI noticed you've been scaling {{company}} recently — congrats on the growth! I wanted to reach out because we help SaaS teams improve their lead generation and outreach results.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\nAlex Rivera\nLeadFlow CRM",
    modified_at: '2026-06-20',
  },
  {
    id: 2,
    name: 'Follow-Up After Demo',
    subject: 'Quick recap after our demo',
    body: "Thanks for joining our demo yesterday, {{first_name}}. Here's a quick recap of what we covered and the next steps we discussed.\n\nLet me know if your team would like to move forward this week.\n\nBest,\nAlex Rivera",
    modified_at: '2026-06-18',
  },
  {
    id: 3,
    name: 'Re-engagement — 30 Days Inactive',
    subject: 'Still interested in improving {{company}} outreach?',
    body: "{{first_name}}, it's been a while! I wanted to circle back with something new that might be relevant to what you're building at {{company}}.\n\nWould you like me to send over the updated details?",
    modified_at: '2026-06-15',
  },
  {
    id: 4,
    name: 'Partnership Introduction',
    subject: 'Potential partnership with {{company}}',
    body: "Hi {{first_name}},\n\nI'm reaching out because we've been helping companies like {{company}} generate qualified leads at scale with smarter CRM workflows.\n\nWould you be open to exploring a possible partnership?",
    modified_at: '2026-06-10',
  },
];

const defaultEmailHistory = [
  {
    id: 1,
    recipient: 'Sarah Chen',
    recipient_email: 'sarah@acmecorp.com',
    subject: 'Re: Partnership Opportunity at Acme',
    status: 'Replied',
    created_at: '2026-06-22T09:14:00',
    body: 'Hi Sarah, following up on the partnership opportunity we discussed.',
  },
  {
    id: 2,
    recipient: 'James Okafor',
    recipient_email: 'james@novatech.io',
    subject: 'LeadFlow Demo — Schedule Confirmed',
    status: 'Opened',
    created_at: '2026-06-21T14:32:00',
    body: 'Your LeadFlow demo schedule has been confirmed.',
  },
  {
    id: 3,
    recipient: 'Priya Sharma',
    recipient_email: 'priya@cloudstack.dev',
    subject: 'Intro: Save 8hrs/week with LeadFlow',
    status: 'Delivered',
    created_at: '2026-06-20T11:05:00',
    body: 'Here is a quick introduction to how LeadFlow can save your team time.',
  },
  {
    id: 4,
    recipient: 'Lucas Martins',
    recipient_email: 'lucas@brightai.com',
    subject: 'Quick question about your outreach workflow',
    status: 'Sent',
    created_at: '2026-06-20T09:00:00',
    body: 'I wanted to ask a quick question about your current outreach workflow.',
  },
  {
    id: 5,
    recipient: 'Yuki Tanaka',
    recipient_email: 'yuki@ryokan.jp',
    subject: 'Follow-up: Our last conversation',
    status: 'Failed',
    created_at: '2026-06-19T16:45:00',
    body: 'Following up on our last conversation.',
  },
  {
    id: 6,
    recipient: 'Emma Vandenberg',
    recipient_email: 'emma@fintechone.eu',
    subject: 'Case study — how FinTech teams grow faster',
    status: 'Opened',
    created_at: '2026-06-19T10:30:00',
    body: 'Sharing a case study about how FinTech teams improve outreach.',
  },
];











/**
 * Gets the logged-in user's full name.
 */
function getUserFullName(user) {
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user?.name || user?.email || 'LeadFlow User';
}

/**
 * Gets the logged-in user's role name.
 */
function getUserRoleName(user) {
  return (
    user?.role?.role_name ||
    user?.role_name ||
    user?.role ||
    'Staff'
  );
}

/**
 * Gets avatar initials from user data.
 */
function getUserInitials(user, displayName) {
  if (user?.avatar_initials) return user.avatar_initials;

  const source = displayName || user?.email || 'LU';

  return source
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Only Admin or users with can_manage_users can access Users & Roles.
 */
function canManageUsers(user) {
  const roleName = getUserRoleName(user).toLowerCase();

  return (
    roleName === 'admin' ||
    user?.permissions?.can_manage_users === true ||
    user?.role?.can_manage_users === true
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

 
const [emailTemplates, setEmailTemplates] = useState(defaultTemplates);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [emailHistory, setEmailHistory] = useState(defaultEmailHistory);

// Dynamic logged-in user display data.
const displayName = getUserFullName(user);
const roleName = getUserRoleName(user);
const userInitials = getUserInitials(user, displayName);

// Staff cannot see Users & Roles in sidebar/search.
const allowedNavigationItems = useMemo(() => {
  return navigationItems.filter((item) => {
    if (item.key === 'users') {
      return canManageUsers(user);
    }

    return true;
  });
}, [user]);

const activePage = allowedNavigationItems.find((item) => item.key === tab);

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
}, [searchText, emailTemplates, allowedNavigationItems]);






 const openTab = (key) => {
  // Prevent Staff from manually opening Users & Roles.
  if (key === 'users' && !canManageUsers(user)) {
    setTab('dashboard');
    setSelectedLeadId(null);
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

    setNotifications((prev) => [item, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('lf_token');

    if (!token) return;

    try {
      const res = await fetch('/api/dashboard/metrics', {
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
      return (
        <EmailCampaignsPage
         templates={emailTemplates}
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
  if (!canManageUsers(user)) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-sm text-slate-500">
        You do not have permission to access Users & Roles.
      </div>
    );
  }

  return <UsersRolesPage />;
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
  templates = [],
  selectedTemplate,
  onTemplateUsed,
  onSend,
}) {
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [recipientText, setRecipientText] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(
    "Hi {{first_name}},\n\nI hope this finds you well. I wanted to reach out because we've been helping companies like {{company}} significantly improve their lead generation and outreach results.\n\nWould you be open to a quick 15-minute call this week to explore how we might help?\n\nBest,\nAlex Rivera\nLeadFlow CRM"
  );
  const [templateId, setTemplateId] = useState('');
  const [leadSelectorOpen, setLeadSelectorOpen] = useState(false);
  const [notice, setNotice] = useState('');

  /**
   * Loads real leads from the backend for recipient selection.
   */
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

  /**
   * Applies template selected from Email Templates page.
   */
  useEffect(() => {
    if (selectedTemplate) {
      setTemplateId(String(selectedTemplate.id));
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.body);
      onTemplateUsed?.();
    }
  }, [selectedTemplate]);

  const selectedLeadList = leads.filter((lead) =>
    selectedLeads.includes(lead.id)
  );

  const selectedRecipientLabel =
    selectedLeadList.length > 0
      ? selectedLeadList
          .map((lead) => `${lead.first_name} ${lead.last_name}`)
          .join(', ')
      : recipientText;

  const toggleLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
      return;
    }

    setSelectedLeads(leads.map((lead) => lead.id));
  };

  const applyTemplate = (id) => {
    setTemplateId(id);

    if (!id) return;

    const template = templates.find((item) => String(item.id) === String(id));

    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const saveDraft = () => {
    localStorage.setItem(
      'leadflow_email_draft',
      JSON.stringify({
        selectedLeads,
        recipientText,
        subject,
        body,
        templateId,
        saved_at: new Date().toISOString(),
      })
    );

    setNotice('Draft saved locally.');
  };

  const sendEmail = () => {
    setNotice('');

    if (!selectedRecipientLabel.trim()) {
      setNotice('Please select leads or enter recipient addresses.');
      return;
    }

    if (!subject.trim() || !body.trim()) {
      setNotice('Please enter both subject and message.');
      return;
    }

    const historyItem = {
      id: Date.now(),
      recipient:
        selectedLeadList.length > 0
          ? `${selectedLeadList.length} selected lead(s)`
          : recipientText,
      recipient_email:
        selectedLeadList.length > 0
          ? selectedLeadList.map((lead) => lead.email).join(', ')
          : recipientText,
      subject,
      status: 'Sent',
      body,
      created_at: new Date().toISOString(),
    };

    onSend(historyItem);
    setNotice('Email prepared and added to Email History.');
    setSelectedLeads([]);
    setRecipientText('');
    setSubject('');
    setTemplateId('');
  };

  return (
    <div className="max-w-5xl space-y-4">
      {/* Header actions */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Email Campaigns
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Compose and send targeted outreach to your leads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLeadSelectorOpen((prev) => !prev)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Select Leads
          </button>

          <button
            type="button"
            onClick={sendEmail}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Send size={16} />
            Send Bulk Email
          </button>
        </div>
      </div>

      {notice && (
        <div className="max-w-3xl px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Compose card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-3xl">
          <div className="px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Compose Email
            </h3>

            <div className="mt-6 border-b border-slate-100">
              <div className="grid grid-cols-[80px_1fr] items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-400">From</span>
                <span className="text-sm text-slate-700">alex@leadflow.io</span>
              </div>

              <div className="grid grid-cols-[80px_1fr] items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-400">To</span>
                <input
                  value={selectedRecipientLabel}
                  onChange={(e) => {
                    setRecipientText(e.target.value);
                    setSelectedLeads([]);
                  }}
                  placeholder="Select leads or enter addresses..."
                  className="w-full text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-[80px_1fr] items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-400">Subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line..."
                  className="w-full text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-[80px_1fr] items-center py-3">
                <span className="text-sm text-slate-400">Template</span>
                <select
                  value={templateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full text-sm text-slate-700 bg-transparent outline-none"
                >
                  <option value="">No template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-10 px-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button type="button" className="font-semibold">B</button>
                  <button type="button" className="italic">I</button>
                  <button type="button" className="underline">U</button>
                  <button type="button">•</button>
                  <button type="button">≡</button>
                  <button type="button">Link</button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-slate-400">
                  <span>{'{{first_name}}'}</span>
                  <span>{'{{company}}'}</span>
                </div>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={13}
                className="w-full p-5 text-sm leading-7 text-slate-700 outline-none resize-none"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={sendEmail}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                <Send size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>

        {/* Lead selector */}
        {leadSelectorOpen && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Select Leads
              </h3>

              <button
                type="button"
                onClick={toggleAllLeads}
                className="text-xs font-medium text-blue-600"
              >
                {selectedLeads.length === leads.length ? 'Clear' : 'Select all'}
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-[430px] overflow-y-auto">
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
        )}
      </div>
    </div>
  );
}






function EmailTemplatesPage({ templates, setTemplates, onUseTemplate }) {
  const emptyForm = {
    name: '',
    subject: '',
    body: '',
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setModalOpen(true);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveTemplate = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return;

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === editingTemplate.id
            ? {
                ...item,
                ...form,
                modified_at: new Date().toISOString(),
              }
            : item
        )
      );
    } else {
      setTemplates((prev) => [
        {
          id: Date.now(),
          ...form,
          modified_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
    setEditingTemplate(null);
    setForm(emptyForm);
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  const formatModifiedDate = (value) => {
    if (!value) return 'Modified recently';

    return `Modified ${new Date(value).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-start justify-between">
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
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-4xl">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={17} />
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEditModal(template)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteTemplate(template.id)}
                  className="h-8 w-8 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              {template.name}
            </h3>

            <p className="mt-3 text-sm text-slate-400 leading-relaxed h-11 overflow-hidden">
              {template.body}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {formatModifiedDate(template.modified_at)}
              </p>

              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Build reusable outreach email content.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

           <form onSubmit={saveTemplate} className="p-6 space-y-4">
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

  <div className="flex justify-end gap-3 pt-2">
    <button
      type="button"
      onClick={() => setModalOpen(false)}
      className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Cancel
    </button>

    <button
      type="submit"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
    >
      <Save size={16} />
      Save Template
    </button>
  </div>
</form>
          </div>
        </div>
      )}
    </div>
  );
}









function EmailHistoryPage({ history }) {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const statuses = [
    'All Statuses',
    'Sent',
    'Delivered',
    'Opened',
    'Replied',
    'Failed',
  ];

  const statusClass = {
    Sent: 'bg-slate-100 text-slate-600',
    Delivered: 'bg-blue-50 text-blue-600',
    Opened: 'bg-purple-50 text-purple-700',
    Replied: 'bg-emerald-50 text-emerald-700',
    Failed: 'bg-red-50 text-red-600',
  };

  const filteredHistory = history.filter((item) => {
    const searchValue = query.toLowerCase();

    const matchesSearch =
      item.recipient?.toLowerCase().includes(searchValue) ||
      item.recipient_email?.toLowerCase().includes(searchValue) ||
      item.subject?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === 'All Statuses' || item.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(item.created_at).toISOString().slice(0, 10) === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(Math.ceil(filteredHistory.length / 6), 1);
  const visibleHistory = filteredHistory.slice((page - 1) * 6, page * 6);

  const formatDate = (value) => {
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative w-full md:w-[260px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search email history..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-[180px] px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-[160px] px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold">Recipient</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No email records found.
                  </td>
                </tr>
              ) : (
                visibleHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                          {item.recipient?.slice(0, 2).toUpperCase() || 'EM'}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.recipient}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {item.recipient_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700 max-w-[260px] truncate">
                      {item.subject}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          statusClass[item.status] || statusClass.Sent
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedEmail(item)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {visibleHistory.length} of {filteredHistory.length} emails
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs text-slate-600 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index + 1)}
                className={`h-8 w-8 rounded-md text-xs font-semibold ${
                  page === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedEmail && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSelectedEmail(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Email Details
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedEmail.recipient_email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedEmail.subject}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">
                  Message
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600 whitespace-pre-line">
                  {selectedEmail.body || 'No message body available.'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







function UsersRolesPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /**
   * Load users and roles from the backend.
   * This makes Users & Roles dynamic instead of using local/static data.
   */
  const loadUsersAndRoles = async () => {
    const token = localStorage.getItem('lf_token');

    try {
      setLoading(true);
      setError('');

      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/users/roles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      if (!usersRes.ok) {
        throw new Error(usersData.error || 'Failed to load users.');
      }

      if (!rolesRes.ok) {
        throw new Error(rolesData.error || 'Failed to load roles.');
      }

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  /**
   * Role summary card counts.
   */
  const adminCount = users.filter((item) => item.role === 'Admin').length;
  const staffCount = users.filter((item) => item.role === 'Staff').length;

  /**
   * Generate avatar initials if the backend value is missing.
   */
  const getInitials = (item) => {
    if (item.avatar_initials) return item.avatar_initials;

    const name = item.name || `${item.first_name || ''} ${item.last_name || ''}`;
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  /**
   * Format last login for display.
   */
  const formatLastLogin = (value) => {
    if (!value) return 'Never';

    return new Date(value).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Activate or deactivate a user using the real backend.
   */
  const toggleUserStatus = async (item) => {
    const token = localStorage.getItem('lf_token');
    const isActive = item.status === 'active' || item.status === 'Active';
    const nextStatus = isActive ? 'inactive' : 'active';

    if (currentUser?.id === item.id && nextStatus === 'inactive') {
      setError('You cannot deactivate your own account while logged in.');
      return;
    }

    try {
      setError('');

      const res = await fetch(`/api/users/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user status.');
      }

      setUsers((prev) =>
        prev.map((userItem) => (userItem.id === item.id ? data : userItem))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-sm text-slate-500">
          Loading users and roles...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Users & Roles
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} {users.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddUserOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {error && (
        <div className="max-w-4xl px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Role summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
        <RoleCard
          title="Admin"
          description="Full system access — manage leads, emails, users, and settings."
          count={`${adminCount} ${adminCount === 1 ? 'user' : 'users'}`}
          color="purple"
        />

        <RoleCard
          title="Staff"
          description="Manage assigned leads and run email outreach campaigns."
          count={`${staffCount} ${staffCount === 1 ? 'user' : 'users'}`}
          color="blue"
        />
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Last Login</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const name =
                    item.name ||
                    `${item.first_name || ''} ${item.last_name || ''}`.trim();

                  const isActive =
                    item.status === 'active' || item.status === 'Active';

                  const isCurrentUser = currentUser?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                            {getInitials(item)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {name}
                            </p>

                            {isCurrentUser && (
                              <p className="text-[11px] text-blue-500 font-medium mt-0.5">
                                Current user
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                        {item.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                            item.role === 'Admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-xs font-mono">
                        {formatLastLogin(item.last_login_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />

                          <span
                            className={`text-xs font-semibold ${
                              isActive ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(item)}
                            className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleUserStatus(item)}
                            disabled={isCurrentUser && isActive}
                            className={`px-3 py-1.5 rounded-md border text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                              isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addUserOpen && (
        <AddUserModal
          roles={roles}
          onClose={() => setAddUserOpen(false)}
          onCreated={(createdUser) => {
            setUsers((prev) => [createdUser, ...prev]);
            setAddUserOpen(false);
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
          onUpdated={(updatedUser) => {
            setUsers((prev) =>
              prev.map((item) =>
                item.id === updatedUser.id ? updatedUser : item
              )
            );
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function RoleCard({ title, description, count, color }) {
  const isAdmin = color === 'purple';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
            isAdmin
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {title}
        </span>

        <p className="text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <span className="text-xs text-slate-400 whitespace-nowrap">
        {count}
      </span>
    </div>
  );
}

function AddUserModal({ roles, onClose, onCreated }) {
  const defaultRole =
    roles.find((role) => role.role_name === 'Staff') || roles[0];

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: defaultRole?.id || '',
    status: 'active',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  /**
   * Update Add User modal fields.
   */
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Create a real user through POST /api/users.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role_id) {
      setError('No role is available. Please make sure roles are seeded in the database.');
      return;
    }

    const token = localStorage.getItem('lf_token');

    try {
      setSaving(true);
      setError('');

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user.');
      }

      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add User</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create a new admin or staff account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsInput
              label="First Name"
              value={form.first_name}
              onChange={(value) => updateField('first_name', value)}
            />

            <SettingsInput
              label="Last Name"
              value={form.last_name}
              onChange={(value) => updateField('last_name', value)}
            />
          </div>

          <SettingsInput
            label="Email Address"
            value={form.email}
            onChange={(value) => updateField('email', value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              value={form.role_id}
              onChange={(e) => updateField('role_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, roles, onClose, onUpdated }) {
  const [form, setForm] = useState({
    role_id: user.role_id || roles[0]?.id || '',
    status: user.status || 'active',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  /**
   * Update Edit User modal fields.
   */
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Save role/status changes through PATCH /api/users/:id.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('lf_token');

    try {
      setSaving(true);
      setError('');

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user.');
      }

      onUpdated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update role or account status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              value={form.role_id}
              onChange={(e) => updateField('role_id', e.target.value)}
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
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Manage Profile
          </h2>

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
              onChange={(value) =>
                setProfile((prev) => ({ ...prev, name: value }))
              }
            />

            <SettingsInput
              label="Email"
              value={profile.email}
              onChange={(value) =>
                setProfile((prev) => ({ ...prev, email: value }))
              }
            />

            <SettingsInput
              label="Company"
              value={profile.company}
              onChange={(value) =>
                setProfile((prev) => ({ ...prev, company: value }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <input
                value={profile.role}
                readOnly
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none"
              />
            </div>

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