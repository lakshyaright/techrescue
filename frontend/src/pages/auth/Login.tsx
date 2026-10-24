import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ShieldCheck, ArrowRight, AlertCircle, Loader2, Wifi, WifiOff, Lock, Mail, Shield, Building2, Laptop, Wrench } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  // Check URL query parameters for redirects or notices
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');
  const stateReason = (location.state as any)?.reason;

  useEffect(() => {
    // Check backend health on mount
    api.testConnection().then(res => {
      setBackendStatus(res.isConnected ? 'connected' : 'offline');
    });
  }, []);

  const routeByRole = (role: string) => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    switch (role) {
      case 'CLIENT': navigate('/client/dashboard'); break;
      case 'EXPERT': navigate('/expert/dashboard'); break;
      case 'ENGINEER': navigate('/engineer/dashboard'); break;
      case 'ADMIN': navigate('/admin/dashboard'); break;
      default: navigate('/client/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        routeByRole(res.user.role);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to TechRescue
          </h2>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your database-backed workspace
          </p>

          {/* Backend Connectivity Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mt-1">
            {backendStatus === 'checking' && (
              <span className="text-slate-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking Database Connection...
              </span>
            )}
            {backendStatus === 'connected' && (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-mono">
                <Wifi className="w-3 h-3 text-emerald-600" /> PostgreSQL Database Connected
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-red-600" /> Backend API Offline
              </span>
            )}
          </div>
        </div>

        {/* Notice if redirected due to unauthenticated access */}
        {stateReason === 'authentication_required' && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Please sign in to access the requested protected workspace.</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Credentials from Database */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Quick Logins (Seeded in PostgreSQL):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setEmail('admin@techrescue.io'); setPassword('password123'); }}
              className="p-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Admin Console</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">admin@techrescue.io</span>
            </button>

            <button
              type="button"
              onClick={() => { setEmail('sonu.patel@fintechglobal.com'); setPassword('password123'); }}
              className="p-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Client Portal</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">sonu.patel@...</span>
            </button>

            <button
              type="button"
              onClick={() => { setEmail('rahul.sharma@cloudarchitects.io'); setPassword('password123'); }}
              className="p-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Laptop className="w-3.5 h-3.5 shrink-0" />
                <span>Expert Console</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">rahul.sharma@...</span>
            </button>

            <button
              type="button"
              onClick={() => { setEmail('rajesh.k@fieldtechrescue.in'); setPassword('password123'); }}
              className="p-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span>Field Engineer</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">rajesh.k@...</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials with Database...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/auth/signup" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
