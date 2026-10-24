import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                TR
              </div>
              <span className="font-bold text-base tracking-tight">TechRescue</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise IT Support & Expert Marketplace platform connecting mission-critical corporate infrastructure with verified cloud architects and field systems engineers.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ISO 27001 & SOC 2 Type II Aligned</span>
            </div>
          </div>

          {/* Platform capabilities */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-3">
              Capabilities
            </h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Cloud Infrastructure</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Core Switching & SD-WAN</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Cybersecurity Incident Response</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Datacenter Hardware Dispatch</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">SLA Guarantee & Escrow</Link></li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How TechRescue Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Enterprise Pricing</Link></li>
              <li><Link to="/testimonials" className="hover:text-white transition-colors">Case Studies & Outcomes</Link></li>
              <li><Link to="/auth/login" className="hover:text-white transition-colors">Sign In to Console</Link></li>
              <li><Link to="/auth/signup" className="hover:text-white transition-colors">Register as Specialist</Link></li>
            </ul>
          </div>

          {/* Global Operations */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-3">
              Operations Center
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Cyber City HQ, Gurgaon & Mumbai DC Hub, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono tabular-nums">+91 11 4500 9000 (24x7 NOC)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>support@techrescue.io</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} TechRescue Enterprise Marketplace Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
