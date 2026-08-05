import { AlertCircle, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load',
  message = 'Something went wrong while fetching this data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="text-[var(--critical)] mb-1 h-8 w-8" />
      <p className="text-secondary-app text-sm font-medium">{title}</p>
      <p className="text-muted-app max-w-sm text-xs">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-app text-secondary-app hover:text-primary-app hover:bg-hover-surface mt-2"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
