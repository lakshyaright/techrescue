import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Wrench, MapPin, TrendingUp, Star, Clock, CheckCircle2, Navigation, ArrowRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useNavigate } from 'react-router-dom';

export const EngineerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, updateTicketStatus } = useData();
  const navigate = useNavigate();

  const myFieldJobs = tickets.filter(
    t => t.assignedEngineerId === currentUser.id
  );

  const activeFieldJob = myFieldJobs.find(
    t => ['ASSIGNED', 'TRAVELING', 'ON_SITE', 'IN_PROGRESS'].includes(t.status)
  );

  const handleUpdateStatus = async (ticketId: string, status: any, note: string) => {
    await updateTicketStatus(ticketId, status, note);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Field Dispatch Console: {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stationed: {currentUser.location} · Rapid On-Site Hardware & Cabling Response
          </p>
        </div>

        <button
          onClick={() => navigate('/engineer/map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Site Proximity Map</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Total Field Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{(currentUser.totalEarnings || 68500).toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ₹850/hr standard rate + hardware allowance
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">On-Site Dispatches</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {currentUser.completedJobsCount || 127}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            100% on-site arrival SLA compliance
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Customer Sign-Off Rating</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums flex items-center gap-1.5">
            <span>{currentUser.rating || 4.8}</span>
            <span className="text-amber-500 text-lg">★</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Directly confirmed by client data center managers
          </span>
        </div>
      </div>

      {/* Current Active Field Dispatch Banner */}
      {activeFieldJob && (
        <div className="p-6 rounded-2xl border-2 border-blue-500 bg-blue-50/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                  Active Emergency Field Dispatch
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{activeFieldJob.ticketNumber}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{activeFieldJob.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Target: {activeFieldJob.engineerLocation || activeFieldJob.environment}</span>
              </div>
            </div>

            <div className="text-right sm:shrink-0">
              <StatusBadge status={activeFieldJob.status} size="md" />
            </div>
          </div>

          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-blue-200 leading-relaxed font-mono">
            {activeFieldJob.shortDescription}
          </p>

          {/* Workflow Status Controls */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Quick Status Progression:</span>

            {activeFieldJob.status === 'ASSIGNED' && (
              <button
                onClick={() => handleUpdateStatus(activeFieldJob.id, 'TRAVELING', 'Field engineer has departed and is en route to facility.')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Mark Traveling to Facility</span>
              </button>
            )}

            {activeFieldJob.status === 'TRAVELING' && (
              <button
                onClick={() => handleUpdateStatus(activeFieldJob.id, 'ON_SITE', 'Field engineer arrived at site and completed badge security check-in.')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Mark Checked In On-Site</span>
              </button>
            )}

            {activeFieldJob.status === 'ON_SITE' && (
              <button
                onClick={() => handleUpdateStatus(activeFieldJob.id, 'IN_PROGRESS', 'Physical diagnostics and replacement cable/optics install started in rack.')}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
              >
                <span>Initiate Physical Work in Rack</span>
              </button>
            )}

            {activeFieldJob.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus(activeFieldJob.id, 'RESOLVED', 'Physical replacement completed, link certified with Fluke tester, port errors cleared.')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Physical Repair & Mark Resolved</span>
              </button>
            )}

            <button
              onClick={() => navigate(`/client/query/${activeFieldJob.id}`)}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Open Full Incident Workspace
            </button>
          </div>
        </div>
      )}

      {/* Historical Assigned Dispatches */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Assigned Field Dispatches</h3>
          <span className="text-xs font-mono text-slate-400">{myFieldJobs.length} Assigned</span>
        </div>

        <div className="divide-y divide-slate-100">
          {myFieldJobs.map((t) => (
            <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">{t.ticketNumber}</span>
                  <StatusBadge status={t.status} size="sm" />
                  <PriorityBadge priority={t.priority} size="sm" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{t.title}</h4>
                <p className="text-slate-500">{t.environment} · Client: {t.clientCompany}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">
                  ₹{t.estimatedCost.toLocaleString()}
                </span>
                <button
                  onClick={() => navigate(`/client/query/${t.id}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
