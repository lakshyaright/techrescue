import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  PlusCircle, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Users, 
  Wrench,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { DailyTrendChart, CategoryBreakdownChart } from '../../components/charts/AnalyticsCharts';

export const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, activityLogs } = useData();
  const navigate = useNavigate();

  // Metrics
  const totalQueries = tickets.length;
  const openQueries = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressQueries = tickets.filter(t => ['IN_PROGRESS', 'ASSIGNED', 'TRAVELING', 'ON_SITE', 'WAITING_FOR_CLIENT'].includes(t.status)).length;
  const resolvedQueries = tickets.filter(t => ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status)).length;

  const recentTickets = tickets.slice(0, 5);
  const recentActivities = activityLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.company || 'Enterprise Infrastructure Console'} · Real-time incident SLA monitor
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/client/experts')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Align Experts
          </button>
          <button
            onClick={() => navigate('/client/raise-query')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Query</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Queries</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalQueries}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">All registered tickets</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium">Open Queries</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
            {openQueries}
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">Awaiting claim</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
            {inProgressQueries}
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block">Active diagnostics</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {resolvedQueries}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Pass SLA verification</span>
        </div>
      </div>

      {/* Query Overview Chart & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Query Overview & Resolution Velocity</h3>
              <p className="text-xs text-slate-500">Incident influx vs 7-day verified resolutions</p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">7-Day Rolling</span>
          </div>
          <DailyTrendChart />
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Category Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown across infrastructure layers</p>
          </div>
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* Recent Queries & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Queries Table */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Queries</h3>
              <p className="text-xs text-slate-500">Latest enterprise infrastructure tickets</p>
            </div>
            <button
              onClick={() => navigate('/client/history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {t.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/client/query/${t.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Live operational event log</p>
            </div>
            <button
              onClick={() => navigate('/client/activity')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Full Stream
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="text-xs space-y-1 relative pl-4 border-l-2 border-slate-200">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-semibold text-slate-700">{act.userName} ({act.userRole})</span>
                  <span className="font-mono">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-800 font-medium">
                  {act.action}
                </p>
                <p className="text-slate-500 text-[11px] line-clamp-2">
                  {act.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
