import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, ArrowRight, Building2, Laptop, Wrench, AlertCircle, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        role: selectedRole,
        company,
      });

      if (res.success && res.user) {
        if (selectedRole === 'CLIENT') navigate('/client/dashboard');
        else if (selectedRole === 'EXPERT') navigate('/expert/dashboard');
        else if (selectedRole === 'ENGINEER') navigate('/engineer/dashboard');
        else navigate('/admin/dashboard');
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create TechRescue Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the verified platform for enterprise incident resolution
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          {/* Role selection tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('CLIENT')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedRole === 'CLIENT'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Client / Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('EXPERT')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedRole === 'EXPERT'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Laptop className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Remote Expert</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('ENGINEER')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedRole === 'ENGINEER'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wrench className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Field Tech</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Diwakar Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="diwakar@enterprise.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. CloudTech Systems"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Create strong password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Enter Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
