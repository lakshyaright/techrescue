import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  TrendingUp, 
  Briefcase, 
  Star, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ShieldCheck,
  Server,
  RotateCcw,
  Terminal,
  Monitor
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { RemoteSessionLauncherModal } from '../../components/common/RemoteSessionLauncherModal';
import { RemoteConsoleModal } from '../../components/common/RemoteConsoleModal';
import { RemoteSession } from '../../types';

export const ExpertDashboard: React.FC = () => {
  const { currentUser, refreshUsers } = useAuth();
  const { tickets, acceptJobAsExpert, refreshData, remoteSessions } = useData();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [launcherModalOpen, setLauncherModalOpen] = useState(false);
  const [activeConsoleSession, setActiveConsoleSession] = useState<RemoteSession | null>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUsers(), refreshData()]);
    setIsRefreshing(false);
  };

  const myActiveJobs = tickets.filter(
    t => t.assignedExpertId === currentUser.id && ['IN_PROGRESS', 'WAITING_FOR_CLIENT', 'ASSIGNED'].includes(t.status)
  );

  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const completedJobs = tickets.filter(
    t => t.assignedExpertId === currentUser.id && ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status)
  );

  const handleClaim = async (ticketId: string) => {
    const res = await acceptJobAsExpert(ticketId, currentUser.id);
    if (!res.success) {
      alert(res.error);
    } else {
      navigate(`/client/query/${ticketId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Certified Specialist Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.title || 'Principal Cloud Architect'} · Real-time incident claim & diagnostic hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Reload from PostgreSQL"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          {/* ITEM 5: ManageEngine Remote Control Tool Launcher Button */}
          <button
            onClick={() => setLauncherModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            title="Generate ManageEngine Windows Remote Desktop or PowerShell access URL"
          >
            <Server className="w-3.5 h-3.5" />
            <span>ManageEngine Remote Access</span>
          </button>

          <button
            onClick={() => navigate('/expert/jobs')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Available Jobs ({openTickets.length})</span>
          </button>
        </div>
      </div>

      {/* 3 Core Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Lifetime Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{(currentUser.totalEarnings || 85000).toLocaleString()}.00
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            ● Payouts safely backed by escrow
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Jobs Completed</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {currentUser.completedJobsCount || completedJobs.length || 127}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            99.2% on-time SLA achievement
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Client Rating</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums flex items-center gap-1.5">
            <span>{currentUser.rating || 4.8}</span>
            <span className="text-amber-500 text-lg">★</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Based on {currentUser.reviewsCount || 84} verified reviews
          </span>
        </div>
      </div>

      {/* Active Jobs & Open Jobs to Claim */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Jobs Section */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">My Active Jobs</h3>
              <p className="text-xs text-slate-500">Currently assigned diagnostic cases</p>
            </div>
            <span className="text-xs font-mono text-blue-600 font-semibold">{myActiveJobs.length} active</span>
          </div>

          {myActiveJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              You have no active incidents right now. Claim an open query to begin.
            </div>
          ) : (
            <div className="space-y-3">
              {myActiveJobs.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                        <StatusBadge status={t.status} size="sm" />
                        <PriorityBadge priority={t.priority} size="sm" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{t.title}</h4>
                      <p className="text-slate-500 mt-0.5">{t.clientCompany} · {t.environment}</p>
                    </div>

                    <span className="font-mono font-bold text-emerald-700">
                      ₹{t.estimatedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      SLA: {new Date(t.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setLauncherModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Take control of client machine remotely"
                      >
                        <Server className="w-3.5 h-3.5" />
                        <span>Remote Access</span>
                      </button>
                      <button
                        onClick={() => navigate(`/client/query/${t.id}`)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claimable Open Jobs Section */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Available to Claim</h3>
              <p className="text-xs text-slate-500">Atomic row-lock ticket claims</p>
            </div>
            <button
              onClick={() => navigate('/expert/jobs')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View All ({openTickets.length}) →
            </button>
          </div>

          {openTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No open tickets awaiting claims at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {openTickets.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <h4 className="font-semibold text-slate-800 line-clamp-1">{t.title}</h4>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{t.category}</span>
                    <span className="font-mono font-semibold text-emerald-700">₹{t.estimatedCost.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleClaim(t.id)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Lock & Claim Job
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remote Session Launcher Modal */}
      <RemoteSessionLauncherModal
        isOpen={launcherModalOpen}
        onClose={() => setLauncherModalOpen(false)}
        onLaunchConsole={(session) => setActiveConsoleSession(session)}
      />

      {/* Live Remote Console Modal */}
      {activeConsoleSession && (
        <RemoteConsoleModal
          session={activeConsoleSession}
          isOpen={Boolean(activeConsoleSession)}
          onClose={() => setActiveConsoleSession(null)}
          isExpert={true}
        />
      )}
    </div>
  );
};
