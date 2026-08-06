import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, Surface, SurfaceHeader, controlClass, primaryButton, secondaryButton } from '@/components/common/OperationalPage';

export function DatasetLibraryPage() {
  return (
    <>
      <PageHeader title="Dataset Library" description="Manage approved historical and imported research datasets." />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Registered datasets" value="0" detail="No dataset metadata loaded" />
        <MetricCard label="Validated rows" value="—" detail="Awaiting first import" tone="info" />
        <MetricCard label="Symbol coverage" value="—" detail="No verified universe" />
        <MetricCard label="Freshness" value="Not available" detail="No source timestamp" tone="warn" />
      </div>

      <Surface className="mt-4">
        <SurfaceHeader
          title="Dataset registry"
          description="Only validated, locally registered datasets appear here. No sample rows are shown."
          action={<Link className={primaryButton} to="/app/data/import">Import dataset</Link>}
        />
        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-5 py-3">
          <input disabled className={`${controlClass} min-w-56 flex-1 cursor-not-allowed opacity-60`} placeholder="Search dataset or symbol" aria-label="Search datasets" title="Unavailable until the dataset registry API is connected" />
          <select disabled className={`${controlClass} cursor-not-allowed opacity-60`} defaultValue="all" aria-label="Filter dataset sources"><option value="all">All sources</option></select>
          <select disabled className={`${controlClass} cursor-not-allowed opacity-60`} defaultValue="all" aria-label="Filter dataset timeframes"><option value="all">All timeframes</option></select>
          <button disabled aria-disabled="true" title="Unavailable until the dataset registry API is connected" className={`${secondaryButton} cursor-not-allowed opacity-60`}>Clear filters</button>
        </div>
        <EmptyState
          title="No datasets registered"
          description="Import a historical OHLCV file, validate its schema, and approve it before it becomes available to backtests or research workflows."
          action={<Link className={primaryButton} to="/app/data/import">Open Dataset Import</Link>}
        />
      </Surface>
    </>
  );
}
