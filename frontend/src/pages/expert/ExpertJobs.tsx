import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TicketStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Briefcase, ArrowRight, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExpertJobs: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, acceptJobAsExpert, updateTicketStatus } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  const availableJobs = tickets.filter(t => t.status === 'OPEN');
  const myActiveJobs = tickets.filter(
    t => t.assignedExpertId === currentUser.id && ['IN_PROGRESS', 'WAITING_FOR_CLIENT', 'ASSIGNED'].includes(t.status)
  );
  const myCompletedJobs = tickets.filter(
    t => t.assignedExpertId === currentUser.id && ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status)
  );

  const handleClaimJob = async (ticketId: string) => {
    const res = await acceptJobAsExpert(ticketId, currentUser.id);
    if (!res.success) {
      alert(res.error);
    } else {
      setActiveTab('active');
    }
  };

  const handleProgressStatus = async (ticketId: string, nextStatus: TicketStatus) => {
    await updateTicketStatus(ticketId, nextStatus);
  };

  const displayList = 
    activeTab === 'available' ? availableJobs :
    activeTab === 'active' ? myActiveJobs : myCompletedJobs;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Specialist Job & Ticket Dispatch
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atomic concurrency locked incident assignment with full diagnostic workflow progression
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Open Pool to Claim ({availableJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Active Assignments ({myActiveJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed & Resolved ({myCompletedJobs.length})
        </button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No incident tickets in this queue.
          </div>
        ) : (
          displayList.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <StatusBadge status={t.status} size="sm" />
                    <span className="text-slate-300">·</span>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span>Client: <strong>{t.clientCompany}</strong> ({t.clientName})</span>
                    <span>·</span>
                    <span>Environment: {t.environment}</span>
                    <span>·</span>
                    <span>Group: {t.assignmentGroup}</span>
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

              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-mono text-[11px]">
                {t.shortDescription}
              </p>

              {/* Action Bar based on Status */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA Target: {new Date(t.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {t.status === 'OPEN' ? (
                    <button
                      onClick={() => handleClaimJob(t.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs"
                    >
                      Accept & Lock Incident
                    </button>
                  ) : (
                    <>
                      {t.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleProgressStatus(t.id, 'WAITING_FOR_CLIENT')}
                          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs"
                        >
                          Mark Waiting Client
                        </button>
                      )}
                      {t.status === 'WAITING_FOR_CLIENT' && (
                        <button
                          onClick={() => handleProgressStatus(t.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs"
                        >
                          Resume In-Progress
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/client/query/${t.id}`)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <span>Incident Workspace & Diagnostics</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
