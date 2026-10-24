import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Download, CheckCircle2, Clock, CreditCard, ArrowUpRight } from 'lucide-react';

export const ClientPayments: React.FC = () => {
  const { payments } = useData();

  const totalHeld = payments
    .filter(p => p.status === 'ESCROW_HELD')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDisbursed = payments
    .filter(p => p.status === 'RELEASED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Escrow & Billing Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise payment vault, active escrow deposits, and GST tax invoice receipts
        </p>
      </div>

      {/* Escrow Balance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Active Escrow Vault</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalHeld.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Guaranteed funds awaiting resolution sign-off
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Total Disbursed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalDisbursed.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Approved and released to verified specialists
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Payment Method</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            Corporate Escrow Credit Line
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            ● Active Enterprise Mandate
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Payment Transactions & Escrow History</h3>
          <span className="text-xs font-mono text-slate-400">{payments.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Incident Ticket</th>
                <th className="py-3 px-4">Payee Specialist</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Platform Fee (10%)</th>
                <th className="py-3 px-4">Escrow Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">
                    {p.ticketNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {p.payeeName} ({p.payeeRole})
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    ₹{p.amount.toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                    ₹{p.platformFee.toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4">
                    {p.status === 'RELEASED' ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Released</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Held in Escrow</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading PDF receipt for ${p.invoiceNumber}`)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
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
