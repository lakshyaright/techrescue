import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building2, Laptop, Wrench, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'CLIENT' | 'EXPERT' | 'ENGINEER'>('CLIENT');
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const clientSteps = [
    {
      num: '01',
      title: 'Raise Incident with Structured Wizard',
      desc: 'Define the infrastructure category (Cloud, Network, Hardware), impact level, and urgency. Our smart estimator calculates priority (P1–P4) and holds estimated escrow funds.'
    },
    {
      num: '02',
      title: 'Specialist Match & Immediate Claim',
      desc: 'The incident is broadcast to verified specialists matching required certifications. The first accepting specialist locks the ticket with atomic concurrency protection.'
    },
    {
      num: '03',
      title: 'Real-Time Console Collaboration',
      desc: 'Work through live in-app chat, share PCAP files and screenshots, inspect diagnostic work logs, and track on-site field engineer arrival in real time.'
    },
    {
      num: '04',
      title: 'Resolution Verification & Payment Release',
      desc: 'Review the technical fix and root cause documentation. When your systems pass health checks, approve resolution to release escrow payout.'
    }
  ];

  const expertSteps = [
    {
      num: '01',
      title: 'Join Vetted Expert Network',
      desc: 'Create your specialist profile highlighting cloud certifications, network routing specialties, hourly rates, and working hours.'
    },
    {
      num: '02',
      title: 'Review & Claim Open Tickets',
      desc: 'Browse incidents matching your skill stack. Review client logs and environment details. Click "Accept Job" to secure exclusive assignment.'
    },
    {
      num: '03',
      title: 'Diagnose & Log Work Entries',
      desc: 'Coordinate directly with the client IT team. Record diagnostic findings and hours worked directly into immutable incident work logs.'
    },
    {
      num: '04',
      title: 'Submit Fix & Receive Escrow Payout',
      desc: 'Submit resolution summary and preventive advice. Client confirms resolution and payment is released straight to your ledger.'
    }
  ];

  const engineerSteps = [
    {
      num: '01',
      title: 'Register Field Service Radius',
      desc: 'Configure your physical service locations (e.g., Mumbai DC Hub, Gurgaon Cyber City, Bangalore Whitefield) and hardware capabilities.'
    },
    {
      num: '02',
      title: 'Receive Proximity Field Dispatch',
      desc: 'Get notified of on-site emergencies like fiber cuts, switch stack failures, or SAN controller battery replacements nearby.'
    },
    {
      num: '03',
      title: 'Travel & Check-In On Site',
      desc: 'Update your status to "TRAVELING" and "ON_SITE". Coordinate badge passes with client security teams.'
    },
    {
      num: '04',
      title: 'Complete Physical Repair & Sign-Off',
      desc: 'Replace cables, reseat modules, test with optical OTDR, upload photo proof, and complete ticket with on-site customer confirmation.'
    }
  ];

  const currentSteps = 
    activeRoleTab === 'CLIENT' ? clientSteps :
    activeRoleTab === 'EXPERT' ? expertSteps : engineerSteps;

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
          Platform Mechanics
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          How TechRescue Delivers Guaranteed Outcomes
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Clear, deterministic workflows tailored for enterprise buyers, remote architects, and on-site field technicians.
        </p>

        {/* Interactive Role Switcher Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 mt-6">
          <button
            onClick={() => setActiveRoleTab('CLIENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeRoleTab === 'CLIENT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>For Clients</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('EXPERT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeRoleTab === 'EXPERT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>For Remote Experts</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('ENGINEER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeRoleTab === 'ENGINEER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>For Field Engineers</span>
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentSteps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 relative flex flex-col justify-between"
          >
            <div>
              <span className="font-mono text-3xl font-extrabold text-blue-600/80 block mb-2">
                {s.num}
              </span>
              <h3 className="text-base font-semibold text-slate-900 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified workflow step</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Action Prompt */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            switchRole(activeRoleTab);
            if (activeRoleTab === 'CLIENT') navigate('/client/dashboard');
            else if (activeRoleTab === 'EXPERT') navigate('/expert/dashboard');
            else navigate('/engineer/dashboard');
          }}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span>Experience {activeRoleTab} Console</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
