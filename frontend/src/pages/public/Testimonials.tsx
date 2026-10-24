import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Star, ShieldCheck, ArrowRight, Building, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const caseStudies = [
    {
      company: 'FinTech Global Systems',
      industry: 'Core Banking & Settlement Gateway',
      quote: 'During our morning trading settlement peak, our Azure ExpressRoute connection began dropping TCP SYN packets. Traditional Microsoft tier-1 support stated a 4-hour callback queue. Through TechRescue, Rahul Sharma claimed our ticket in 5 minutes, discovered the gateway MTU mismatch, and eliminated the packet loss in under 45 minutes.',
      author: 'Sonu Patel',
      role: 'Director of IT & Enterprise Infrastructure',
      location: 'Gurgaon, India',
      metric: '45 mins',
      metricLabel: 'From Incident to Resolution (Saved ₹18L in SLA penalties)',
      rating: 5
    },
    {
      company: 'OmniLogistics India',
      industry: 'Nationwide Cold Storage & Warehouse Hubs',
      quote: 'A forklift severed our primary overhead fiber optic patch cord at our Bhiwandi distribution center, halting 300 automated handheld scanners. TechRescue dispatched field engineer Rajesh Kumar with an optical OTDR and fusion splicer. He checked in on-site in 55 minutes and had our warehouse back online before shift change.',
      author: 'Vikramaditya Rao',
      role: 'VP of Supply Chain Systems',
      location: 'Mumbai DC Hub',
      metric: '55 mins',
      metricLabel: 'On-site Field Engineer Arrival',
      rating: 5
    },
    {
      company: 'QuickMed Healthcare',
      industry: 'Multi-Specialty Hospital Diagnostic Network',
      quote: 'Our hospital radiology PACS server lost its SAN controller mirror due to a degraded BBU. TechRescue identified the exact Dell EMC Unity battery part, dispatched a certified hardware engineer with the replacement unit, and supervised the hot-swap with zero patient scan interruptions.',
      author: 'Dr. Ananya Sen',
      role: 'Chief Technology Officer',
      location: 'Bangalore, India',
      metric: '100% Uptime',
      metricLabel: 'Maintained during live SAN battery hot-swap',
      rating: 5
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
          Enterprise Proof
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Proven Outcomes Under High-Pressure Incidents
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Real incident reports, verified root-cause metrics, and attributed testimonials from engineering leaders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {caseStudies.map((cs, idx) => (
          <div
            key={idx}
            className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  {cs.company}
                </span>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: cs.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <span className="font-mono text-xl font-bold text-blue-700 block tabular-nums">
                  {cs.metric}
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  {cs.metricLabel}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{cs.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="font-bold text-xs text-slate-900 block">{cs.author}</span>
              <span className="text-[11px] text-slate-500 block">{cs.role}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{cs.location}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => {
            switchRole('CLIENT');
            navigate('/client/dashboard');
          }}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span>Open Client Console</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
