import React, { useState } from 'react';
import { Settings, ShieldCheck, Check, AlertTriangle, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [platformFee, setPlatformFee] = useState('10');
  const [p1SlaHours, setP1SlaHours] = useState('2.0');
  const [p2SlaHours, setP2SlaHours] = useState('4.0');
  const [escrowAutoReleaseDays, setEscrowAutoReleaseDays] = useState('7');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Platform Governance & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          SLA parameters, commission margins, concurrency transaction locks, and notification gateways
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Commission Fee (%)
              </label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Deducted automatically upon escrow release</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Escrow Auto-Disbursement Timeout (Days)
              </label>
              <input
                type="number"
                value={escrowAutoReleaseDays}
                onChange={(e) => setEscrowAutoReleaseDays(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Disburses to specialist if client is unresponsive</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                P1 - Critical SLA Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={p1SlaHours}
                onChange={(e) => setP1SlaHours(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                P2 - High SLA Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={p2SlaHours}
                onChange={(e) => setP2SlaHours(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Database Transaction & Lock Settings</span>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Row-Level Locking Enabled (SELECT FOR UPDATE on queries)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Race condition collision prevention active across WebSocket dispatches</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" />
                Settings saved successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
