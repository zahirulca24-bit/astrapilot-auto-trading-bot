import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, Surface, SurfaceHeader, controlClass, primaryButton, secondaryButton } from '@/components/common/OperationalPage';
import { useApiResource } from '@/hooks/useApiResource';
import { api, backendBaseUrl } from '@/lib/api';

export function DatasetLibraryPage() {
  const backend = useApiResource(api.backendHealth, Boolean(backendBaseUrl));
  const backendReady = backend.data?.status === 'ok';

  return (
    <>
      <PageHeader
        title="Dataset Library"
        description={backend.state === 'loading' ? 'Checking backend availability…' : backendReady ? 'Backend online. Dataset registry contract is not implemented yet.' : 'Dataset registry unavailable; verified backend status is shown below.'}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Registered datasets" value="—" detail="Registry endpoint not available" />
        <MetricCard label="Validated rows" value="—" detail="Awaiting dataset registry API" tone="info" />
        <MetricCard label="Symbol coverage" value="—" detail="No verified registry response" />
        <MetricCard label="Backend" value={backend.data?.status ?? (backend.state === 'loading' ? 'Loading' : 'Unavailable')} detail={backend.error ?? backend.data?.service ?? 'Set VITE_BACKEND_API_URL'} tone={backendReady ? 'info' : 'warn'} />
      </div>

      <Surface className="mt-4">
        <SurfaceHeader
          title="Dataset registry"
          description="This page only displays records returned by the approved registry API. No sample rows are shown."
          action={<Link className={primaryButton} to="/app/data/import">Import dataset</Link>}
        />
        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-5 py-3">
          <input disabled className={`${controlClass} min-w-56 flex-1 cursor-not-allowed opacity-60`} placeholder="Search dataset or symbol" aria-label="Search datasets" title="Unavailable until the dataset registry API is connected" />
          <select disabled className={`${controlClass} cursor-not-allowed opacity-60`} defaultValue="all" aria-label="Filter dataset sources"><option value="all">All sources</option></select>
          <select disabled className={`${controlClass} cursor-not-allowed opacity-60`} defaultValue="all" aria-label="Filter dataset timeframes"><option value="all">All timeframes</option></select>
          <button disabled aria-disabled="true" title="Unavailable until the dataset registry API is connected" className={`${secondaryButton} cursor-not-allowed opacity-60`}>Clear filters</button>
        </div>
        <EmptyState
          title={backendReady ? 'Dataset registry endpoint not implemented' : 'Backend unavailable'}
          description={backend.error ?? 'The FastAPI health endpoint is integrated, but no approved dataset-list endpoint exists yet. The UI remains fail-closed instead of inventing records.'}
          action={<Link className={primaryButton} to="/app/data/import">Open Dataset Import</Link>}
        />
      </Surface>
    </>
  );
}
