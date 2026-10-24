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
  Server
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
  const [protocol, setProtocol] = useState<'WebRTC P2P Desktop' | 'Encrypted SSH Terminal'>('WebRTC P2P Desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSession, setGeneratedSession] = useState<RemoteSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  if (!isOpen) return null;

  const eligibleTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');

  const handleGenerate = async () => {
    if (!selectedTicketId) return;
    setIsGenerating(true);
    const res = await createRemoteSession(selectedTicketId, protocol);
    setIsGenerating(false);

    if (res.success && res.session) {
      setGeneratedSession(res.session);
      setChatSent(true);
    } else {
      alert(res.error || 'Failed to generate session');
    }
  };

  const handleCopy = () => {
    if (!generatedSession) return;
    navigator.clipboard.writeText(generatedSession.accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Remote Access & Take-Control Hub
              </h3>
              <p className="text-xs text-slate-500">
                Generate 1-click end-to-end encrypted remote support bridge
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

            {/* Step 2: Protocol Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Remote Control Protocol
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProtocol('WebRTC P2P Desktop')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    protocol === 'WebRTC P2P Desktop'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">Remote Desktop (GUI)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Live screen mirror & keyboard control</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProtocol('Encrypted SSH Terminal')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    protocol === 'Encrypted SSH Terminal'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">Root Shell (CLI)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High-speed command execution</div>
                </button>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-Trust Enterprise Encryption</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Direct WebRTC DTLS/SRTP channel. Client retains immediate kill-switch authority to terminate connection at any second.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !selectedTicketId}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Tunnel...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Generate Secure Access Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 3: Session Generated Successfully with Direct Link */
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Remote Access Bridge Generated!</span>
                <span className="text-[11px] text-emerald-700">
                  Unique Session: <strong className="font-mono">{generatedSession.id}</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shareable Client Authorization URL:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={generatedSession.accessUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-mono text-[11px] select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {chatSent && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Link was automatically dispatched into the Client Ticket Chat stream!</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGeneratedSession(null)}
                className="text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  onLaunchConsole(generatedSession);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Launch Remote Console Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
