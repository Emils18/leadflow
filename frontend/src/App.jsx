import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList'; 
import LeadDetails from './pages/LeadDetails'; 
import CsvImporter from './components/CsvImporter';
import AddLeadModal from './components/AddLeadModal';
import { LayoutDashboard, Users, FileInput, LogOut } from 'lucide-react';

function DashboardShell() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const renderActiveTab = () => {
    if (selectedLeadId) {
      return (
        <LeadDetails 
          leadId={selectedLeadId} 
          onBack={() => setSelectedLeadId(null)} 
        />
      );
    }

    switch (tab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <LeadList onSelectLead={(id) => setSelectedLeadId(id)} />;
      case 'import':
        return (
          <div className="max-w-2xl mx-auto">
            <CsvImporter onCompleted={() => {}} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      
      {/* Sidebar with slide transforms */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200/60 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo Area */}
          <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-200/60 bg-white/50">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-extrabold text-xl flex items-center justify-center rounded-xl shadow-md shadow-blue-600/10 hover:rotate-3 transition-transform duration-200 cursor-pointer">LF</div>
            <div>
              <span className="block text-slate-800 font-black tracking-tight text-sm uppercase">LeadFlow</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">CRM Suite</span>
            </div>
          </div>

          {/* Navigation with hover translate slide effect */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
              { id: 'leads', label: 'Pipeline Directory', icon: <Users size={15} /> },
              { id: 'import', label: 'CSV File Ingest', icon: <FileInput size={15} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setSelectedLeadId(null);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:translate-x-1.5 ${tab === item.id && !selectedLeadId ? 'bg-white text-blue-600 font-extrabold shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-200/35 hover:text-slate-700'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile block */}
        <div className="p-4 border-t border-slate-200/60 flex items-center justify-between text-xs bg-white/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-black rounded-full flex items-center justify-center uppercase shadow-sm select-none transform hover:scale-105 transition-transform">{user.avatar_initials}</div>
            <div>
              <span className="block font-bold text-slate-700">{user.first_name}</span>
              <span className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{user.role.role_name}</span>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="p-2 hover:bg-slate-200/40 text-slate-400 hover:text-red-500 transition-colors rounded-xl active:scale-95"
            title="Log out of session"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main content display with timed tab entries */}
      <main className="flex-1 p-10 overflow-y-auto max-h-screen bg-slate-100 transition-all duration-300">
        <div key={`${tab}-${selectedLeadId}`} className="animate-fade-in">
          {renderActiveTab()}
        </div>
      </main>

      <AddLeadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaveSuccess={() => {}} />
    </div>
  );
}

function SessionWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden text-xs font-bold uppercase tracking-widest text-slate-400">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <span className="relative">Loading secure workspace...</span>
      </div>
    );
  }

  return user ? <DashboardShell /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <SessionWrapper />
    </AuthProvider>
  );
}