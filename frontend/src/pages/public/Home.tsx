import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Server, 
  Wifi, 
  Cloud, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const handleLaunchClient = () => {
    switchRole('CLIENT');
    navigate('/client/raise-query');
  };

  const handleExploreExperts = () => {
    switchRole('CLIENT');
    navigate('/client/experts');
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise IT Support & Field Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
              Enterprise IT Support, <span className="text-blue-600">Rescued.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              When production cloud clusters flap, firewalls drop routes, or datacenter core switches fail, TechRescue matches your engineers with certified remote IT specialists and rapid-dispatch field engineers in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunchClient}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>Raise Incident Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleExploreExperts}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>Explore Expert Roster</span>
              </button>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Risk Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>15-Min Median P1 Triage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Field Technicians</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Platform Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                    Live Incident Dispatch
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400 tabular-nums">INC-20261008-0001</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Incident Subject</span>
                  <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                    Azure ExpressRoute Peering Packet Drop
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Priority</span>
                    <span className="font-semibold text-amber-700 block mt-0.5">▲ P1 - High</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">SLA Target</span>
                    <span className="font-mono text-slate-800 block mt-0.5">1h 45m remaining</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Architect</span>
                    <span className="text-slate-800 font-medium block mt-0.5">Rahul Sharma (4.8 ★)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Escrow Held</span>
                    <span className="font-mono text-emerald-700 font-medium block mt-0.5">₹4,500.00</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Status: Diagnostics in Progress</span>
                  <button
                    onClick={() => {
                      switchRole('EXPERT');
                      navigate('/expert/jobs');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>View as Expert</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quantitative Proof Metrics Strip */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-blue-400 tabular-nums">
                15 min
              </span>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Median P1 Initial Triage
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
                1,240+
              </span>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Vetted Field Engineers
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
                99.4%
              </span>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                First-Time Resolution Rate
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
                ₹25.4L+
              </span>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Safe Escrow Disbursed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why TechRescue: Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
            The TechRescue Advantage
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Stop Waiting Hours for Tier-1 Call Centers
          </h3>
          <p className="text-sm text-slate-600">
            Compare traditional managed IT providers against TechRescue's direct specialist marketplace.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Capability & SLA</th>
                  <th className="py-3.5 px-6 text-slate-400">Traditional IT MSPs</th>
                  <th className="py-3.5 px-6 text-blue-600 bg-blue-50/50">TechRescue Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-4 px-6 font-medium text-slate-900">Senior Architect Access</td>
                  <td className="py-4 px-6 text-slate-500">Tier 1 script triage (2-4 hrs delay)</td>
                  <td className="py-4 px-6 font-semibold text-blue-900 bg-blue-50/30">Direct match with L3/CCIE/Cloud architects</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-slate-900">On-Site Field Engineer Dispatch</td>
                  <td className="py-4 px-6 text-slate-500">Next-business-day or outsourced third party</td>
                  <td className="py-4 px-6 font-semibold text-blue-900 bg-blue-50/30">Nearby engineer dispatch with live tracking</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-slate-900">Billing & Payment Security</td>
                  <td className="py-4 px-6 text-slate-500">Locked multi-year contracts, upfront retainers</td>
                  <td className="py-4 px-6 font-semibold text-blue-900 bg-blue-50/30">Pay-as-you-go Escrow (Released only on fix approval)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-slate-900">Concurrency & Ticket Locking</td>
                  <td className="py-4 px-6 text-slate-500">Unsynchronized email queues, double work</td>
                  <td className="py-4 px-6 font-semibold text-blue-900 bg-blue-50/30">Atomic transaction locking prevents collisions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Core Expertise Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left space-y-2">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
            Specialized Categories
          </h2>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comprehensive Infrastructure Coverage
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">Cloud Infrastructure</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Azure ExpressRoute, AWS Direct Connect, Kubernetes ingress failures, Terraform state recovery, IAM policy repairs.
            </p>
            <div className="pt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
              <span>Average response: 12 mins</span>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">Core Network & Firewall</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cisco Catalyst stack flapping, Fortinet SD-WAN tunnel disconnects, Palo Alto NAT policies, BGP flapping.
            </p>
            <div className="pt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
              <span>Average response: 14 mins</span>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">Datacenter Hardware Dispatch</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Physical fiber optic OTDR testing, SAN storage controller battery replacement, switch port swapping, rack cabling.
            </p>
            <div className="pt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
              <span>On-site ETA: 45–90 mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 3-Step Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Simple 3-Step Lifecycle
            </h2>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              From Urgent Incident to Verified Resolution
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-blue-600">01.</span>
              <h4 className="text-base font-semibold text-slate-900">Raise Query Wizard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe the problem, impact, and urgency. Our system computes strict SLA targets and holds initial escrow funds safely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-blue-600">02.</span>
              <h4 className="text-base font-semibold text-slate-900">Specialist Claim & Lock</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A verified cloud expert or on-site field engineer claims the ticket. Atomic lock prevents duplicate assignments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-blue-600">03.</span>
              <h4 className="text-base font-semibold text-slate-900">Approve & Disburse</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Collaborate via real-time console messages, review work logs, test the fix, and release escrow payment upon satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl bg-blue-600 text-white p-8 sm:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Facing an active infrastructure incident right now?
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Launch your incident in under 2 minutes. Our specialists are on standby across all major cloud providers and Indian metro datacenter hubs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleLaunchClient}
              className="px-6 py-3.5 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-xs whitespace-nowrap text-center"
            >
              Raise Ticket as Client
            </button>
            <button
              onClick={() => {
                switchRole('EXPERT');
                navigate('/expert/dashboard');
              }}
              className="px-6 py-3.5 bg-blue-700 text-white border border-blue-500 text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap text-center"
            >
              Login as Specialist
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
