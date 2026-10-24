import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TrendingUp, ShieldCheck, CheckCircle2, Clock, Download, ArrowUpRight } from 'lucide-react';

export const ExpertEarnings: React.FC = () => {
  const { currentUser } = useAuth();
  const { payments } = useData();

  const myPayments = payments.filter(
    p => p.payeeId === currentUser.id || p.payeeName === currentUser.name
  );

  const releasedSum = myPayments
    .filter(p => p.status === 'RELEASED')
    .reduce((s, p) => s + p.netPayout, 0);

  const escrowSum = myPayments
    .filter(p => p.status === 'ESCROW_HELD')
    .reduce((s, p) => s + p.netPayout, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Specialist Earnings & Escrow Disbursements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified bank disbursement ledger and escrow payout tracker
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Total Payouts Disbursed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ₹{(currentUser.totalEarnings || releasedSum || 85000).toLocaleString()}.00
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Direct transfer to verified HDFC business account
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Pending in Escrow</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
            ₹{escrowSum.toLocaleString()}.00
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">
            Funds locked awaiting client sign-off
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">Platform Fee Split</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            90% Net Take
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            TechRescue takes flat 10% platform fee
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Incident Disbursement Ledger</h3>
          <span className="text-xs font-mono text-slate-400">{myPayments.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Incident Ticket</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Net Specialist Payout</th>
                <th className="py-3 px-4">Payout Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No disbursement transactions recorded yet
                  </td>
                </tr>
              ) : (
                myPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-medium">
                      {p.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      ₹{p.amount.toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      -₹{p.platformFee.toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 tabular-nums">
                      ₹{p.netPayout.toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'RELEASED' ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disbursed</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Locked in Escrow</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading payment voucher for ${p.invoiceNumber}`)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Download Voucher"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
