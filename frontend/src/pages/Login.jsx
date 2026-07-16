import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Loader2,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [drawBars, setDrawBars] = useState(false);

  useEffect(() => {
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
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const barData = [
    { day: 'Mon', value: 35 },
    { day: 'Tue', value: 60 },
    { day: 'Wed', value: 48 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 58 },
    { day: 'Sat', value: 25 },
    { day: 'Sun', value: 15 },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      {/* Left Preview Panel */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-10 left-12 w-48 h-48 bg-white/10 backdrop-blur-md rounded-full border border-white/20" />
        <div className="absolute bottom-16 right-16 w-72 h-72 bg-white/10 backdrop-blur-xl rounded-full border border-white/20" />
        <div className="absolute top-[35%] right-[10%] w-32 h-32 bg-white/5 backdrop-blur-md rounded-full border border-white/10" />

        {/* Allowed purple accent from Figma */}
        <div className="absolute bottom-[-12%] right-[-10%] w-[360px] h-[360px] bg-purple-500/30 rounded-full blur-3xl" />

        <div className="relative w-full max-w-[460px] z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight">
                  LeadFlow CRM
                </h2>
                <p className="text-xs text-blue-100">
                  Outreach performance workspace
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest text-blue-100">
                  TOTAL LEADS
                </p>
                <h3 className="text-4xl font-black mt-2">2,847</h3>
                <p className="text-emerald-300 text-sm mt-1">
                  +12% this month
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest text-blue-100">
                  CONVERTED
                </p>
                <h3 className="text-4xl font-black mt-2">324</h3>
                <p className="text-emerald-300 text-sm mt-1">
                  +8% this month
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={18} />
                <p className="text-xs font-bold tracking-widest text-blue-100">
                  WEEKLY OUTREACH
                </p>
              </div>

              <div className="h-44 flex items-end gap-5">
                {barData.map((item, index) => (
                  <div
                    key={item.day}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-3"
                  >
                    <div
                      className={`w-full rounded-t-2xl transition-all duration-700 ${
                        index === 3 ? 'bg-white' : 'bg-white/45'
                      }`}
                      style={{
                        height: drawBars ? `${item.value}%` : '0%',
                        transitionDelay: `${index * 70}ms`,
                      }}
                    />

                    <span className="text-[10px] text-blue-100 font-semibold uppercase">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mt-8">
              {[
                'Sarah Chen — Converted',
                'James Okafor — Demo Scheduled',
                'Priya Sharma — Replied',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>

                  <span className="text-blue-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-white/90 text-sm font-medium mt-8">
            Turn prospects into revenue.
            <br />
            <span className="text-blue-100 text-xs">
              The CRM built for modern outreach teams.
            </span>
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-11 w-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp size={24} />
            </div>

            <span className="font-black text-3xl tracking-tight text-slate-900">
              LeadFlow
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to continue managing your pipeline.
          </p>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                    emailFocused ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />

                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordFocused ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />

                <input
                  type="password"
                  required
                  value={password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-blue-600/25 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Sign in to LeadFlow
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-xs text-slate-400">
            Demo account:
            <span className="ml-1 font-semibold text-slate-500">
              emilio@cubetech.com / admin123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

