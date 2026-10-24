import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientMessages: React.FC = () => {
  const { tickets, messages, sendChatMessage } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Find active tickets with messages
  const activeTickets = tickets.filter(t => t.assignedExpertId || t.assignedEngineerId);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(activeTickets[0]?.id || '');
  const [inputText, setInputText] = useState('');

  const currentTicket = tickets.find(t => t.id === selectedTicketId);
  const ticketMessages = messages.filter(m => m.queryId === selectedTicketId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTicketId) return;
    await sendChatMessage(selectedTicketId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Incident Communications Console
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time technical coordination with assigned remote architects and field engineers
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]">
        {/* Left: Ticket Conversation Selector */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 font-semibold text-xs text-slate-800">
            Active Incident Channels ({activeTickets.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {activeTickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              const lastMsg = messages.filter(m => m.queryId === t.id).slice(-1)[0];
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-white border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-600 text-[11px]">{t.ticketNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 truncate mb-1">{t.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {lastMsg ? `${lastMsg.senderName}: ${lastMsg.message}` : 'No messages yet'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {currentTicket ? (
            <>
              {/* Channel Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{currentTicket.ticketNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-sm">{currentTicket.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Specialist: {currentTicket.assignedExpertName || currentTicket.assignedEngineerName}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/client/query/${currentTicket.id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
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
                        className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Transmit message to specialist..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select an incident channel to inspect communications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
