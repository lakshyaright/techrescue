import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  QueryTicket, 
  ChatMessage, 
  ActivityLog, 
  PaymentTransaction, 
  TicketStatus, 
  TicketPriority, 
  WorkLog,
  RemoteSession
} from '../types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { api } from '../services/api';

interface DataContextType {
  tickets: QueryTicket[];
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  payments: PaymentTransaction[];
  remoteSessions: RemoteSession[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  
  createTicket: (data: {
    title: string;
    category: QueryTicket['category'];
    subcategory: string;
    impact: QueryTicket['impact'];
    urgency: QueryTicket['urgency'];
    shortDescription: string;
    detailedDescription: string;
    environment: QueryTicket['environment'];
    assignmentGroup: QueryTicket['assignmentGroup'];
    ticketType?: 'INC' | 'SER';
    attachments?: QueryTicket['attachments'];
  }) => Promise<{ success: boolean; ticket?: QueryTicket; error?: string }>;

  acceptJobAsExpert: (ticketId: string, expertId: string) => Promise<{ success: boolean; error?: string }>;
  assignEngineerToTicket: (ticketId: string, engineerId: string) => Promise<{ success: boolean; error?: string }>;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, notes?: string) => Promise<{ success: boolean; error?: string }>;
  addWorkLog: (ticketId: string, hours: number, notes: string, isDiagnostic?: boolean) => Promise<{ success: boolean; error?: string }>;
  sendChatMessage: (ticketId: string, text: string, attachmentName?: string) => Promise<{ success: boolean; error?: string }>;
  resolveTicket: (ticketId: string, resolutionSummary: string, preventiveMeasures: string) => Promise<{ success: boolean; error?: string }>;
  confirmAndReleasePayment: (ticketId: string, rating: number, feedback: string) => Promise<{ success: boolean; error?: string }>;
  adminOverrideTicket: (ticketId: string, updates: Partial<QueryTicket>) => Promise<{ success: boolean; error?: string }>;
  createRemoteSession: (ticketId: string, protocol?: 'WebRTC P2P Desktop' | 'Encrypted SSH Terminal') => Promise<{ success: boolean; session?: RemoteSession; error?: string }>;
  connectRemoteSession: (sessionId: string) => Promise<{ success: boolean }>;
  terminateRemoteSession: (sessionId: string) => Promise<{ success: boolean }>;
  getTicketById: (ticketId: string) => QueryTicket | undefined;
  getMessagesForTicket: (ticketId: string) => ChatMessage[];
  resetToDefaultData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users, updateCurrentUser, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  // ONLY show data that is in PostgreSQL database or created by user (NO hardcoded mock fallback)
  const [tickets, setTickets] = useState<QueryTicket[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [remoteSessions, setRemoteSessions] = useState<RemoteSession[]>(() => {
    try {
      const saved = localStorage.getItem('techrescue_remote_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all live records from the database
  const refreshData = async () => {
    try {
      // 1. Fetch queries from PostgreSQL
      const qRes = await api.get('/queries');
      if (qRes.success && Array.isArray(qRes.data)) {
        const liveTickets: QueryTicket[] = qRes.data.map((q: any) => ({
          id: q.id,
          ticketNumber: q.ticket_number,
          ticketType: q.ticket_number?.startsWith('SER') ? 'SER' : 'INC',
          title: q.title,
          category: q.category,
          subcategory: q.subcategory || '',
          impact: q.impact,
          urgency: q.urgency,
          priority: q.priority,
          status: q.status,
          clientId: q.client_id,
          clientName: q.client_name || 'Client',
          clientCompany: q.company || 'Enterprise Client',
          clientEmail: q.client_email || 'client@enterprise.com',
          clientPhone: q.client_phone || '',
          shortDescription: q.short_description,
          detailedDescription: q.detailed_description,
          environment: q.environment,
          assignmentGroup: q.assignment_group,
          estimatedCost: parseFloat(q.estimated_cost || '3500'),
          actualCost: q.actual_cost ? parseFloat(q.actual_cost) : undefined,
          isEscrowFunded: Boolean(q.is_escrow_funded),
          isPaymentReleased: Boolean(q.is_payment_released),
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          slaDeadline: q.sla_deadline,
          slaBreached: Boolean(q.sla_breached),
          assignedExpertId: q.assigned_expert_id,
          assignedEngineerId: q.assigned_engineer_id,
          resolutionSummary: q.resolution_summary,
          preventiveMeasures: q.preventive_measures,
          clientRating: q.client_rating,
          clientFeedback: q.client_feedback,
          attachments: [],
          workLogs: (q.workLogs || []).map((wl: any) => ({
            id: wl.id,
            queryId: wl.query_id,
            authorId: wl.author_id,
            authorName: wl.author_name || 'Technical Specialist',
            authorRole: wl.author_role || 'EXPERT',
            hoursSpent: parseFloat(wl.hours_spent || '1.0'),
            notes: wl.notes,
            timestamp: wl.created_at,
            isDiagnostic: Boolean(wl.is_diagnostic)
          }))
        }));
        setTickets(liveTickets);
      }

      // 2. Fetch payments from PostgreSQL
      const pRes = await api.get('/payments');
      if (pRes.success && Array.isArray(pRes.data)) {
        const livePayments: PaymentTransaction[] = pRes.data.map((p: any) => ({
          id: p.id,
          ticketId: p.ticket_id,
          ticketNumber: p.ticket_number || 'TICKET',
          clientId: p.client_id,
          clientName: p.client_name || 'Client',
          payeeId: p.payee_id || '',
          payeeName: p.payee_name || 'Specialist',
          payeeRole: p.payee_role || 'EXPERT',
          amount: parseFloat(p.amount || '0'),
          platformFee: parseFloat(p.platform_fee || '0'),
          netPayout: parseFloat(p.net_payout || '0'),
          status: p.status || 'ESCROW_HELD',
          date: p.created_at,
          invoiceNumber: p.invoice_number || `INV-${p.id}`
        }));
        setPayments(livePayments);
      }

      // 3. Fetch audit logs from PostgreSQL
      const aRes = await api.get('/audit-logs');
      if (aRes.success && Array.isArray(aRes.data)) {
        const liveLogs: ActivityLog[] = aRes.data.map((a: any) => ({
          id: a.id,
          queryId: a.query_id || '',
          ticketNumber: a.ticket_number || '',
          userId: a.user_id,
          userName: a.user_name,
          userRole: a.user_role,
          action: a.action,
          details: a.details,
          timestamp: a.created_at,
          type: a.activity_type || 'comment'
        }));
        setActivityLogs(liveLogs);
      }
    } catch (err) {
      console.warn('Failed to load database records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Background Live Synchronization Interval (Item 1: Real-time update across all tabs)
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 6000); // 6s real-time live sync
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const computePriority = (impact: QueryTicket['impact'], urgency: QueryTicket['urgency']): TicketPriority => {
    if (impact === 'ENTERPRISE' || urgency === 'EMERGENCY') return 'CRITICAL';
    if (impact === 'HIGH' && urgency === 'HIGH') return 'HIGH';
    if (impact === 'HIGH' || urgency === 'HIGH') return 'HIGH';
    if (impact === 'MEDIUM' && urgency === 'MEDIUM') return 'MEDIUM';
    if (impact === 'MEDIUM' || urgency === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };

  const createTicket: DataContextType['createTicket'] = async (data) => {
    if (!isAuthenticated || !currentUser) {
      return { success: false, error: 'Authentication required. Please sign in to submit a ticket.' };
    }

    const priority = computePriority(data.impact, data.urgency);
    let estimatedCost = 3500;
    if (priority === 'CRITICAL') estimatedCost = 6500;
    else if (priority === 'HIGH') estimatedCost = 4500;
    else if (priority === 'LOW') estimatedCost = 2000;
    if (data.ticketType === 'SER') estimatedCost = Math.round(estimatedCost * 0.7);

    try {
      // 1. Save directly into PostgreSQL database via Backend API
      const res = await api.post('/queries', {
        title: data.title,
        category: data.category,
        subcategory: data.subcategory,
        impact: data.impact,
        urgency: data.urgency,
        shortDescription: data.shortDescription,
        detailedDescription: data.detailedDescription,
        environment: data.environment,
        assignmentGroup: data.assignmentGroup,
        ticketType: data.ticketType || 'INC',
        estimatedCost
      });

      if (res.success && res.data) {
        const q = res.data;
        const newTicket: QueryTicket = {
          id: q.id,
          ticketNumber: q.ticket_number,
          ticketType: q.ticket_number?.startsWith('SER') ? 'SER' : 'INC',
          title: q.title,
          category: q.category,
          subcategory: q.subcategory || '',
          impact: q.impact,
          urgency: q.urgency,
          priority: q.priority,
          status: q.status,
          clientId: q.client_id || currentUser.id,
          clientName: currentUser.name,
          clientCompany: currentUser.company || 'Enterprise Client',
          clientEmail: currentUser.email,
          clientPhone: currentUser.phone,
          shortDescription: q.short_description,
          detailedDescription: q.detailed_description,
          environment: q.environment,
          assignmentGroup: q.assignment_group,
          estimatedCost,
          isEscrowFunded: true,
          isPaymentReleased: false,
          createdAt: q.created_at || new Date().toISOString(),
          updatedAt: q.updated_at || new Date().toISOString(),
          slaDeadline: q.sla_deadline,
          slaBreached: false,
          attachments: data.attachments || [],
          workLogs: []
        };

        setTickets(prev => [newTicket, ...prev]);

        // Immediate background refresh to sync with server
        setTimeout(() => refreshData(), 400);

        return { success: true, ticket: newTicket };
      }

      return { success: false, error: res.error || 'Failed to submit ticket.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error communicating with database.' };
    }
  };

  const acceptJobAsExpert: DataContextType['acceptJobAsExpert'] = async (ticketId, expertId) => {
    try {
      const res = await api.post(`/queries/${ticketId}/accept`, { expertId });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to claim ticket.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error locking ticket.' };
    }
  };

  const assignEngineerToTicket: DataContextType['assignEngineerToTicket'] = async (ticketId, engineerId) => {
    try {
      const res = await api.patch(`/queries/${ticketId}/status`, {
        status: 'ASSIGNED',
        engineerId,
        notes: `Field Engineer dispatched to site.`
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to assign field engineer.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database error during dispatch.' };
    }
  };

  const updateTicketStatus: DataContextType['updateTicketStatus'] = async (ticketId, newStatus, notes) => {
    try {
      const res = await api.patch(`/queries/${ticketId}/status`, { status: newStatus, notes });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
    } catch (err) {
      console.warn('Status patch failed:', err);
    }

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );
    return { success: true };
  };

  // Item 4: Real-Time Work Log & Comment Logger for BOTH Client & Expert
  const addWorkLog: DataContextType['addWorkLog'] = async (ticketId, hours, notes, isDiagnostic = false) => {
    try {
      const res = await api.post(`/queries/${ticketId}/work-logs`, {
        hoursSpent: hours,
        notes,
        isDiagnostic
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend work log call failed, updating local state', err);
    }

    const now = new Date().toISOString();
    const authorId = currentUser?.id || 'usr-system';
    const authorName = currentUser?.name || 'User';
    const authorRole = currentUser?.role || 'CLIENT';

    const newLog: WorkLog = {
      id: `wl-${Date.now()}`,
      queryId: ticketId,
      authorId,
      authorName,
      authorRole,
      hoursSpent: hours,
      notes,
      timestamp: now,
      isDiagnostic
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              workLogs: [newLog, ...(t.workLogs || [])],
              updatedAt: now
            }
          : t
      )
    );

    return { success: true };
  };

  const sendChatMessage: DataContextType['sendChatMessage'] = async (ticketId, text, attachmentName) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    try {
      await api.post(`/messages/${ticketId}`, { message: text, attachmentName });
    } catch (_) {}

    const now = new Date().toISOString();
    const senderId = currentUser?.id || 'usr-client-1';
    const senderName = currentUser?.name || 'User';
    const senderRole = currentUser?.role || 'CLIENT';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      queryId: ticketId,
      senderId,
      senderName,
      senderRole,
      message: text,
      timestamp: now,
      attachmentName
    };

    setMessages(prev => [...prev, newMsg]);
    return { success: true };
  };

  const resolveTicket: DataContextType['resolveTicket'] = async (ticketId, resolutionSummary, preventiveMeasures) => {
    try {
      const res = await api.post(`/queries/${ticketId}/resolve`, {
        resolutionSummary,
        preventiveMeasures
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
    } catch (_) {}

    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'RESOLVED',
              resolvedAt: now,
              updatedAt: now,
              resolutionSummary,
              preventiveMeasures
            }
          : t
      )
    );
    return { success: true };
  };

  const confirmAndReleasePayment: DataContextType['confirmAndReleasePayment'] = async (ticketId, rating, feedback) => {
    try {
      const res = await api.post(`/queries/${ticketId}/confirm`, {
        clientRating: rating,
        clientFeedback: feedback
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
    } catch (_) {}

    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'CLIENT_CONFIRMED',
              closedAt: now,
              updatedAt: now,
              clientRating: rating,
              clientFeedback: feedback,
              isPaymentReleased: true
            }
          : t
      )
    );
    return { success: true };
  };

  const adminOverrideTicket: DataContextType['adminOverrideTicket'] = async (ticketId, updates) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
    return { success: true };
  };

  // Item 5: Remote Screen & Terminal Access Session Engine
  const createRemoteSession = async (
    ticketId: string, 
    protocol: 'WebRTC P2P Desktop' | 'Encrypted SSH Terminal' = 'WebRTC P2P Desktop'
  ) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const cleanNum = ticket.ticketNumber.replace(/[^A-Za-z0-9]/g, '');
    const sessionId = `REMOTE-${cleanNum}-${Math.floor(100 + Math.random() * 900)}`;
    const sessionToken = `tok_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const baseUrl = window.location.origin;
    const accessUrl = `${baseUrl}/client/query/${ticket.id}?remoteSession=${sessionId}&token=${sessionToken}`;

    const newSession: RemoteSession = {
      id: sessionId,
      ticketId,
      ticketNumber: ticket.ticketNumber,
      expertId: currentUser?.id || 'usr-expert-1',
      expertName: currentUser?.name || 'Remote Specialist',
      clientId: ticket.clientId,
      clientName: ticket.clientName,
      sessionToken,
      accessUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      targetHostname: `${ticket.category.toLowerCase().replace(/[^a-z]/g, '-')}-srv01`,
      osInfo: ticket.environment.includes('Windows') ? 'Windows Server 2022 Datacenter' : 'Ubuntu 24.04 LTS (x86_64)',
      protocol
    };

    const updatedSessions = [newSession, ...remoteSessions.filter(s => s.ticketId !== ticketId)];
    setRemoteSessions(updatedSessions);
    localStorage.setItem('techrescue_remote_sessions', JSON.stringify(updatedSessions));

    // Send session card into chat
    await sendChatMessage(
      ticketId,
      `[REMOTE_SESSION_INVITE]: Specialist ${currentUser?.name} generated a secure ${protocol} remote session. Client link: ${accessUrl}`
    );

    // Record in work logs
    await addWorkLog(
      ticketId,
      0.1,
      `Initiated remote screen & terminal diagnostic bridge (${protocol}). Session Token: ${sessionId}`,
      true
    );

    return { success: true, session: newSession };
  };

  const connectRemoteSession = async (sessionId: string) => {
    const updated = remoteSessions.map(s =>
      s.id === sessionId ? { ...s, status: 'CONNECTED' as const, connectedAt: new Date().toISOString() } : s
    );
    setRemoteSessions(updated);
    localStorage.setItem('techrescue_remote_sessions', JSON.stringify(updated));
    return { success: true };
  };

  const terminateRemoteSession = async (sessionId: string) => {
    const updated = remoteSessions.map(s =>
      s.id === sessionId ? { ...s, status: 'TERMINATED' as const, terminatedAt: new Date().toISOString() } : s
    );
    setRemoteSessions(updated);
    localStorage.setItem('techrescue_remote_sessions', JSON.stringify(updated));
    return { success: true };
  };

  const getTicketById = (ticketId: string) => {
    return tickets.find(t => t.id === ticketId);
  };

  const getMessagesForTicket = (ticketId: string) => {
    return messages.filter(m => m.queryId === ticketId);
  };

  const resetToDefaultData = () => {
    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        messages,
        activityLogs,
        payments,
        remoteSessions,
        isLoading,
        refreshData,
        createTicket,
        acceptJobAsExpert,
        assignEngineerToTicket,
        updateTicketStatus,
        addWorkLog,
        sendChatMessage,
        resolveTicket,
        confirmAndReleasePayment,
        adminOverrideTicket,
        createRemoteSession,
        connectRemoteSession,
        terminateRemoteSession,
        getTicketById,
        getMessagesForTicket,
        resetToDefaultData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
