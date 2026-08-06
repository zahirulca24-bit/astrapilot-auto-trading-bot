import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, Surface, SurfaceHeader, primaryButton } from '@/components/common/OperationalPage';
import { useApiResource } from '@/hooks/useApiResource';
import { api, backendBaseUrl } from '@/lib/api';

export function DatasetLibraryPage() {
  const registry = useApiResource(api.datasetRegistry, Boolean(backendBaseUrl));
  const datasets = registry.data?.datasets ?? [];
  const validatedRows = datasets.reduce((total, dataset) => total + dataset.rowCount, 0);
  const symbols = datasets.reduce((total, dataset) => total + dataset.symbolCount, 0);

  return (
    <>
      <PageHeader title="Dataset Library" description="Verified datasets returned by the backend registry." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Registered datasets" value={registry.data ? String(registry.data.count) : '—'} detail={registry.state === 'loading' ? 'Loading registry' : registry.error ?? 'Backend registry'} />
        <MetricCard label="Validated rows" value={registry.data ? validatedRows.toLocaleString() : '—'} detail="Registry totals" tone="info" />
        <MetricCard label="Symbol coverage" value={registry.data ? symbols.toLocaleString() : '—'} detail="Declared dataset coverage" />
        <MetricCard label="Registry" value={registry.state === 'success' ? 'Online' : registry.state === 'loading' ? 'Loading' : 'Unavailable'} detail={registry.error ?? 'Read-only API'} tone={registry.state === 'success' ? 'info' : 'warn'} />
      </div>

      <Surface className="mt-4">
        <SurfaceHeader title="Dataset registry" description="Only persisted registry records are displayed." action={<Link className={primaryButton} to="/app/data/import">Import dataset</Link>} />
        {datasets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Timeframe</th><th className="px-4 py-3">Rows</th><th className="px-4 py-3">Symbols</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr></thead>
              <tbody>{datasets.map((dataset) => <tr key={dataset.id} className="border-t border-slate-800"><td className="px-4 py-3 font-medium text-slate-100">{dataset.name}</td><td className="px-4 py-3">{dataset.source}</td><td className="px-4 py-3">{dataset.timeframe}</td><td className="px-4 py-3">{dataset.rowCount.toLocaleString()}</td><td className="px-4 py-3">{dataset.symbolCount}</td><td className="px-4 py-3">{dataset.status}</td><td className="px-4 py-3">{new Date(dataset.updatedAt).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={registry.state === 'loading' ? 'Loading dataset registry' : 'No datasets registered'} description={registry.error ?? 'Register and approve a validated dataset before it appears here.'} action={<Link className={primaryButton} to="/app/data/import">Open Dataset Import</Link>} />
        )}
      </Surface>
    </>
  );
}
