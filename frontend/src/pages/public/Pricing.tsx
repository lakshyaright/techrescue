import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, ShieldCheck, HelpCircle } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'per-incident' | 'monthly'>('per-incident');
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const plans = [
    {
      name: 'On-Demand Incident',
      target: 'For agile engineering teams needing zero-commitment emergency coverage',
      price: '₹3,500',
      period: 'per incident base',
      features: [
        'Pay only when incidents occur',
        'Full Escrow money-back guarantee',
        'Direct chat with L3/Cloud architect',
        'Standard 30-min triage SLA',
        'Detailed root cause analysis',
        '10% platform fee included'
      ],
      popular: false,
      cta: 'Raise First Ticket',
      roleTarget: 'CLIENT'
    },
    {
      name: 'Priority Operations SLA',
      target: 'For mid-market enterprises running revenue-critical production workloads',
      price: '₹24,999',
      period: 'per month + discounted hours',
      features: [
        'Guaranteed 15-minute P1 triage SLA',
        'Dedicated Technical Account Manager',
        '5 hours included remote architecture/mo',
        'Priority on-site field dispatch in 60 mins',
        'Pre-authorized escrow line of credit',
        'Direct phone escalation to NOC lead'
      ],
      popular: true,
      cta: 'Start Priority Coverage',
      roleTarget: 'CLIENT'
    },
    {
      name: 'Enterprise Dedicated',
      target: 'For multi-datacenter banks, fintechs, and high-volume e-commerce retailers',
      price: '₹85,000',
      period: 'per month custom retainer',
      features: [
        'Custom 10-minute P1 contractual SLA',
        'Dedicated named expert architect pool',
        'Nationwide field engineering SLA (30+ cities)',
        'Quarterly architecture & security audits',
        'SOC 2 & ISO 27001 compliance reporting',
        'Custom ERP / ServiceNow webhook integration'
      ],
      popular: false,
      cta: 'Contact Enterprise Team',
      roleTarget: 'CLIENT'
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
          Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Predictable IT Support with Zero Escrow Risk
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Choose on-demand pay-as-you-go incident resolution or priority contractual SLA retainers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-2xl bg-white border flex flex-col justify-between transition-all ${
              p.popular
                ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                : 'border-slate-200 shadow-2xs hover:border-slate-300'
            }`}
          >
            <div className="space-y-4">
              {p.popular && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Most Popular for Production
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.target}</p>
              </div>

              <div className="pt-2">
                <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                  {p.price}
                </span>
                <span className="text-xs text-slate-500 ml-2">/ {p.period}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Included capabilities:
                </span>
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  switchRole('CLIENT');
                  navigate('/client/raise-query');
                }}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors ${
                  p.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {p.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Escrow Guarantee Callout */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">100% Escrow Protection Guarantee</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Funds are never sent directly to specialists upfront. If an issue is not solved or root cause identified, your escrow is refunded in full.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            switchRole('CLIENT');
            navigate('/client/payments');
          }}
          className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline whitespace-nowrap"
        >
          View Escrow Ledger
        </button>
      </div>
    </div>
  );
};
