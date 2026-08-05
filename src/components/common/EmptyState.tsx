import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center"
      role="status"
    >
      <div className="text-muted-app mb-1">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <p className="text-secondary-app text-sm font-medium">{title}</p>
      {description && <p className="text-muted-app max-w-sm text-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
