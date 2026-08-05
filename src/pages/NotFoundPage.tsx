import { Compass, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

/**
 * Rendered inside the AppShell for any `/app/*` path that does not match an
 * approved route. Shows the requested path and a return-to-dashboard action.
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <PageHeader title="Page not found" />
      <div
        className="bg-surface border-app flex flex-col items-center justify-center gap-4 rounded-lg border px-6 py-16 text-center"
        role="alert"
      >
        <Compass className="text-[var(--simulation)] h-10 w-10" aria-hidden />
        <div className="max-w-md">
          <p className="text-primary-app text-sm font-medium">
            This route is not part of the approved navigation.
          </p>
          <p className="text-muted-app mt-1 font-mono text-xs">
            Requested path: {location.pathname}
          </p>
          <p className="text-muted-app mt-2 text-xs">
            The page you requested does not exist in this build. Return to the
            Dashboard to continue.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/dashboard')}
          className="border-app text-secondary-app hover:text-primary-app hover:bg-hover-surface"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Dashboard
        </Button>
      </div>
    </>
  );
}
