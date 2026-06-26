import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LayoutGrid, Loader2, TrendingUp, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track focused states to animate icon colors dynamically
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // State to trigger the staggered bar-graph rise on mount
  const [drawBars, setDrawBars] = useState(false);

  useEffect(() => {
    // Stagger rise trigger
    const timer = setTimeout(() => setDrawBars(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Incorrect credentials, access denied.');
    } finally {
      setLoading(false);
    }
  };

  // Outreach dataset matching mock graphics
  const barData = [
    { day: 'MON', val: 35 },
    { day: 'TUE', val: 60 },
    { day: 'WED', val: 48 },
    { day: 'THU', val: 90 },
    { day: 'FRI', val: 58 },
    { day: 'SAT', val: 25 },
    { day: 'SUN', val: 15 },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 font-sans select-none text-left">
      
      {/* 1. LEFT PANEL: VISUAL CRM PREVIEW (60% Width) */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-blue-700/10">
        
        {/* Crisp Glassmorphism Floating Circular Plates (Figma Design Concept) */}
        <div className="absolute top-10 left-12 w-48 h-48 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl animate-[smoothFloat_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-16 right-16 w-72 h-72 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl animate-[smoothFloat_8s_ease-in-out_infinite_2s]"></div>
        <div className="absolute top-[35%] right-[10%] w-32 h-32 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-xl animate-[smoothFloat_5s_ease-in-out_infinite_1s]"></div>
        
        {/* Soft Purple/Violet Glass Accent Sphere - bottom part */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-purple-500/35 rounded-full blur-3xl animate-pulse duration-[7000ms] delay-500"></div>

        <div className="relative w-full max-w-[460px] flex flex-col items-center gap-10 z-10">
          
          {/* Dashboard Preview Card - Static container with hover-shadow glow */}
          <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 p-8 text-white shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-2 transition-all duration-500">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <span className="font-black tracking-tighter text-xl">LeadFlow CRM</span>
              </div>
            </div>

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-left">
                <span className="block text-xs font-bold tracking-widest text-blue-100">TOTAL LEADS</span>
                <span className="block text-4xl font-black tracking-tighter mt-2">2,847</span>
                <span className="block text-emerald-300 text-sm font-medium mt-1">+12% this month</span>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-left">
                <span className="block text-xs font-bold tracking-widest text-blue-100">CONVERTED</span>
                <span className="block text-4xl font-black tracking-tighter mt-2">324</span>
                <span className="block text-emerald-300 text-sm font-medium mt-1">+8% this month</span>
              </div>
            </div>

            {/* Weekly Outreach Visual Box (Taller and fully animated on mount) */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 text-left">
              <span className="block text-xs font-bold tracking-widest text-blue-100 mb-6">WEEKLY OUTREACH</span>
              
              <div className="h-44 flex items-end gap-6 px-2">
                {barData.map((day, idx) => (
                  <div key={idx} className="flex-1 h-full flex flex-col justify-end relative group/bar">
                    
                    {/* High-Fidelity Floating Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-200 shadow-xl pointer-events-none scale-75 group-hover/bar:scale-100 z-20 shrink-0 whitespace-nowrap">
                      {day.val} Sent
                    </div>

                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t-3xl transition-all duration-700 ease-out origin-bottom hover:scale-x-125 hover:-translate-y-2 cursor-pointer relative ${
                        idx === 3 
                          ? 'bg-white shadow-lg shadow-white/40' 
                          : 'bg-white/40 hover:bg-white/80 group-hover:opacity-60 hover:!opacity-100'
                      }`} 
                      style={{ 
                        height: drawBars ? `${day.val}%` : '0%',
                        transitionDelay: `${idx * 60}ms`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-blue-100/80 mt-8 font-medium tracking-wider">
                {barData.map((b, i) => <span key={i}>{b.day}</span>)}
              </div>
            </div>

            {/* Status list with double pulse indicator dots */}
            <div className="space-y-3 mt-8">
              {[
                { name: 'Sarah Chen', action: 'Converted' },
                { name: 'James Okafor', action: 'Demo Scheduled' },
                { name: 'Priya Sharma', action: 'Replied' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm hover:bg-white/10 hover:translate-x-1 transition-all duration-300">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-blue-100/90">{row.name} &mdash; <span className="font-medium text-white">{row.action}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Slogan */}
          <p className="text-center text-white/90 text-sm font-medium tracking-tight">
            Turn prospects into revenue.<br />
            <span className="text-blue-100 text-xs">The CRM built for modern outreach teams.</span>
          </p>
        </div>
      </div>

      {/* 2. RIGHT PANEL: LOGIN FORM (40% Width) */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-11 w-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 hover:rotate-6 transition-transform duration-300">
              <LayoutGrid size={26} />
            </div>
            <span className="font-black text-3xl tracking-tighter text-slate-900">LeadFlow</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">Welcome back</h1>
          <p className="text-slate-500">Sign in to continue managing your pipeline</p>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${emailFocused ? 'text-blue-600' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm hover:border-slate-300 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${passwordFocused ? 'text-blue-600' : 'text-slate-400'}`} />
                <input
                  type="password"
                  required
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm hover:border-slate-300 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white font-bold rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-blue-600/30 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                "SIGN IN TO LEADFLOW"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}