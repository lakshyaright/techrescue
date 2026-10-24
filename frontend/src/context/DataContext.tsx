import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  QueryTicket, 
  ChatMessage, 
  ActivityLog, 
  PaymentTransaction, 
  TicketStatus, 
  TicketPriority, 
  WorkLog,
} from '../types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { api } from '../services/api';

interface DataContextType {
  tickets: QueryTicket[];
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  payments: PaymentTransaction[];
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all live records from the database
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch queries from PostgreSQL
      const qRes = await api.get('/queries');
      if (qRes.success && Array.isArray(qRes.data)) {
        const liveTickets: QueryTicket[] = qRes.data.map((q: any) => ({
          id: q.id,
          ticketNumber: q.ticket_number,
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
          workLogs: q.workLogs || []
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

  useEffect(() => {
    refreshData();
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
        estimatedCost
      });

      if (res.success && res.data) {
        const q = res.data;
        const newTicket: QueryTicket = {
          id: q.id,
          ticketNumber: q.ticket_number,
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
          estimatedCost: parseFloat(q.estimated_cost),
          isEscrowFunded: Boolean(q.is_escrow_funded),
          isPaymentReleased: false,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          slaDeadline: q.sla_deadline,
          slaBreached: false,
          attachments: data.attachments || [],
          workLogs: []
        };

        setTickets(prev => [newTicket, ...prev]);

        // Add to activity logs
        setActivityLogs(prev => [
          {
            id: `act-${Date.now()}`,
            queryId: newTicket.id,
            ticketNumber: newTicket.ticketNumber,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: 'Query Created',
            details: `New ticket ${newTicket.ticketNumber} created in database with priority ${newTicket.priority}. Escrow ₹${estimatedCost.toLocaleString()} held.`,
            timestamp: newTicket.createdAt,
            type: 'status_change'
          },
          ...prev
        ]);

        return { success: true, ticket: newTicket };
      }

      return { success: false, error: res.error || 'Failed to create ticket in database.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database error occurred while creating ticket.' };
    }
  };

  const acceptJobAsExpert: DataContextType['acceptJobAsExpert'] = async (ticketId, expertId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found.' };

    if (ticket.status !== 'OPEN') {
      return { 
        success: false, 
        error: `Ticket ${ticket.ticketNumber} is not open for claim (Status: ${ticket.status}).` 
      };
    }

    const expert = users.find(u => u.id === expertId);
    if (!expert) return { success: false, error: 'Expert profile not found.' };

    try {
      // Execute PostgreSQL transaction row lock via Backend API
      const res = await api.post(`/queries/${ticket.id}/accept`, {});
      if (res.success) {
        const now = new Date().toISOString();
        setTickets(prev =>
          prev.map(t =>
            t.id === ticketId
              ? {
                  ...t,
                  status: 'IN_PROGRESS',
                  assignedExpertId: expert.id,
                  assignedExpertName: expert.name,
                  assignedExpertRate: expert.hourlyRate || 1500,
                  updatedAt: now
                }
              : t
          )
        );

        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to claim ticket.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const assignEngineerToTicket: DataContextType['assignEngineerToTicket'] = async (ticketId, engineerId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const engineer = users.find(u => u.id === engineerId);
    if (!engineer) return { success: false, error: 'Engineer not found' };

    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              assignedEngineerId: engineer.id,
              assignedEngineerName: engineer.name,
              engineerLocation: engineer.location,
              status: t.status === 'OPEN' ? 'ASSIGNED' : t.status,
              updatedAt: now
            }
          : t
      )
    );

    return { success: true };
  };

  const updateTicketStatus: DataContextType['updateTicketStatus'] = async (ticketId, newStatus, notes) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();

    // Call backend API to persist status update in PostgreSQL
    api.patch(`/queries/${ticketId}/status`, { status: newStatus, notes }).catch(() => {});

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              updatedAt: now,
              ...(newStatus === 'RESOLVED' ? { resolvedAt: now } : {}),
              ...(newStatus === 'CLOSED' ? { closedAt: now } : {})
            }
          : t
      )
    );

    return { success: true };
  };

  const addWorkLog: DataContextType['addWorkLog'] = async (ticketId, hours, notes, isDiagnostic = false) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();
    const authorId = currentUser?.id || 'usr-system';
    const authorName = currentUser?.name || 'Specialist';
    const authorRole = currentUser?.role || 'EXPERT';

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
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

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
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

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

    setPayments(prev =>
      prev.map(p =>
        p.ticketId === ticketId
          ? { ...p, status: 'RELEASED', date: now }
          : p
      )
    );

    return { success: true };
  };

  const adminOverrideTicket: DataContextType['adminOverrideTicket'] = async (ticketId, updates) => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, ...updates, updatedAt: now } : t))
    );
    return { success: true };
  };

  const getTicketById = (ticketId: string) => tickets.find(t => t.id === ticketId);
  const getMessagesForTicket = (ticketId: string) => messages.filter(m => m.queryId === ticketId);
  const resetToDefaultData = () => { refreshData(); };

  return (
    <DataContext.Provider
      value={{
        tickets,
        messages,
        activityLogs,
        payments,
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
