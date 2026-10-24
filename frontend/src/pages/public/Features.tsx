import React from 'react';
import { 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Award, 
  CreditCard, 
  Terminal, 
  MapPin, 
  Cpu, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Features: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const features = [
    {
      icon: Globe2,
      title: 'Global & Regional Expert Network',
      description: 'Access seasoned L3/CCIE network engineers, Azure/AWS principal architects, and cybersecurity specialists vetted through practical technical tests.',
      bullet: 'Top 3% acceptance rate among certified engineers'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Escrow Transactions',
      description: 'Your payment is safely held in escrow before work begins. Funds are disbursed to the expert or field technician only after you review and approve the resolution.',
      bullet: '100% money-back guarantee on unresolved tickets'
    },
    {
      icon: Zap,
      title: 'Sub-15 Minute Rapid Response',
      description: 'Our automated priority matching algorithm immediately alerts matching engineers based on certified skillsets, availability status, and geolocation.',
      bullet: 'Guaranteed P1 response times with active SLA monitoring'
    },
    {
      icon: MapPin,
      title: 'On-Demand Field Engineering',
      description: 'For physical hardware, fiber optic splicing, switch replacement, or datacenter rack installation, dispatch localized field engineers equipped with certified diagnostic tools.',
      bullet: 'Coverage across major metro datacenter zones'
    },
    {
      icon: Award,
      title: 'Enterprise Quality Guarantee',
      description: 'Every ticket includes root-cause analysis, configuration work logs, and preventive measures documentation for your internal post-mortem audits.',
      bullet: 'Comprehensive audit trails and configuration diffs'
    },
    {
      icon: CreditCard,
      title: 'Transparent Pay-As-You-Go Pricing',
      description: 'No bloated annual recurring lock-ins. Pay transparent hourly or fixed-incident rates with crystal-clear breakdowns and automated GST tax invoices.',
      bullet: 'Zero hidden retainer fees'
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
          Enterprise Features
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Built Specifically for Mission-Critical IT Operations
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Everything enterprise engineering teams need to recover from downtime and maintain infrastructure integrity.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <span>✓ {feat.bullet}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Architecture Highlight */}
      <div className="p-8 rounded-2xl bg-slate-900 text-white space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Architecture & Reliability
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Atomic Ticket Locking & Concurrency Protection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Unlike informal Slack channels or unmonitored ticket queues where multiple engineers accidentally step on the same incident, TechRescue enforces atomic database state transactions:
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto space-y-1">
          <p className="text-slate-500">// Transactional Assignment Lock</p>
          <p><span className="text-purple-400">BEGIN TRANSACTION;</span></p>
          <p>&nbsp;&nbsp;<span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> tickets <span className="text-blue-400">WHERE</span> id = 'INC-10231' <span className="text-yellow-400">FOR UPDATE;</span></p>
          <p>&nbsp;&nbsp;<span className="text-slate-400">-- Verified: Status == 'OPEN'</span></p>
          <p>&nbsp;&nbsp;<span className="text-blue-400">UPDATE</span> tickets <span className="text-blue-400">SET</span> status = 'IN_PROGRESS', assigned_expert_id = 'usr-expert-1';</p>
          <p><span className="text-purple-400">COMMIT;</span></p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">Guarantees zero duplicate billing and immediate ownership.</span>
          <button
            onClick={() => {
              switchRole('CLIENT');
              navigate('/client/raise-query');
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Test Live Ticket Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
