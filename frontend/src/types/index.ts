export type UserRole = 'CLIENT' | 'EXPERT' | 'ENGINEER' | 'ADMIN';

export type TicketStatus = 
  | 'OPEN' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'TRAVELING' 
  | 'ON_SITE' 
  | 'WAITING_FOR_CLIENT' 
  | 'RESOLVED' 
  | 'CLIENT_CONFIRMED' 
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketCategory = 
  | 'Cloud Infrastructure' 
  | 'Network & Firewall' 
  | 'Security & Compliance' 
  | 'Hardware & Servers' 
  | 'Software & DevOps' 
  | 'Datacenter & Storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  phone?: string;
  location?: string;
  title?: string;
  rating?: number;
  reviewsCount?: number;
  hourlyRate?: number;
  skills?: string[];
  experienceYears?: number;
  bio?: string;
  certifications?: string[];
  verified?: boolean;
  isAvailable?: boolean;
  completedJobsCount?: number;
  totalEarnings?: number;
}

export interface ActivityLog {
  id: string;
  queryId?: string;
  ticketNumber?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  type: 'status_change' | 'assignment' | 'comment' | 'payment' | 'escalation' | 'resolution';
}

export interface WorkLog {
  id: string;
  queryId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  hoursSpent: number;
  notes: string;
  timestamp: string;
  isDiagnostic?: boolean;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  queryId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  isInternalNote?: boolean;
  attachmentName?: string;
}

export interface QueryTicket {
  id: string;
  ticketNumber: string; // INC-20261008-0001
  title: string;
  category: TicketCategory;
  subcategory: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'ENTERPRISE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  priority: TicketPriority;
  status: TicketStatus;
  
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone?: string;

  assignedExpertId?: string;
  assignedExpertName?: string;
  assignedExpertRate?: number;

  assignedEngineerId?: string;
  assignedEngineerName?: string;
  engineerLocation?: string;

  shortDescription: string;
  detailedDescription: string;
  environment: 'Azure Cloud' | 'AWS' | 'Hybrid Cloud' | 'On-Premises Datacenter' | 'Corporate Office LAN';
  assignmentGroup: 'Cloud Operations' | 'Core Networking' | 'Information Security' | 'Desktop & Hardware Engineering';
  
  estimatedCost: number;
  actualCost?: number;
  isEscrowFunded: boolean;
  isPaymentReleased: boolean;
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  
  slaDeadline: string; // ISO String
  slaBreached: boolean;

  attachments: TicketAttachment[];
  workLogs: WorkLog[];
  resolutionSummary?: string;
  preventiveMeasures?: string;
  clientRating?: number;
  clientFeedback?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'ticket' | 'payment' | 'assignment' | 'alert';
  linkTo?: string;
}

export interface PaymentTransaction {
  id: string;
  ticketId: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  payeeId: string;
  payeeName: string;
  payeeRole: 'EXPERT' | 'ENGINEER';
  amount: number;
  platformFee: number;
  netPayout: number;
  status: 'ESCROW_HELD' | 'RELEASED' | 'REFUNDED';
  date: string;
  invoiceNumber: string;
}
