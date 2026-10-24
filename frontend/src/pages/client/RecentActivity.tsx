import React from 'react';
import { useData } from '../../context/DataContext';
import { Activity, Clock, User, ShieldCheck, CheckCircle2, MessageSquare, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentActivity: React.FC = () => {
  const { activityLogs, tickets } = useData();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Recent Activity & Operational Audit Log
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live chronologically ordered timeline of ticket transitions, engineer dispatches, and disbursements
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="space-y-6 relative pl-6 border-l-2 border-slate-200">
          {activityLogs.map((act) => {
            return (
              <div key={act.id} className="relative space-y-1.5">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-1 ring-slate-200" />
                
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{act.userName}</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-xs">
                      {act.userRole}
                    </span>
                    {act.ticketNumber && (
                      <span className="font-mono text-blue-600 font-semibold">
                        {act.ticketNumber}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(act.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800">
                  {act.action}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {act.details}
                </p>

                {act.queryId && (
                  <button
                    onClick={() => navigate(`/client/query/${act.queryId}`)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium pt-0.5 block"
                  >
                    View Incident Workspace →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
