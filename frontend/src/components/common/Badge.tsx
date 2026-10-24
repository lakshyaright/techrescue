import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  // Respecting zero-pill discipline: Clean, refined typographic indicators with subtle status markers
  const config: Record<TicketStatus, { label: string; textClass: string; dotClass: string }> = {
    OPEN: {
      label: 'Open',
      textClass: 'text-amber-700',
      dotClass: 'bg-amber-500'
    },
    ASSIGNED: {
      label: 'Assigned',
      textClass: 'text-blue-700',
      dotClass: 'bg-blue-500'
    },
    IN_PROGRESS: {
      label: 'In Progress',
      textClass: 'text-sky-700',
      dotClass: 'bg-sky-500 animate-pulse'
    },
    TRAVELING: {
      label: 'Traveling',
      textClass: 'text-indigo-700',
      dotClass: 'bg-indigo-500 animate-pulse'
    },
    ON_SITE: {
      label: 'On-Site',
      textClass: 'text-purple-700',
      dotClass: 'bg-purple-500'
    },
    WAITING_FOR_CLIENT: {
      label: 'Waiting Client',
      textClass: 'text-orange-700',
      dotClass: 'bg-orange-500'
    },
    RESOLVED: {
      label: 'Resolved',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-500'
    },
    CLIENT_CONFIRMED: {
      label: 'Confirmed',
      textClass: 'text-teal-700',
      dotClass: 'bg-teal-500'
    },
    CLOSED: {
      label: 'Closed',
      textClass: 'text-slate-600',
      dotClass: 'bg-slate-400'
    }
  };

  const current = config[status] || {
    label: status,
    textClass: 'text-slate-600',
    dotClass: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${
        size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
      } ${current.textClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass}`} aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config: Record<TicketPriority, { label: string; textClass: string; icon: string }> = {
    CRITICAL: {
      label: 'Critical',
      textClass: 'text-rose-700 font-semibold',
      icon: '▲▲'
    },
    HIGH: {
      label: 'High',
      textClass: 'text-amber-700 font-medium',
      icon: '▲'
    },
    MEDIUM: {
      label: 'Medium',
      textClass: 'text-slate-700 font-normal',
      icon: '■'
    },
    LOW: {
      label: 'Low',
      textClass: 'text-slate-500 font-normal',
      icon: '▼'
    }
  };

  const item = config[priority] || config.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap tabular-nums ${
        size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
      } ${item.textClass}`}
    >
      <span className="text-[10px]" aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
};
