import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  User, 
  Building2, 
  CreditCard, 
  MessageSquare, 
  Activity, 
  Star,
  Download,
  Share2,
  Terminal,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { RemoteSessionLauncherModal } from '../../components/common/RemoteSessionLauncherModal';
import { RemoteConsoleModal } from '../../components/common/RemoteConsoleModal';

export const QueryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const { 
    tickets, 
    messages, 
    activityLogs, 
    payments, 
    remoteSessions,
    refreshData,
    sendChatMessage, 
    addWorkLog, 
    confirmAndReleasePayment,
    resolveTicket 
  } = useData();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'messages' | 'worklogs' | 'attachments' | 'resolution' | 'payment'
  >('overview');

  // Input states
  const [chatInput, setChatInput] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Outstanding rapid diagnosis and solution.');
  const [isReleasing, setIsReleasing] = useState(false);

  // Specialist resolution submission state (if expert or engineer is viewing)
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [preventiveMeasures, setPreventiveMeasures] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // Work log state (Support for both Client & Specialist)
  const [logType, setLogType] = useState<'technical' | 'client_note'>(
    role === 'CLIENT' ? 'client_note' : 'technical'
  );
  const [logHours, setLogHours] = useState(role === 'CLIENT' ? '0' : '1.0');
  const [logNotes, setLogNotes] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Remote Take-Control Session modals
  const [isRemoteLauncherOpen, setIsRemoteLauncherOpen] = useState(false);
  const [isRemoteConsoleOpen, setIsRemoteConsoleOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    refreshData();
  }, [id, refreshData]);

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-800">Incident Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested ticket may have been removed or does not exist.</p>
        <button
          onClick={() => navigate('/client/history')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Ticket Queue
        </button>
      </div>
    );
  }

  const activeRemoteSession = remoteSessions.find(
    s => s.ticketId === ticket?.id && s.status !== 'TERMINATED'
  );

  const ticketMessages = messages.filter(m => m.queryId === ticket.id);
  const ticketActivities = activityLogs.filter(a => a.queryId === ticket.id);
  const ticketPayment = payments.find(p => p.ticketId === ticket.id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendChatMessage(ticket.id, chatInput.trim());
    setChatInput('');
  };

  const handleApproveResolution = async () => {
    setIsReleasing(true);
    await confirmAndReleasePayment(ticket.id, rating, feedback);
    setIsReleasing(false);
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) return;
    setIsSubmittingResolution(true);
    await resolveTicket(ticket.id, resolutionSummary, preventiveMeasures);
    setIsSubmittingResolution(false);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim()) return;
    setIsSubmittingLog(true);
    const hours = logType === 'client_note' ? 0 : (parseFloat(logHours) || 0.5);
    const prefix = logType === 'client_note' && role === 'CLIENT' ? '[Client Observation] ' : '';
    await addWorkLog(ticket.id, hours, `${prefix}${logNotes.trim()}`);
    setLogNotes('');
    setIsSubmittingLog(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Ticket Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ticket Queue</span>
        </button>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-blue-600 tracking-wide">
                  {ticket.ticketNumber}
                </span>
                <span className="text-slate-300">·</span>
                <StatusBadge status={ticket.status} size="md" />
                <span className="text-slate-300">·</span>
                <PriorityBadge priority={ticket.priority} size="md" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {ticket.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                SLA: {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Quick Assignees Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Client Organization</span>
              <span className="font-semibold text-slate-900 block mt-0.5">{ticket.clientName}</span>
              <span className="text-[11px] text-slate-500 block">{ticket.clientCompany}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Assigned Remote Expert</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {ticket.assignedExpertName || 'Pending Specialist Match'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {ticket.assignedExpertRate ? `₹${ticket.assignedExpertRate}/hr` : 'Open pool'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">On-Site Field Engineer</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {ticket.assignedEngineerName || 'Not Dispatched (Remote)'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {ticket.engineerLocation || 'Remote investigation'}
              </span>
            </div>
          </div>

          {/* Remote Take-Control Direct Action Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {activeRemoteSession ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/30 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">
                      ME
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          ManageEngine Remote Bridge ({activeRemoteSession.status})
                        </span>
                        <span className="text-[11px] font-mono text-cyan-300">
                          {activeRemoteSession.windowsEdition || 'Windows 11 Pro x64'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1">
                        Host: <span className="font-mono text-cyan-300">{activeRemoteSession.computerName || activeRemoteSession.targetHostname || 'DESKTOP-TR94'}</span>
                        <span className="text-slate-400 font-normal"> · PIN: </span>
                        <span className="font-mono font-bold text-amber-300">{activeRemoteSession.quickSupportPin || '842-195'}</span>
                        <span className="text-slate-400 font-normal"> · User: </span>
                        <span className="text-slate-300">{activeRemoteSession.activeUser || 'CORP\\Admin'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/remote-session/${activeRemoteSession.id}?token=${activeRemoteSession.sessionToken}`;
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
                      title="Copy Remote Access Link"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSession(activeRemoteSession);
                        setIsRemoteConsoleOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>
                        {role === 'CLIENT' ? 'Authorize & Connect Remote Session' : 'Launch Remote Console'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Remote Take-Control Diagnostics
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {role === 'CLIENT' 
                        ? 'Specialist has not generated a remote access link yet. When requested, a secure one-click authorization button will appear here.'
                        : 'Need root shell or live screen access to fix this issue? Generate an encrypted remote take-control session for the user.'}
                    </span>
                  </div>
                </div>

                {(role === 'EXPERT' || role === 'ENGINEER' || role === 'ADMIN') && (
                  <button
                    onClick={() => setIsRemoteLauncherOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Generate Remote URL</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'activity', label: `Activity (${ticketActivities.length})` },
            { id: 'messages', label: `Messages (${ticketMessages.length})` },
            { id: 'worklogs', label: `Work Logs (${ticket.workLogs?.length || 0})` },
            { id: 'attachments', label: `Attachments (${ticket.attachments?.length || 0})` },
            { id: 'resolution', label: 'Resolution & Closure' },
            { id: 'payment', label: 'Escrow & Invoicing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB CONTENT 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Incident Details & Symptoms</h3>
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Short Description</span>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {ticket.shortDescription}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Detailed Diagnostic Information</span>
                  <p className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-mono text-[11px] whitespace-pre-wrap">
                    {ticket.detailedDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Environment & Parameters */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Technical Environment & Configuration</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Environment</span>
                  <span className="font-medium text-slate-800 block mt-0.5">{ticket.environment}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Group</span>
                  <span className="font-medium text-slate-800 block mt-0.5">{ticket.assignmentGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Impact</span>
                  <span className="font-medium text-slate-800 block mt-0.5">{ticket.impact}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Urgency</span>
                  <span className="font-medium text-slate-800 block mt-0.5">{ticket.urgency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* SLA Tracker Card */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">SLA Performance Target</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="font-mono text-slate-800">{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Deadline:</span>
                  <span className="font-mono text-slate-800">{new Date(ticket.slaDeadline).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-100">
                  <span className="text-slate-700">Breach Status:</span>
                  <span className="text-emerald-600">On Track (Nominal)</span>
                </div>
              </div>
            </div>

            {/* Escrow summary */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">Escrow Security</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                ₹{ticket.estimatedCost.toLocaleString()} safely held in escrow. Payout is blocked until client confirms resolution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900">Incident Activity Stream & Audit Log</h3>
          <div className="space-y-6 relative pl-6 border-l-2 border-slate-200">
            {ticketActivities.map((act) => (
              <div key={act.id} className="relative space-y-1">
                <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-1 ring-slate-200" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {act.userName} ({act.userRole})
                  </span>
                  <span className="font-mono text-[11px]">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-900">{act.action}</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {act.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Live Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[550px]">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900">Real-Time Incident Channel</span>
            </div>
            <span className="text-slate-500 font-mono">{ticketMessages.length} messages</span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {ticketMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-700">{msg.senderName}</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 px-1 rounded-xs">
                      {msg.senderRole}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.message}</p>
                    {msg.attachmentName && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5 text-[11px] font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attached: {msg.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to client or specialist (e.g. 'Checking MTU clamp now...')..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: Work Logs */}
      {activeTab === 'worklogs' && (
        <div className="space-y-6">
          {/* Add Work Log Box (For BOTH Client & Specialist) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Incident Work Log / Diagnostic Entry</h3>
                <p className="text-xs text-slate-500">
                  Both clients and assigned specialists can append verified notes, commands, and observations.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLogType('technical');
                    setLogHours('1.0');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    logType === 'technical'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Technical Diagnostic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogType('client_note');
                    setLogHours('0');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    logType === 'client_note'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Client Note
                </button>
              </div>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {logType === 'technical' ? 'Hours Spent' : 'Time Allocation'}
                  </label>
                  {logType === 'technical' ? (
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono">
                      0.0 hrs (Non-billable)
                    </div>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {logType === 'technical'
                      ? 'Technical Diagnostics, Output & Configuration Actions'
                      : 'Client Observations, Symptoms or Updates'}
                  </label>
                  <input
                    type="text"
                    required
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder={
                      logType === 'technical'
                        ? 'e.g. Reseated fiber SFP; ran tcpdump -i eth0 port 443; latency dropped to 4ms...'
                        : 'e.g. Issue recurred when backup cron triggered at 14:00; attaching core dump...'
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-400">
                  Posting as: <strong className="text-slate-700">{currentUser.name}</strong> ({role})
                </span>
                <button
                  type="submit"
                  disabled={!logNotes.trim() || isSubmittingLog}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmittingLog ? 'Recording Entry...' : 'Record Work Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* List of work logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {(!ticket.workLogs || ticket.workLogs.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No work logs recorded yet
              </div>
            ) : (
              ticket.workLogs.map((wl) => (
                <div key={wl.id} className="p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {wl.authorName} ({wl.authorRole}) · <span className="font-mono text-blue-600">{wl.hoursSpent} hrs</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(wl.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px]">
                    {wl.notes}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Attachments */}
      {activeTab === 'attachments' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Incident Evidence & Diagnostics</h3>
          {(!ticket.attachments || ticket.attachments.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No files attached to this incident
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ticket.attachments.map((att) => (
                <div key={att.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-slate-800 truncate block">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {att.size} · Uploaded by {att.uploadedBy}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading diagnostic file ${att.name}`)}
                    className="p-2 text-slate-500 hover:text-blue-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: Resolution & Closure */}
      {activeTab === 'resolution' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Resolution & Sign-Off Workflow</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict client verification protects enterprise infrastructure before tickets are marked closed
            </p>
          </div>

          {/* State 1: Ticket is already confirmed & closed */}
          {ticket.status === 'CLIENT_CONFIRMED' || ticket.status === 'CLOSED' ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Incident Confirmed Resolved by Client</span>
              </div>
              <div className="space-y-2 text-xs text-emerald-950">
                <p><strong>Root Cause:</strong> {ticket.resolutionSummary || 'Resolution verified by operations lead.'}</p>
                {ticket.preventiveMeasures && (
                  <p><strong>Preventive Measures:</strong> {ticket.preventiveMeasures}</p>
                )}
                <div className="pt-2 flex items-center gap-1 text-amber-500">
                  <span className="text-emerald-900 mr-2 font-medium">Client Rating:</span>
                  {Array.from({ length: ticket.clientRating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {ticket.clientFeedback && (
                  <p className="italic text-emerald-800">"{ticket.clientFeedback}"</p>
                )}
              </div>
            </div>
          ) : ticket.status === 'RESOLVED' ? (
            /* State 2: Specialist submitted fix; awaiting client confirmation */
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-3">
                <span className="font-bold text-blue-900 block">Submitted Resolution Details:</span>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-blue-100 leading-relaxed">
                  {ticket.resolutionSummary || 'Specialist has implemented the required fix. Systems back online.'}
                </p>
                {ticket.preventiveMeasures && (
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-blue-100 leading-relaxed">
                    <strong>Recommended Preventive Actions:</strong> {ticket.preventiveMeasures}
                  </p>
                )}
              </div>

              {/* Client Confirmation Form */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Client Approval & Escrow Release
                </h4>
                <p className="text-xs text-slate-500">
                  Please test your connectivity and systems. Clicking approve will disburse the held escrow funds (₹{ticket.estimatedCost.toLocaleString()}) to the assigned specialist.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rate Specialist Work (1 to 5 Stars)
                    </label>
                    <div className="flex gap-2 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${s <= rating ? 'fill-current' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Client Review Comments
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleApproveResolution}
                    disabled={isReleasing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isReleasing ? 'Releasing Escrow...' : 'Confirm Fix & Release Escrow Payment'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* State 3: Still In Progress */
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Work Currently in Progress</span>
                </div>
                <p className="leading-relaxed">
                  Specialist is currently running diagnostic traces. Once the fix is verified, the specialist will submit resolution documentation here for your approval.
                </p>
              </div>

              {/* Specialist Action: Submit Resolution */}
              {(role === 'EXPERT' || role === 'ENGINEER' || role === 'ADMIN') && (
                <form onSubmit={handleSubmitResolution} className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Submit Resolution as Specialist
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Root Cause & Resolution Summary *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="Detail how the issue was resolved (e.g. Changed MTU clamp to 1350 bytes; BGP peering stabilized)..."
                        className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preventive Measures & Recommendations
                      </label>
                      <input
                        type="text"
                        value={preventiveMeasures}
                        onChange={(e) => setPreventiveMeasures(e.target.value)}
                        placeholder="e.g. Configure Prometheus alert for interface CRC counters..."
                        className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingResolution || !resolutionSummary.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Submit for Client Verification
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 7: Escrow & Payment */}
      {activeTab === 'payment' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Escrow Transaction Ledger</h3>
              <p className="text-xs text-slate-500">Cryptographically verifiable escrow record</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">
              {ticketPayment?.invoiceNumber || 'INV-TR-2026-0940'}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="p-4 flex justify-between bg-slate-50">
              <span className="text-slate-600">Total Escrow Principal</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                ₹{ticket.estimatedCost.toLocaleString()}.00
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-slate-600">Platform Technology Fee (10%)</span>
              <span className="font-mono text-slate-600 tabular-nums">
                ₹{(ticket.estimatedCost * 0.1).toLocaleString()}.00
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-slate-600">Specialist Net Compensation</span>
              <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                ₹{(ticket.estimatedCost * 0.9).toLocaleString()}.00
              </span>
            </div>
            <div className="p-4 flex justify-between bg-slate-50">
              <span className="text-slate-600">Escrow State</span>
              <span className="font-semibold text-slate-800">
                {ticket.isPaymentReleased ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disbursed to Specialist Ledger</span>
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Locked in TechRescue Escrow Vault</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => alert(`Downloading GST Tax Invoice for ${ticket.ticketNumber}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* Remote Take-Control Launcher Modal */}
      <RemoteSessionLauncherModal
        isOpen={isRemoteLauncherOpen}
        onClose={() => setIsRemoteLauncherOpen(false)}
        onLaunchConsole={(sess) => {
          setSelectedSession(sess);
          setIsRemoteLauncherOpen(false);
          setIsRemoteConsoleOpen(true);
        }}
        defaultTicketId={ticket.id}
      />

      {/* Remote Take-Control Interactive Console Modal */}
      {(selectedSession || activeRemoteSession) && (
        <RemoteConsoleModal
          isOpen={isRemoteConsoleOpen}
          onClose={() => {
            setIsRemoteConsoleOpen(false);
            setSelectedSession(null);
          }}
          session={selectedSession || activeRemoteSession!}
          isExpert={role === 'EXPERT' || role === 'ENGINEER' || role === 'ADMIN'}
        />
      )}
    </div>
  );
};
