import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Laptop, 
  Wrench, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Activity,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { DailyTrendChart, CategoryBreakdownChart, ResolutionSlaMetrics } from '../../components/charts/AnalyticsCharts';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { tickets, activityLogs, payments, refreshData } = useData();
  const { users, refreshUsers } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUsers(), refreshData()]);
    setIsRefreshing(false);
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title & Live Status Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Operations & Enterprise Control Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live PostgreSQL Database
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisory monitoring across all client SLA tickets, expert claims, and field dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Fetch latest data from PostgreSQL"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live DB'}</span>
          </button>

          <button
            onClick={() => navigate('/admin/queries')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Incident Queue ({tickets.length})
          </button>
        </div>
      </div>

      {/* Core Real-Time Executive KPI Counters from PostgreSQL */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Database Users</span>
          <span className="font-mono text-xl font-bold text-slate-900 block mt-1 tabular-nums">
            {users.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Live PostgreSQL records</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Vetted Experts</span>
          <span className="font-mono text-xl font-bold text-blue-700 block mt-1 tabular-nums">
            {users.filter(u => u.role === 'EXPERT').length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Registered specialists</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Field Engineers</span>
          <span className="font-mono text-xl font-bold text-indigo-700 block mt-1 tabular-nums">
            {users.filter(u => u.role === 'ENGINEER').length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">On-site technicians</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Open Queries</span>
          <span className="font-mono text-xl font-bold text-amber-700 block mt-1 tabular-nums">
            {tickets.filter(t => t.status === 'OPEN').length}
          </span>
          <span className="text-[10px] text-amber-600 font-medium block mt-0.5">Awaiting specialist claim</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Active In-Progress</span>
          <span className="font-mono text-xl font-bold text-sky-700 block mt-1 tabular-nums">
            {tickets.filter(t => ['IN_PROGRESS', 'ON_SITE', 'TRAVELING', 'ASSIGNED'].includes(t.status)).length}
          </span>
          <span className="text-[10px] text-sky-600 font-medium block mt-0.5">Active locked tickets</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Platform GMV</span>
          <span className="font-mono text-xl font-bold text-emerald-700 block mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Live Escrow balance</span>
        </div>
      </div>

      {/* Analytics Charts Row - 100% Dynamic from PostgreSQL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platform Influx & Resolution Trend</h3>
              <p className="text-xs text-slate-500">Live operational volume across all PostgreSQL incidents</p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">7-Day Real-Time</span>
          </div>
          <DailyTrendChart tickets={tickets} />
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Incident Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown by technical infrastructure stack</p>
          </div>
          <CategoryBreakdownChart tickets={tickets} />
        </div>
      </div>

      {/* SLA Metrics & Active Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">SLA Resolution Time Performance</h3>
            <p className="text-xs text-slate-500">Live Mean Time To Resolution (MTTR) by Severity</p>
          </div>
          <ResolutionSlaMetrics tickets={tickets} />
        </div>

        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Live Incident Queue Overview</h3>
              <p className="text-xs text-slate-500">Supervisor oversight of real database tickets</p>
            </div>
            <button
              onClick={() => navigate('/admin/queries')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Manage All ({tickets.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                <p className="font-medium text-slate-600 mb-0.5">Incident queue is currently clear</p>
                <p className="text-[11px]">Any new queries created by clients will show here in real-time.</p>
              </div>
            ) : (
              tickets.slice(0, 4).map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                      <PriorityBadge priority={t.priority} size="sm" />
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <p className="text-slate-600 truncate">{t.title}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/client/query/${t.id}`)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                  >
                    Supervise
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
