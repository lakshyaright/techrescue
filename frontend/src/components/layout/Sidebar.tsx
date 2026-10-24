import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Activity, 
  Users, 
  Wrench, 
  MessageSquare, 
  CreditCard, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Layers
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { tickets, messages } = useData();

  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;
  const activeTicketsCount = tickets.filter(t => ['IN_PROGRESS', 'ON_SITE', 'TRAVELING', 'ASSIGNED'].includes(t.status)).length;

  const getNavLinks = () => {
    switch (role) {
      case 'CLIENT':
        return [
          { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/client/raise-query', label: 'Raise Query', icon: PlusCircle, badge: 'New' },
          { to: '/client/history', label: 'Query History', icon: History, count: tickets.length },
          { to: '/client/activity', label: 'Recent Activity', icon: Activity },
          { to: '/client/experts', label: 'Align Experts', icon: Users },
          { to: '/client/engineers', label: 'Field Engineers', icon: Wrench },
          { to: '/client/messages', label: 'Messages', icon: MessageSquare, count: messages.length },
          { to: '/client/payments', label: 'Payments & Escrow', icon: CreditCard },
          { to: '/client/profile', label: 'Company Profile', icon: UserCheck }
        ];
      case 'EXPERT':
        return [
          { to: '/expert/dashboard', label: 'Expert Dashboard', icon: LayoutDashboard },
          { to: '/expert/jobs', label: 'Jobs & Tickets', icon: Briefcase, count: openTicketsCount },
          { to: '/expert/messages', label: 'Client Messages', icon: MessageSquare, count: messages.length },
          { to: '/expert/earnings', label: 'Earnings & Payouts', icon: TrendingUp },
          { to: '/expert/profile', label: 'Specialist Profile', icon: UserCheck }
        ];
      case 'ENGINEER':
        return [
          { to: '/engineer/dashboard', label: 'Field Dashboard', icon: LayoutDashboard },
          { to: '/engineer/jobs', label: 'Field Dispatches', icon: Wrench, count: activeTicketsCount },
          { to: '/engineer/map', label: 'Site Proximity Map', icon: MapPin },
          { to: '/engineer/messages', label: 'Direct Messages', icon: MessageSquare },
          { to: '/engineer/earnings', label: 'Disbursement Log', icon: TrendingUp },
          { to: '/engineer/profile', label: 'Field Profile', icon: UserCheck }
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Operations Center', icon: LayoutDashboard },
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/queries', label: 'All Incidents', icon: Layers, count: tickets.length },
          { to: '/admin/payments', label: 'Escrow Ledger', icon: CreditCard },
          { to: '/admin/reports', label: 'Reports & Analytics', icon: TrendingUp },
          { to: '/admin/audit', label: 'Audit Trail', icon: FileText },
          { to: '/admin/settings', label: 'Platform Settings', icon: Settings }
        ];
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-12 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Lockup */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              TR
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-sm">
                TechRescue
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">
                {role.toLowerCase()} console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    {link.badge}
                  </span>
                )}
                {typeof link.count === 'number' && link.count > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                    {link.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer SLA Guarantee info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Enterprise SLA</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            15m P1 Triage · Escrow Protection Guarantee
          </p>
        </div>
      </aside>
    </>
  );
};
