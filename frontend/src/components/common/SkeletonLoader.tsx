import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3.5 px-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
              <div className="h-3 bg-slate-100 rounded-sm w-1/2" />
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded-sm w-24 hidden md:block" />
          <div className="h-4 bg-slate-200 rounded-sm w-20" />
          <div className="h-4 bg-slate-200 rounded-sm w-16" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
          <div className="h-8 bg-slate-200 rounded-sm w-2/3" />
          <div className="h-3 bg-slate-100 rounded-sm w-1/2" />
        </div>
      ))}
    </div>
  );
};
