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
  DollarSign,
  AlertCircle,
  Server,
  Zap,
  Lock,
  Loader2,
  Info
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/Badge';

export const RaiseQuery: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useData();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Request Classification (Item 2: INC vs SER)
  const [ticketType, setTicketType] = useState<'INC' | 'SER'>('INC');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QueryTicket['category']>('Cloud Infrastructure');
  const [subcategory, setSubcategory] = useState('Virtual Network & Peering');
  const [targetAsset, setTargetAsset] = useState('');
  const [impact, setImpact] = useState<QueryTicket['impact']>('HIGH');
  const [urgency, setUrgency] = useState<QueryTicket['urgency']>('HIGH');

  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [environment, setEnvironment] = useState<QueryTicket['environment']>('Azure Cloud');
  const [datacenterRegion, setDatacenterRegion] = useState('Central India (Pune) / AWS ap-south-1');
  const [assignmentGroup, setAssignmentGroup] = useState<QueryTicket['assignmentGroup']>('Cloud Operations');
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: string; uploadedBy: string; uploadedAt: string }[]>([]);

  const [simulatedFile, setSimulatedFile] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Calculate Priority preview
  const computePriority = (): QueryTicket['priority'] => {
    if (ticketType === 'SER') {
      if (impact === 'ENTERPRISE') return 'HIGH';
      return 'MEDIUM';
    }
    if (impact === 'ENTERPRISE' || urgency === 'EMERGENCY') return 'CRITICAL';
    if (impact === 'HIGH' && urgency === 'HIGH') return 'HIGH';
    if (impact === 'HIGH' || urgency === 'HIGH') return 'HIGH';
    if (impact === 'MEDIUM' && urgency === 'MEDIUM') return 'MEDIUM';
    if (impact === 'MEDIUM' || urgency === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };

  const priority = computePriority();

  const getEstimatedCost = () => {
    if (ticketType === 'SER') {
      return 2500;
    }
    switch (priority) {
      case 'CRITICAL': return 6500;
      case 'HIGH': return 4500;
      case 'MEDIUM': return 3500;
      case 'LOW': return 2000;
    }
  };

  const estimatedCost = getEstimatedCost();

  const getSlaHours = () => {
    if (ticketType === 'SER') return '24 Hours SLA';
    if (priority === 'CRITICAL') return '2.0 Hours Emergency SLA';
    if (priority === 'HIGH') return '4.0 Hours High-Priority SLA';
    return '12.0 Hours Standard SLA';
  };

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

    const fullDetails = `${detailedDescription}\n\n[Affected Asset/Hostname]: ${targetAsset || 'N/A'}\n[Region/Datacenter]: ${datacenterRegion}`;

    const res = await createTicket({
      title,
      category,
      subcategory,
      impact,
      urgency,
      shortDescription,
      detailedDescription: fullDetails,
      environment,
      assignmentGroup,
      ticketType,
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Raise IT Ticket & Incident Intake
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise intake protocol with automated ITIL classification (INC vs SER) and escrow guarantee
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
            Step {step} of 3
          </span>
        </div>

        {/* Visual Stepper */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-semibold">
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${step >= 1 ? 'border-blue-600 bg-blue-50/70 text-blue-900' : 'border-slate-200 text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Classification & Target Asset</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${step >= 2 ? 'border-blue-600 bg-blue-50/70 text-blue-900' : 'border-slate-200 text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Diagnostic Scope & Logs</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${step === 3 ? 'border-blue-600 bg-blue-50/70 text-blue-900' : 'border-slate-200 text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>SLA Matrix & Escrow Vault</span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STEP 1: CLASSIFICATION (INC vs SER) & TARGET ASSET */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {/* Classification Toggle: INC vs SER */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Ticket Classification Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTicketType('INC')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  ticketType === 'INC'
                    ? 'border-rose-600 bg-rose-50/80 text-rose-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center font-mono text-xs font-bold">
                      INC
                    </span>
                    <span className="font-bold text-sm">Incident Ticket (Break / Fix)</span>
                  </div>
                  {ticketType === 'INC' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </div>
                <p className="text-xs text-rose-800/80">
                  Unplanned service disruption, critical outage, system downtime, firewall failure, or latency emergency.
                </p>
                <div className="mt-2 text-[10px] font-mono text-rose-700 font-semibold">
                  Prefix: INC-2026-XXXX · Rapid 2-4h SLA
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTicketType('SER')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  ticketType === 'SER'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-mono text-xs font-bold">
                      SER
                    </span>
                    <span className="font-bold text-sm">Service Request (SER)</span>
                  </div>
                  {ticketType === 'SER' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-indigo-800/80">
                  Standard IT request, user access grant, cloud VM provisioning, database migration, or SSL certificate install.
                </p>
                <div className="mt-2 text-[10px] font-mono text-indigo-700 font-semibold">
                  Prefix: SER-2026-XXXX · Standard 24h SLA
                </div>
              </button>
            </div>
          </div>

          {/* Ticket Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ticket Short Summary / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={ticketType === 'INC' ? "e.g. Production Redis Cluster failover stalled during high load" : "e.g. Provisioning staging Kubernetes ingress controller with TLS"}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Affected Target Asset & Datacenter Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Affected Target Host / IP / Cluster ARN
              </label>
              <input
                type="text"
                value={targetAsset}
                onChange={(e) => setTargetAsset(e.target.value)}
                placeholder="e.g. 10.20.14.88 / prod-db-replica-01"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cloud Zone / Datacenter Location
              </label>
              <select
                value={datacenterRegion}
                onChange={(e) => setDatacenterRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="AWS ap-south-1 (Mumbai)">AWS ap-south-1 (Mumbai)</option>
                <option value="Azure Central India (Pune)">Azure Central India (Pune)</option>
                <option value="GCP asia-south1 (Delhi)">GCP asia-south1 (Delhi)</option>
                <option value="Equinix Tier-3 Datacenter (Mumbai)">Equinix Tier-3 Datacenter (Mumbai)</option>
                <option value="Netmagic Datacenter (Bangalore)">Netmagic Datacenter (Bangalore)</option>
                <option value="Hybrid On-Premise Rack">Hybrid On-Premise Rack</option>
              </select>
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Technical Stack Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
              <label className="block font-bold text-slate-700 mb-1">
                Component Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. BGP Routing, Docker Ingress, SSL handshake"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <span>Next: Diagnostic Scope</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DIAGNOSTIC SCOPE & LOGS */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Execution Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="Azure Cloud">Azure Cloud (Enterprise Tenant)</option>
                <option value="AWS Enterprise">AWS Enterprise (Multi-Account Org)</option>
                <option value="Google Cloud (GCP)">Google Cloud (GCP)</option>
                <option value="On-Premises Datacenter">On-Premises Datacenter</option>
                <option value="Hybrid Multi-Cloud">Hybrid Multi-Cloud</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Specialist Assignment Group
              </label>
              <select
                value={assignmentGroup}
                onChange={(e) => setAssignmentGroup(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="Cloud Operations">Cloud Operations & SRE</option>
                <option value="Network Infrastructure">Network Infrastructure & BGP</option>
                <option value="Cyber Security SOC">Cyber Security & Firewall Team</option>
                <option value="Datacenter Hardware">Datacenter Hardware & Field Tech</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Problem Statement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Ingress gateway dropping 30% of incoming TCP packets on Port 443"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Diagnostic Trace, Error Codes & Repro Steps
            </label>
            <textarea
              rows={5}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="Paste stack traces, syslog lines, traceroute snippets, or error outputs..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Diagnostic Log Attachment Simulation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Attach Diagnostic Files (pcap, journalctl logs, topology diagram)
            </label>
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                value={simulatedFile}
                onChange={(e) => setSimulatedFile(e.target.value)}
                placeholder="e.g. gateway_error.log, tcpdump.pcap, firewall_rules.json"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shrink-0 cursor-pointer text-xs"
              >
                + Add File
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((att) => (
                  <div key={att.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{att.name}</span>
                    <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="text-slate-400 hover:text-red-600 cursor-pointer ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!shortDescription.trim()}
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <span>Next: SLA & Escrow Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ITIL SEVERITY MATRIX & ESCROW VAULT GUARANTEE */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Business Impact
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ENTERPRISE">ENTERPRISE - Core Revenue/Data At Risk</option>
                <option value="HIGH">HIGH - Critical Branch / Cluster Offline</option>
                <option value="MEDIUM">MEDIUM - Single Workload Impaired</option>
                <option value="LOW">LOW - Non-blocking Minor Glitch</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="EMERGENCY">EMERGENCY - Complete Production Halt</option>
                <option value="HIGH">HIGH - Escalated Immediate Resolution Needed</option>
                <option value="MEDIUM">MEDIUM - Standard Business Operation SLA</option>
                <option value="LOW">LOW - Scheduled Maintenance Window</option>
              </select>
            </div>
          </div>

          {/* Calculated Priority & SLA Target Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Calculated Response Guarantee
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-base text-slate-900">
                  {ticketType === 'INC' ? 'Incident Priority:' : 'Service Request Priority:'}
                </span>
                <PriorityBadge priority={priority} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-700 block">{getSlaHours()}</span>
              <span className="text-[10px] text-slate-500 font-mono">15m initial response lock</span>
            </div>
          </div>

          {/* Escrow Vault Transparency Box */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm">Escrow Vault Deposit Estimate</span>
              </div>
              <span className="font-mono text-xl font-bold text-emerald-800">
                ₹{estimatedCost.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              100% of funds are securely held in the TechRescue Enterprise Escrow Vault. Funds will NOT be disbursed to the specialist until you verify the resolution in the console.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="text-slate-700 cursor-pointer">
              I authorize initiating incident dispatch for <strong>{ticketType}-{title || 'Ticket'}</strong> under Enterprise SLA Terms with Escrow Protection.
            </label>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting || !termsAccepted}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing to Database...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Submit {ticketType} & Fund Escrow</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
