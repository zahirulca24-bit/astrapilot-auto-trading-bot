import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

interface NotImplementedPageProps {
  /** Human-friendly page name, if known. */
  title?: string;
}

/**
 * Consistent placeholder for every sidebar route that is not part of the
 * current UI batch. All not-yet-implemented pages render this.
 */
export function NotImplementedPage({ title }: NotImplementedPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <PageHeader
        title={title ?? "Not implemented in current UI batch"}
        description="This page is part of the approved navigation but is not built yet."
      />
      <div
        className="bg-surface border-app flex flex-col items-center justify-center gap-4 rounded-lg border px-6 py-16 text-center"
        role="status"
      >
        <Construction className="text-[var(--simulation)] h-10 w-10" aria-hidden />
        <div className="max-w-md">
          <p className="text-primary-app text-sm font-medium">
            This section is not implemented in the current UI batch.
          </p>
          <p className="text-muted-app mt-1 font-mono text-xs">
            Route: {location.pathname}
          </p>
          <p className="text-muted-app mt-2 text-xs">
            Only the Dashboard is fully implemented in this build. All other
            approved navigation entries render this placeholder so routes stay
            consistent and reachable.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/dashboard')}
          className="border-app text-secondary-app hover:text-primary-app hover:bg-hover-surface"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Button>
      </div>
    </>
  );
}
