import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { QueryTicket } from '../../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/Badge';

export const RaiseQuery: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useData();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QueryTicket['category']>('Cloud Infrastructure');
  const [subcategory, setSubcategory] = useState('Virtual Network & Peering');
  const [impact, setImpact] = useState<QueryTicket['impact']>('HIGH');
  const [urgency, setUrgency] = useState<QueryTicket['urgency']>('HIGH');

  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [environment, setEnvironment] = useState<QueryTicket['environment']>('Azure Cloud');
  const [assignmentGroup, setAssignmentGroup] = useState<QueryTicket['assignmentGroup']>('Cloud Operations');
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: string; uploadedBy: string; uploadedAt: string }[]>([]);

  const [simulatedFile, setSimulatedFile] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Calculate Priority preview
  const computePriority = (): QueryTicket['priority'] => {
    if (impact === 'ENTERPRISE' || urgency === 'EMERGENCY') return 'CRITICAL';
    if (impact === 'HIGH' && urgency === 'HIGH') return 'HIGH';
    if (impact === 'HIGH' || urgency === 'HIGH') return 'HIGH';
    if (impact === 'MEDIUM' && urgency === 'MEDIUM') return 'MEDIUM';
    if (impact === 'MEDIUM' || urgency === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };

  const priority = computePriority();

  const getEstimatedCost = () => {
    switch (priority) {
      case 'CRITICAL': return 6500;
      case 'HIGH': return 4500;
      case 'MEDIUM': return 3500;
      case 'LOW': return 2000;
    }
  };

  const estimatedCost = getEstimatedCost();

  const handleAddAttachment = () => {
    if (!simulatedFile) return;
    const newAtt = {
      id: `att-${Date.now()}`,
      name: simulatedFile,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: simulatedFile.endsWith('.pcap') ? 'application/vnd.tcpdump.pcap' : 'text/plain',
      uploadedBy: 'Client Operator',
      uploadedAt: new Date().toISOString()
    };
    setAttachments(prev => [...prev, newAtt]);
    setSimulatedFile('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleFinalSubmit = async () => {
    if (!termsAccepted) return;
    setIsSubmitting(true);

    setSubmitError(null);
    const res = await createTicket({
      title,
      category,
      subcategory,
      impact,
      urgency,
      shortDescription,
      detailedDescription,
      environment,
      assignmentGroup,
      attachments
    });

    setIsSubmitting(false);

    if (res.success && res.ticket) {
      navigate(`/client/query/${res.ticket.id}`);
    } else {
      setSubmitError(res.error || 'Failed to submit query to database.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Raise Technical Query
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Structured 3-step intake protocol to trigger SLA response and specialist lock
        </p>

        {submitError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 3 Step Visual Pills */}
        <div className="flex items-center justify-between mt-6 max-w-xl">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </div>
            <span className={`text-xs font-medium ${step === 1 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
              Query Details
            </span>
          </div>

          <div className={`h-0.5 w-12 sm:w-20 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
              Technical Scope
            </span>
          </div>

          <div className={`h-0.5 w-12 sm:w-20 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
            <span className={`text-xs font-medium ${step === 3 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: Query Details */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 1: Incident Categorization</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Core Cisco Catalyst 9300 Port Flapping on Uplink 2"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QueryTicket['category'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Network & Firewall">Network & Firewall</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                  <option value="Hardware & Servers">Hardware & Servers</option>
                  <option value="Software & DevOps">Software & DevOps</option>
                  <option value="Datacenter & Storage">Datacenter & Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subcategory *
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. ExpressRoute / BGP / Switch Stack"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Impact & Urgency Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Impact *
                </label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as QueryTicket['impact'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="ENTERPRISE">Enterprise-Wide (Revenue Halted / Branch Isolated)</option>
                  <option value="HIGH">High (Multiple Core Services Degraded)</option>
                  <option value="MEDIUM">Medium (Single Department / Redundancy Lost)</option>
                  <option value="LOW">Low (Single User / Non-Critical Component)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level *
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as QueryTicket['urgency'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="EMERGENCY">Emergency (Immediate Intervention Needed)</option>
                  <option value="HIGH">High (Within 2 Hours)</option>
                  <option value="MEDIUM">Medium (Within Business Day)</option>
                  <option value="LOW">Low (Standard Queue)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Computed Priority Indicator */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Computed Ticket Priority:</span>
              <PriorityBadge priority={priority} size="md" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <span>Continue to Technical Scope</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Technical Scope & Attachments */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 2: Technical Scope & Environment</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Operating Environment *
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as QueryTicket['environment'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Azure Cloud">Azure Cloud</option>
                  <option value="AWS">AWS</option>
                  <option value="Hybrid Cloud">Hybrid Cloud</option>
                  <option value="On-Premises Datacenter">On-Premises Datacenter</option>
                  <option value="Corporate Office LAN">Corporate Office LAN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommended Assignment Group *
                </label>
                <select
                  value={assignmentGroup}
                  onChange={(e) => setAssignmentGroup(e.target.value as QueryTicket['assignmentGroup'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Cloud Operations">Cloud Operations</option>
                  <option value="Core Networking">Core Networking</option>
                  <option value="Information Security">Information Security</option>
                  <option value="Desktop & Hardware Engineering">Desktop & Hardware Engineering</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Problem Summary *
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief one-line summary for rapid notification dispatch"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Diagnostic Description & Log Extracts *
              </label>
              <textarea
                rows={5}
                required
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="Include error codes, affected IP addresses, interface IDs, symptoms, and troubleshooting steps already attempted..."
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Attachments Section */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Diagnostic File Attachments (PCAP, syslog, topology screenshots)
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={simulatedFile}
                  onChange={(e) => setSimulatedFile(e.target.value)}
                  placeholder="Attach file: e.g. firewall_syslog_trace.pcap or switch_log.txt"
                  className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
                >
                  Attach File
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  {attachments.map((att) => (
                    <div key={att.id} className="p-2.5 px-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!shortDescription.trim() || !detailedDescription.trim()}
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <span>Review & Confirm SLA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Step 3: Review Incident & Escrow Authorization</h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Incident Subject</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{title}</span>
              </div>
              <PriorityBadge priority={priority} size="md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-t border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Category</span>
                <span className="text-slate-800 font-medium block mt-0.5">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Environment</span>
                <span className="text-slate-800 font-medium block mt-0.5">{environment}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Impact</span>
                <span className="text-slate-800 font-medium block mt-0.5">{impact}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Target SLA</span>
                <span className="text-slate-800 font-medium block mt-0.5">
                  {priority === 'CRITICAL' ? '2.0 hrs' : priority === 'HIGH' ? '4.0 hrs' : '12.0 hrs'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Detailed Problem</span>
              <p className="text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {detailedDescription}
              </p>
            </div>
          </div>

          {/* Escrow Deposit Summary Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Estimated Escrow Deposit Required:</span>
              </div>
              <span className="font-mono text-base font-extrabold text-emerald-900 tabular-nums">
                ₹{estimatedCost.toLocaleString()}.00
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Funds are held securely by TechRescue Escrow. No payout is disbursed to the remote specialist or field engineer until you test and approve the resolution.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded-sm text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-snug">
              I agree to the TechRescue SLA terms and authorize the temporary escrow hold of ₹{estimatedCost.toLocaleString()}.00 for incident resolution.
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!termsAccepted || isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <span>Generating Ticket & Locking Escrow...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Ticket to Expert Pool</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
