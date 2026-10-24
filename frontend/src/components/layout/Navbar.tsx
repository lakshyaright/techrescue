import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ArrowRight, ShieldCheck, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    switch (role) {
      case 'CLIENT': return '/client/dashboard';
      case 'EXPERT': return '/expert/dashboard';
      case 'ENGINEER': return '/engineer/dashboard';
      case 'ADMIN': return '/admin/dashboard';
    }
  };

  return (
    <header className="sticky top-8 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            TechRescue
          </span>
        </Link>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Overview
          </Link>
          <Link to="/features" className="hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link to="/how-it-works" className="hover:text-slate-900 transition-colors">
            How It Works
          </Link>
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <Link to="/testimonials" className="hover:text-slate-900 transition-colors">
            Enterprise Proof
          </Link>
        </nav>

        {/* Zone 3: primary actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Console</span>
          </Link>
          <Link
            to="/auth/login"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => navigate(getDashboardLink())}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>Launch Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Overview
          </Link>
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Features
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            How It Works
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Pricing
          </Link>
          <Link
            to="/testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Enterprise Proof
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(getDashboardLink());
              }}
              className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
            >
              Launch Portal ({role})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
