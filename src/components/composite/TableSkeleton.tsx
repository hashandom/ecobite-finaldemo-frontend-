import React from 'react';

export const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`th-${i}`} className="h-4 w-24 bg-border rounded animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`tr-${r}`} className="flex items-center justify-between px-6 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={`td-${r}-${c}`} className="h-4 w-20 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
