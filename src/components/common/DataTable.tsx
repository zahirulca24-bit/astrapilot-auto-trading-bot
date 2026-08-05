import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import type { LoadingState } from '@/types/domain';

export interface Column<T> {
  key: string;
  header: string;
  /** Render a cell for the given row. */
  cell: (row: T) => ReactNode;
  className?: string;
  /** Right-align numeric columns. */
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  state: LoadingState;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  /** Render a custom mobile card per row. */
  mobileCard?: (row: T) => ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  state,
  error,
  emptyTitle = 'No records',
  emptyDescription,
  onRowClick,
  mobileCard,
  onRetry,
  className,
}: DataTableProps<T>) {
  if (state === 'loading') {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (state === 'error') {
    return <ErrorState message={error ?? undefined} onRetry={onRetry} />;
  }

  if (state === 'empty' || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      {/* Desktop: dense table */}
      <div className={cn('hidden overflow-x-auto md:block', className)}>
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b border-app">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'text-muted-app h-9 px-3 text-left align-middle text-[11px] font-medium uppercase tracking-wide',
                    c.align === 'right' && 'text-right',
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-app transition-colors',
                  onRowClick &&
                    'cursor-pointer hover:bg-hover-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--simulation)]',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-2 align-middle text-secondary-app',
                      c.align === 'right' && 'text-right font-mono',
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      {mobileCard ? (
        <div className="space-y-2 md:hidden">
          {rows.map((row) => (
            <div
              key={rowKey(row)}
              className="bg-surface border-app rounded-lg border p-3"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {mobileCard(row)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 md:hidden">
          {rows.map((row) => (
            <div key={rowKey(row)} className="bg-surface border-app rounded-lg border p-3">
              {columns.map((c) => (
                <div key={c.key} className="flex items-center justify-between py-0.5 text-sm">
                  <span className="text-muted-app text-[11px] uppercase tracking-wide">
                    {c.header}
                  </span>
                  <span className="text-secondary-app font-mono">{c.cell(row)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
