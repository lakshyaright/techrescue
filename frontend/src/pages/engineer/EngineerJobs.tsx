import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { MapPin, Navigation, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EngineerJobs: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, updateTicketStatus } = useData();
  const navigate = useNavigate();

  const myFieldJobs = tickets.filter(
    t => t.assignedEngineerId === currentUser.id
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Field Dispatches & On-Site Work Orders
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step physical technician workflows: Travel Check-in, Rack diagnosis, and Client sign-off
        </p>
      </div>

      <div className="space-y-4">
        {myFieldJobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No on-site dispatches currently assigned to your badge.
          </div>
        ) : (
          myFieldJobs.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <StatusBadge status={t.status} size="sm" />
                    <span className="text-slate-300">·</span>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Facility Location: <strong>{t.engineerLocation || t.environment}</strong></span>
                  </div>
                </div>

                <div className="text-right sm:shrink-0">
                  <span className="font-mono text-base font-bold text-slate-900 tabular-nums block">
                    ₹{t.estimatedCost.toLocaleString()}.00
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    Escrow Guaranteed
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Incident Background:
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  {t.detailedDescription}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {t.status === 'ASSIGNED' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'TRAVELING', 'Departing to site facility.')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Travel to Site</span>
                    </button>
                  )}
                  {t.status === 'TRAVELING' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'ON_SITE', 'Arrived at datacenter security gate.')}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Check-In On Site</span>
                    </button>
                  )}
                  {t.status === 'ON_SITE' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'IN_PROGRESS', 'Rack B-04 opened, diagnostic cable attached.')}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs"
                    >
                      <span>Begin Rack Hardware Work</span>
                    </button>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'RESOLVED', 'Physical replacement completed and link errors resolved.')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Work Complete</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/client/query/${t.id}`)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <span>Open Full Incident Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
