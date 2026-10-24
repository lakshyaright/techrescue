import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { QueryTicket } from '../../types';

interface DailyTrendProps {
  tickets?: QueryTicket[];
}

export const DailyTrendChart: React.FC<DailyTrendProps> = ({ tickets: propsTickets }) => {
  const { tickets: contextTickets } = useData();
  const tickets = propsTickets || contextTickets;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute live 7-day trajectory dynamically from database records
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isoPrefix: d.toISOString().slice(0, 10)
    };
  });

  const data = dates.map(day => {
    const queries = tickets.filter(t => t.createdAt && t.createdAt.startsWith(day.isoPrefix)).length;
    const resolved = tickets.filter(t => 
      ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(t.status) &&
      (t.resolvedAt ? t.resolvedAt.startsWith(day.isoPrefix) : t.updatedAt?.startsWith(day.isoPrefix))
    ).length;

    return {
      date: day.label,
      queries,
      resolved
    };
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.queries, d.resolved)), 5);
  
  const width = 500;
  const height = 180;
  const padX = 35;
  const padY = 25;
  
  const stepX = (width - padX * 2) / (data.length - 1);
  const scaleY = (val: number) => height - padY - ((val / maxVal) * (height - padY * 2));

  // Compute SVG polyline points
  const queriesPoints = data.map((d, i) => `${padX + i * stepX},${scaleY(d.queries)}`).join(' ');
  const resolvedPoints = data.map((d, i) => `${padX + i * stepX},${scaleY(d.resolved)}`).join(' ');

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
            <span className="text-slate-600 font-medium">Live Queries Influx</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">Live Resolved</span>
          </div>
        </div>
        {hoveredIdx !== null ? (
          <div className="font-mono text-slate-700 tabular-nums">
            {data[hoveredIdx].date}: <strong className="text-blue-600">{data[hoveredIdx].queries}</strong> raised · <strong className="text-emerald-600">{data[hoveredIdx].resolved}</strong> resolved
          </div>
        ) : (
          <div className="text-[11px] font-mono text-slate-400">
            Total DB Incidents: {tickets.length}
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - padY - pct * (height - padY * 2);
          const val = Math.round(pct * maxVal);
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                {val}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={queriesPoints} strokeLinecap="round" strokeLinejoin="round" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={resolvedPoints} strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Data points */}
        {data.map((d, i) => {
          const x = padX + i * stepX;
          const yQ = scaleY(d.queries);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle cx={x} cy={yQ} r={isHovered ? 5 : 3.5} fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <text x={x} y={height - 6} textAnchor="middle" className={`text-[10px] font-mono ${isHovered ? 'fill-blue-600 font-semibold' : 'fill-slate-500'}`}>
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const CategoryBreakdownChart: React.FC<{ tickets?: QueryTicket[] }> = ({ tickets: propsTickets }) => {
  const { tickets: contextTickets } = useData();
  const tickets = propsTickets || contextTickets;

  if (tickets.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-600 mb-1">No category data in database</p>
        <p className="text-[11px]">Breakdown renders automatically when queries are raised.</p>
      </div>
    );
  }

  // Group tickets by category dynamically from PostgreSQL
  const categoryCounts: Record<string, number> = {};
  tickets.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const colors = [
    'bg-blue-600',
    'bg-sky-500',
    'bg-indigo-600',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500'
  ];

  const categories = Object.entries(categoryCounts).map(([name, count], index) => ({
    name,
    count,
    percentage: Math.round((count / tickets.length) * 100),
    color: colors[index % colors.length]
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3.5">
      {categories.map((cat, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 truncate pr-2">{cat.name}</span>
            <span className="font-mono text-slate-500 tabular-nums shrink-0">
              {cat.count} ({cat.percentage}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${cat.color} rounded-full transition-all duration-500`}
              style={{ width: `${cat.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ResolutionSlaMetrics: React.FC<{ tickets?: QueryTicket[] }> = ({ tickets: propsTickets }) => {
  const { tickets: contextTickets } = useData();
  const tickets = propsTickets || contextTickets;

  const tiers: { tier: string; priority: QueryTicket['priority']; target: string; targetHours: number }[] = [
    { tier: 'P1 - Critical', priority: 'CRITICAL', target: '2.0 hrs', targetHours: 2 },
    { tier: 'P2 - High', priority: 'HIGH', target: '4.0 hrs', targetHours: 4 },
    { tier: 'P3 - Medium', priority: 'MEDIUM', target: '12.0 hrs', targetHours: 12 },
    { tier: 'P4 - Low', priority: 'LOW', target: '24.0 hrs', targetHours: 24 }
  ];

  const metrics = tiers.map(t => {
    const tierTickets = tickets.filter(ticket => ticket.priority === t.priority);
    const resolvedTierTickets = tierTickets.filter(ticket => 
      ['RESOLVED', 'CLIENT_CONFIRMED', 'CLOSED'].includes(ticket.status)
    );

    let adherence = 100;
    let mttrText = '—';

    if (tierTickets.length > 0) {
      const breachedCount = tierTickets.filter(ticket => ticket.slaBreached).length;
      adherence = Math.round(((tierTickets.length - breachedCount) / tierTickets.length) * 100);
    }

    if (resolvedTierTickets.length > 0) {
      let totalHours = 0;
      resolvedTierTickets.forEach(rt => {
        const start = new Date(rt.createdAt).getTime();
        const end = rt.resolvedAt ? new Date(rt.resolvedAt).getTime() : new Date(rt.updatedAt).getTime();
        const diffHours = Math.max(0.1, (end - start) / 3600000);
        totalHours += diffHours;
      });
      const avgHours = totalHours / resolvedTierTickets.length;
      mttrText = `${avgHours.toFixed(1)} hrs`;
    } else if (tierTickets.length > 0) {
      mttrText = `In Triage (${tierTickets.length})`;
    }

    return {
      tier: t.tier,
      mttr: mttrText,
      target: t.target,
      adherence,
      status: adherence >= 95 ? 'text-emerald-600' : adherence >= 80 ? 'text-amber-600' : 'text-rose-600',
      totalCount: tierTickets.length
    };
  });

  return (
    <div className="divide-y divide-slate-100 text-xs">
      <div className="grid grid-cols-4 py-2 font-medium text-slate-500 uppercase tracking-wider text-[10px]">
        <span>Severity</span>
        <span className="text-right">Live MTTR</span>
        <span className="text-right">SLA Target</span>
        <span className="text-right">Compliance</span>
      </div>
      {metrics.map((m, i) => (
        <div key={i} className="grid grid-cols-4 py-2.5 items-center">
          <span className="font-medium text-slate-800">{m.tier}</span>
          <span className="font-mono text-slate-600 text-right tabular-nums">{m.mttr}</span>
          <span className="font-mono text-slate-400 text-right tabular-nums">{m.target}</span>
          <span className={`font-mono font-medium text-right tabular-nums ${m.status}`}>
            {m.totalCount === 0 ? '100%' : `${m.adherence}%`}
          </span>
        </div>
      ))}
    </div>
  );
};
