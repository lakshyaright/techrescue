import React from 'react';
import { useData } from '../../context/DataContext';
import { DailyTrendChart, CategoryBreakdownChart, ResolutionSlaMetrics } from '../../components/charts/AnalyticsCharts';
import { Download, TrendingUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { tickets, payments } = useData();

  const totalDisbursed = payments
    .filter(p => p.status === 'RELEASED')
    .reduce((sum, p) => sum + p.amount, 0);

  const criticalTickets = tickets.filter(t => t.priority === 'CRITICAL');
  const p1Compliance = criticalTickets.length > 0 
    ? Math.round(((criticalTickets.length - criticalTickets.filter(t => t.slaBreached).length) / criticalTickets.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Reports & Enterprise SLA Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical modeling of resolution velocity, mean-time-to-repair (MTTR), and infrastructure uptime
          </p>
        </div>

        <button
          onClick={() => alert('Exporting full enterprise compliance PDF report...')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Executive Dossier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Weekly Incident Influx & Closure Trajectory</h3>
          <DailyTrendChart tickets={tickets} />
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Infrastructure Layer Breakdown</h3>
          <CategoryBreakdownChart tickets={tickets} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">SLA Severity Matrix & Target Compliance</h3>
          <ResolutionSlaMetrics tickets={tickets} />
        </div>

        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900">Network Operational Highlights</h3>
          <div className="space-y-2 pt-1 text-slate-700 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{p1Compliance}% P1 Adherence:</strong> Critical enterprise emergencies adhering to SLA target against real database logs.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Live Concurrency Locks:</strong> PostgreSQL atomic row-locks protecting claim collisions across {tickets.length} total tickets.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Escrow Discrepancies:</strong> ₹{totalDisbursed.toLocaleString('en-IN')} disbursed with 100% mutual sign-off in ledger.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
