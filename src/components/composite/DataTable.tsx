import React, { ReactNode } from 'react';
import { TableSkeleton } from './TableSkeleton';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  data?: any[];
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  onSort?: (key: string) => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' };
}

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  empty,
  onRowClick,
  rowClassName,
  pagination,
  onSort,
  sortConfig,
}: DataTableProps) => {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (data.length === 0 && empty) {
    return (
      <div className="w-full border border-border/80 rounded-2xl bg-card shadow-sm overflow-hidden p-8">
        {empty}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted sticky top-0 z-10 ${col.width || ''}`}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1.5 hover:text-text focus:outline-none cursor-pointer group transition-colors"
                      onClick={() => onSort?.(col.key)}
                    >
                      {col.label}
                      <span className="text-muted/40 group-hover:text-primary transition-colors flex items-center justify-center">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'desc' ? (
                            <ChevronDown size={14} strokeWidth={2.5} className="text-primary" />
                          ) : (
                            <ChevronUp size={14} strokeWidth={2.5} className="text-primary" />
                          )
                        ) : (
                          <ChevronUp size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-200 group bg-card hover:bg-surface/50 ${onRowClick ? 'cursor-pointer hover:shadow-[inset_3px_0_0_0_var(--color-primary)]' : ''
                  } ${rowClassName ? rowClassName(row) : ''}`}
              >
                {columns.map((col: Column) => (
                  <td key={`${row.id || i}-${col.key}`} className="px-6 py-4 text-sm text-text align-middle">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-card gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted">
              Showing <span className="font-medium text-text">{Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}</span> to <span className="font-medium text-text">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of <span className="font-medium text-text">{pagination.total}</span> results
            </p>
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="text-sm border border-border/80 rounded-lg bg-surface text-text px-2 py-1 focus:outline-none focus:border-primary/80 cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => pagination.onChange(pagination.page - 1)}
              className="rounded-lg shadow-sm hover:bg-slate-50 cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.page + 1)}
              className="rounded-lg shadow-sm hover:bg-slate-50 cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
