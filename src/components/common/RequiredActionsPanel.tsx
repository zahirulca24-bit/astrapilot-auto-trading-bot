import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SeverityBadge } from './StatusBadge';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import type { LoadingState, RequiredAction } from '@/types/domain';

const severityBorder: Record<RequiredAction['severity'], string> = {
  critical: 'border-l-[var(--critical)]',
  warning: 'border-l-[var(--warning)]',
  info: 'border-l-[var(--simulation)]',
};

interface RequiredActionsPanelProps {
  actions: RequiredAction[];
  state: LoadingState;
  error?: string | null;
  onRetry?: () => void;
}

export function RequiredActionsPanel({ actions, state, error, onRetry }: RequiredActionsPanelProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Required actions"
      className="bg-surface border-app flex flex-col rounded-lg border"
    >
      <header className="border-app flex items-center justify-between border-b px-4 py-2.5">
        <h2 className="text-primary-app text-sm font-semibold">Required Actions</h2>
        <span className="text-muted-app text-[11px]">{actions.length} items</span>
      </header>

      <div className="flex-1">
        {state === 'loading' && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        {state === 'error' && <ErrorState message={error ?? undefined} onRetry={onRetry} />}
        {state === 'empty' && <EmptyState title="No required actions" />}
        {state === 'success' && actions.length === 0 && (
          <EmptyState title="No required actions" description="Everything looks healthy." />
        )}
        {state === 'success' && actions.length > 0 && (
          <ul className="divide-y divide-[var(--border-base)]">
            {actions.map((a) => (
              <li
                key={a.id}
                className={cn(
                  'border-l-2 px-4 py-2.5 transition-colors hover:bg-hover-surface',
                  severityBorder[a.severity],
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-muted-app font-mono text-[10px]">{a.timestamp}</span>
                    </div>
                    <p className="text-primary-app mt-1 truncate text-sm font-medium">{a.title}</p>
                    <p className="text-secondary-app mt-0.5 text-xs">{a.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(a.detailsHref)}
                    aria-label={`Open details for ${a.title}`}
                    className="text-muted-app hover:text-primary-app focus-ring shrink-0 rounded-md p-1 transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
