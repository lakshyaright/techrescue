import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, ShieldAlert, FileText, Download } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { activityLogs } = useData();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter(a =>
    a.userName.toLowerCase().includes(search.toLowerCase()) ||
    a.action.toLowerCase().includes(search.toLowerCase()) ||
    a.details.toLowerCase().includes(search.toLowerCase()) ||
    (a.ticketNumber && a.ticketNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Security & Incident Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped immutable event trail for SOC 2 Type II compliance
          </p>
        </div>

        <button
          onClick={() => alert('Downloading immutable SHA-256 audit log archive...')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, IP, ticket ID, or event type..."
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
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Incident #</th>
                <th className="py-3 px-4">Audit Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap font-sans">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-xs">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-700 whitespace-nowrap font-sans">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {log.ticketNumber || 'PLATFORM'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md truncate font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
