import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  PlusCircle, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Users, 
  Wrench,
  AlertCircle,
  Search,
  RotateCcw,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ExternalLink,
  MessageSquare,
  CreditCard,
  FileText
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { DailyTrendChart, CategoryBreakdownChart } from '../../components/charts/AnalyticsCharts';

export const ClientDashboard: React.FC = () => {
  const { currentUser, users, refreshUsers } = useAuth();
  const { tickets, activityLogs, payments, refreshData } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUsers(), refreshData()]);
    setIsRefreshing(false);
  };

  // Metrics
  const totalQueries = tickets.length;
  const openQueries = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressQueries = tickets.filter(t => ['IN_PROGRESS', 'ASSIGNED', 'TRAVELING', 'ON_SITE', 'WAITING_FOR_CLIENT'].includes(t.status)).length;
  const resolvedQueries = tickets.filter(t => ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status)).length;

  const criticalOpen = tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'CLOSED' && t.status !== 'RESOLVED');

  // Filtered queries list
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'OPEN' ? t.status === 'OPEN' :
      statusFilter === 'IN_PROGRESS' ? ['IN_PROGRESS', 'ASSIGNED', 'TRAVELING', 'ON_SITE', 'WAITING_FOR_CLIENT'].includes(t.status) :
      ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status);

    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const availableExperts = users.filter(u => u.role === 'EXPERT' && u.isAvailable).slice(0, 3);
  const activeEscrowTotal = payments
    .filter(p => p.status === 'ESCROW_HELD')
    .reduce((sum, p) => sum + p.amount, 0);

  // Active Critical Ticket for Spotlight Tracker
  const activeSpotlightTicket = tickets.find(t => ['IN_PROGRESS', 'ASSIGNED', 'TRAVELING', 'ON_SITE', 'OPEN'].includes(t.status));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Primary Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.company || 'Enterprise Infrastructure Console'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mission-critical incident escalation, SLA guarantee monitor, and specialist dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Reload from PostgreSQL"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            onClick={() => navigate('/client/experts')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Align Specialists
          </button>

          <button
            onClick={() => navigate('/client/raise-query')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Query</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner if P1/P2 Active */}
      {criticalOpen.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900">
                  {criticalOpen.length} High-Severity Incident{criticalOpen.length > 1 ? 's' : ''} in Progress
                </span>
                <span className="px-1.5 py-0.2 rounded-xs bg-rose-200 text-rose-800 text-[10px] font-mono font-bold">
                  SLA Active
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Priority Tier-1 specialist attention guaranteed. 15-minute response window active.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/client/query/${criticalOpen[0].id}`)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open Incident War Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Raised Queries</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalQueries}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded in database</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium">Awaiting Claim</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
            {openQueries}
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">Ready for specialist lock</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-medium">In Active Remediation</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
            {inProgressQueries}
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block">Live diagnostics & dispatch</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium">Escrow Protected</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            ₹{activeEscrowTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">100% Guaranteed until sign-off</span>
        </div>
      </div>

      {/* Active Incident Lifecycle Stepper (if an active ticket exists) */}
      {activeSpotlightTicket && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                  {activeSpotlightTicket.ticketNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {activeSpotlightTicket.title}
                </h3>
                <PriorityBadge priority={activeSpotlightTicket.priority} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Category: {activeSpotlightTicket.category} · Environment: {activeSpotlightTicket.environment}
              </p>
            </div>
            <button
              onClick={() => navigate(`/client/query/${activeSpotlightTicket.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <span>Manage Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-Step Visual Progress Bar */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-emerald-500 rounded-full" />
              <span className="font-semibold text-slate-900 block text-[11px]">1. Raised</span>
              <span className="text-[10px] text-slate-400 font-mono">Completed</span>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${activeSpotlightTicket.isEscrowFunded ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <span className="font-semibold text-slate-900 block text-[11px]">2. Escrow Funded</span>
              <span className="text-[10px] text-slate-400 font-mono">{activeSpotlightTicket.isEscrowFunded ? 'Verified' : 'Pending'}</span>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${activeSpotlightTicket.status !== 'OPEN' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-semibold text-slate-900 block text-[11px]">3. Specialist Lock</span>
              <span className="text-[10px] text-slate-400 font-mono">{activeSpotlightTicket.status !== 'OPEN' ? 'Engaged' : 'In Queue'}</span>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${['IN_PROGRESS', 'ON_SITE', 'TRAVELING', 'RESOLVED', 'CLIENT_CONFIRMED'].includes(activeSpotlightTicket.status) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <span className="font-semibold text-slate-900 block text-[11px]">4. Diagnostics & Fix</span>
              <span className="text-[10px] text-slate-400 font-mono">{activeSpotlightTicket.status}</span>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(activeSpotlightTicket.status) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <span className="font-semibold text-slate-900 block text-[11px]">5. Client Release</span>
              <span className="text-[10px] text-slate-400 font-mono">{activeSpotlightTicket.isPaymentReleased ? 'Released' : 'Escrow Vault'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Query Overview Chart & Categories (Live Calculated) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Query Resolution Velocity</h3>
              <p className="text-xs text-slate-500">Live operational volume across your account</p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">7-Day Real-Time</span>
          </div>
          <DailyTrendChart tickets={tickets} />
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Infrastructure Stack Breakdown</h3>
            <p className="text-xs text-slate-500">Categories reported in your environment</p>
          </div>
          <CategoryBreakdownChart tickets={tickets} />
        </div>
      </div>

      {/* Incident Management Filter Bar & Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'OPEN' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open ({openQueries})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'IN_PROGRESS' ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({inProgressQueries})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'RESOLVED' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolvedQueries})
            </button>
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket # or issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">P1 - Critical</option>
              <option value="HIGH">P2 - High</option>
              <option value="MEDIUM">P3 - Medium</option>
              <option value="LOW">P4 - Low</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Issue Title & Scope</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Estimated / Escrow</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600 mb-1">No tickets match the selected filters</p>
                    <p className="text-[11px]">Click "Raise Query" above to lodge a new incident ticket.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-semibold text-slate-900 block truncate">{t.title}</span>
                      <span className="text-[11px] text-slate-500 truncate block mt-0.5">{t.shortDescription}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="block font-medium">{t.category}</span>
                      <span className="text-[10px] text-slate-400">{t.environment}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      <div>₹{t.estimatedCost.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-emerald-600 font-sans block">
                        {t.isEscrowFunded ? '● Escrow Secured' : '○ Pending Deposit'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/client/query/${t.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Specialists Quick Match & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Available Specialists */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Vetted Remote Specialists Available</h3>
            </div>
            <button
              onClick={() => navigate('/client/experts')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Browse All ({users.filter(u => u.role === 'EXPERT').length}) →
            </button>
          </div>

          <div className="space-y-3">
            {availableExperts.map((exp) => (
              <div key={exp.id} className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {exp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-xs">{exp.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">{exp.title || 'Principal Cloud Architect'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900 block">
                      {exp.hourlyRate ? `₹${exp.hourlyRate}/hr` : 'On-Demand'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Available Now</span>
                  </div>
                  <button
                    onClick={() => navigate('/client/experts')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                  >
                    Align
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Activity Timeline */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Live Incident Stream</h3>
            </div>
            <button
              onClick={() => navigate('/client/activity')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Full Stream →
            </button>
          </div>

          <div className="space-y-3.5">
            {activityLogs.slice(0, 4).map((act) => (
              <div key={act.id} className="text-xs relative pl-3.5 border-l-2 border-blue-500 space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-900">{act.userName}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{act.action}</p>
                <p className="text-slate-500 text-[11px] line-clamp-1">{act.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
