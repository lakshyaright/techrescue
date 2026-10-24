import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { QueryTicket, RemoteSession } from '../../types';
import { 
  X, 
  Terminal, 
  Monitor, 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  Loader2,
  Server,
  Download,
  Key,
  Check
} from 'lucide-react';

interface RemoteSessionLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchConsole: (session: RemoteSession) => void;
  defaultTicketId?: string;
}

export const RemoteSessionLauncherModal: React.FC<RemoteSessionLauncherModalProps> = ({
  isOpen,
  onClose,
  onLaunchConsole,
  defaultTicketId
}) => {
  const { tickets, createRemoteSession } = useData();
  const { currentUser } = useAuth();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    defaultTicketId || tickets.find(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED')?.id || ''
  );
  const [protocol, setProtocol] = useState<RemoteSession['protocol']>('Windows Remote Desktop (WebRTC/RDP)');
  const [windowsEdition, setWindowsEdition] = useState('Windows 11 Enterprise (x64)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSession, setGeneratedSession] = useState<RemoteSession | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPIN, setCopiedPIN] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const eligibleTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');

  const handleGenerate = async () => {
    if (!selectedTicketId) return;
    setIsGenerating(true);
    const res = await createRemoteSession(selectedTicketId, protocol);
    setIsGenerating(false);

    if (res.success && res.session) {
      setGeneratedSession(res.session);
    } else {
      alert(res.error || 'Failed to generate session');
    }
  };

  const psBootstrapCmd = generatedSession 
    ? `powershell -ExecutionPolicy Bypass -Command "iwr -useb ${window.location.origin}/agent/TechRescue-QuickSupport.ps1 | iex -SessionId ${generatedSession.sessionToken} -PIN ${generatedSession.quickSupportPin || '842-195'}"`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
              ME
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ManageEngine Remote Access Plus
              </h3>
              <p className="text-xs text-slate-500">
                Generate authentic Windows OS remote control bridge
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedSession ? (
          <div className="space-y-4 text-xs">
            {/* Step 1: Select Incident Ticket */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Incident Ticket
              </label>
              {eligibleTickets.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  No active incidents currently available to take control of.
                </div>
              ) : (
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {eligibleTickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.ticketNumber}] {t.title} ({t.priority})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Target Windows OS Edition */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Operating System
              </label>
              <select
                value={windowsEdition}
                onChange={(e) => setWindowsEdition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="Windows 11 Enterprise (x64)">Windows 11 Enterprise (23H2 / x64)</option>
                <option value="Windows 11 Pro 64-bit">Windows 11 Pro 64-bit</option>
                <option value="Windows 10 Enterprise (22H2)">Windows 10 Enterprise (22H2)</option>
                <option value="Windows Server 2022 Datacenter">Windows Server 2022 Datacenter</option>
              </select>
            </div>

            {/* Step 3: Remote Control Protocol */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Remote Control Mode
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProtocol('Windows Remote Desktop (WebRTC/RDP)')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    protocol === 'Windows Remote Desktop (WebRTC/RDP)'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">Windows Desktop (GUI)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Live screen mirror, mouse, keyboard & Ctrl+Alt+Del</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProtocol('Windows PowerShell Admin CLI')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    protocol === 'Windows PowerShell Admin CLI'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">PowerShell Admin (CLI)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Headless background diagnostics & services</div>
                </button>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ManageEngine Zero-Trust Encryption</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Generates a 6-digit QuickSupport PIN and end-to-end encrypted session using TLS 1.3 and AES-256 GCM.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || eligibleTickets.length === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Bootstrapping Windows Remote Gateway...</span>
                </>
              ) : (
                <>
                  <span>Generate Windows Remote URL & PIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Session Ready View */
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Windows Remote Session Ready</span>
              </div>
              <p className="text-emerald-800 text-xs">
                ManageEngine Remote Gateway established for <strong className="font-mono">{generatedSession.computerName}</strong>. Share the 6-digit PIN or direct link with the user.
              </p>
            </div>

            {/* QuickSupport PIN Box */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                QuickSupport Client 6-Digit PIN
              </span>
              <div className="text-2xl font-mono font-bold text-cyan-300 tracking-widest">
                {generatedSession.quickSupportPin || '842-195'}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSession.quickSupportPin || '842-195');
                  setCopiedPIN(true);
                  setTimeout(() => setCopiedPIN(false), 2000);
                }}
                className="mt-1 text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 font-mono"
              >
                {copiedPIN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPIN ? 'PIN Copied!' : 'Copy PIN'}</span>
              </button>
            </div>

            {/* Direct Web Join URL */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Client Direct Web Access Link</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={generatedSession.accessUrl}
                  className="flex-1 font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSession.accessUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 1-Click PowerShell Run Command for Windows */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">1-Click Windows Run Command (Win + R)</label>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 flex items-center justify-between gap-2 overflow-x-auto">
                <span className="truncate">{psBootstrapCmd}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(psBootstrapCmd);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded shrink-0"
                  title="Copy PowerShell Command"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Launch Console Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onLaunchConsole(generatedSession);
                  onClose();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Monitor className="w-4 h-4" />
                <span>Launch ManageEngine Console Now</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
