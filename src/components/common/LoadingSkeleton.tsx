import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  /** Number of rows to stack. */
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)} aria-label="Loading" role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-elevated animate-pulse rounded"
          style={{ height: 14 + ((i * 7) % 10), opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}
