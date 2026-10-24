import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Search, Filter, ShieldAlert, ArrowRight, Wrench, Laptop, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/common/Modal';
import { TicketPriority, TicketStatus } from '../../types';

export const AdminQueries: React.FC = () => {
  const { tickets, adminOverrideTicket } = useData();
  const { users } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [overrideModal, setOverrideModal] = useState(false);

  // Override form
  const [newPriority, setNewPriority] = useState<TicketPriority>('HIGH');
  const [newStatus, setNewStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [assignedExpertId, setAssignedExpertId] = useState('');
  const [assignedEngineerId, setAssignedEngineerId] = useState('');

  const experts = users.filter(u => u.role === 'EXPERT');
  const engineers = users.filter(u => u.role === 'ENGINEER');

  const filteredTickets = tickets.filter(t =>
    t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.clientCompany.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenOverride = (t: any) => {
    setSelectedTicket(t);
    setNewPriority(t.priority);
    setNewStatus(t.status);
    setAssignedExpertId(t.assignedExpertId || '');
    setAssignedEngineerId(t.assignedEngineerId || '');
    setOverrideModal(true);
  };

  const handleSaveOverride = async () => {
    if (!selectedTicket) return;
    const expert = experts.find(e => e.id === assignedExpertId);
    const engineer = engineers.find(e => e.id === assignedEngineerId);

    await adminOverrideTicket(selectedTicket.id, {
      priority: newPriority,
      status: newStatus,
      assignedExpertId: expert?.id || undefined,
      assignedExpertName: expert?.name || undefined,
      assignedEngineerId: engineer?.id || undefined,
      assignedEngineerName: engineer?.name || undefined
    });

    setOverrideModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Supervisory Incident Management Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global NOC oversight, manual engineer reassignment, and SLA breach mitigation
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all enterprise tickets by ID, client, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Client Company</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remote Expert</th>
                <th className="py-3 px-4">Field Engineer</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Supervision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-600 block">{t.ticketNumber}</span>
                    <span className="text-slate-800 font-medium truncate max-w-xs block">{t.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {t.clientCompany}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {t.assignedExpertName || <span className="text-amber-600 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {t.assignedEngineerName || <span className="text-slate-400 italic">None</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(t.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleOpenOverride(t)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold"
                    >
                      Override
                    </button>
                    <button
                      onClick={() => navigate(`/client/query/${t.id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold"
                    >
                      Workspace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Override Modal */}
      {overrideModal && selectedTicket && (
        <Modal
          isOpen={overrideModal}
          onClose={() => setOverrideModal(false)}
          title={`Administrative Override: ${selectedTicket.ticketNumber}`}
          subtitle="Direct supervisor intervention and SLA reassignment"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjust Ticket Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="CRITICAL">P1 - Critical (2h SLA)</option>
                  <option value="HIGH">P2 - High (4h SLA)</option>
                  <option value="MEDIUM">P3 - Medium (12h SLA)</option>
                  <option value="LOW">P4 - Low (24h SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Force Status Progression
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="TRAVELING">TRAVELING</option>
                  <option value="ON_SITE">ON_SITE</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign / Reassign Remote Expert
              </label>
              <select
                value={assignedExpertId}
                onChange={(e) => setAssignedExpertId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- No Expert Assigned --</option>
                {experts.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name} - {exp.title} (₹{exp.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch On-Site Field Engineer
              </label>
              <select
                value={assignedEngineerId}
                onChange={(e) => setAssignedEngineerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- No Field Engineer Assigned --</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.name} - {eng.location} ({eng.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Apply Supervisory Override
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
