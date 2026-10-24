import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, CheckCircle2, Clock, Download, ArrowUpRight, TrendingUp } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { payments } = useData();

  const totalHeld = payments
    .filter(p => p.status === 'ESCROW_HELD')
    .reduce((s, p) => s + p.amount, 0);

  const totalReleased = payments
    .filter(p => p.status === 'RELEASED')
    .reduce((s, p) => s + p.amount, 0);

  const totalPlatformFees = payments.reduce((s, p) => s + p.platformFee, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Global Escrow & Revenue Administration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform-wide escrow custody, 10% commission revenues, and banking settlement logs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Total Escrow in Custody</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalHeld.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Locked across active incident tickets
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Total Disbursed to Date</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalReleased.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Transferred directly to specialists
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">TechRescue Platform Margin (10%)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
            ₹{totalPlatformFees.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Net operational platform take
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Platform Financial Audit Trail</h3>
          <span className="text-xs font-mono text-slate-400">{payments.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client Enterprise</th>
                <th className="py-3 px-4">Payee Specialist</th>
                <th className="py-3 px-4">Gross GMV</th>
                <th className="py-3 px-4">Platform Take</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-900 font-medium">{p.clientName}</td>
                  <td className="py-3 px-4 text-slate-700">{p.payeeName} ({p.payeeRole})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    ₹{p.amount.toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-600 tabular-nums">
                    ₹{p.platformFee.toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 tabular-nums">
                    ₹{p.netPayout.toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4">
                    {p.status === 'RELEASED' ? (
                      <span className="text-emerald-700 font-medium">Released</span>
                    ) : (
                      <span className="text-amber-700 font-medium">Held in Custody</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Reviewing escrow ledger ${p.invoiceNumber}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
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
    </div>
  );
};
