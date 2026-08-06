import { PageHeader } from '@/components/common/PageHeader';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { EquityChartSection } from '@/components/dashboard/EquityChartSection';
import { RecentSignalsTable } from '@/components/dashboard/RecentSignalsTable';
import { RequiredActionsSection } from '@/components/dashboard/RequiredActionsSection';
import { useApiResource } from '@/hooks/useApiResource';
import { api, backendBaseUrl } from '@/lib/api';

export function DashboardPage() {
  const backend = useApiResource(api.backendHealth, Boolean(backendBaseUrl));
  const backendStatus = backend.data?.status ?? (backend.state === 'loading' ? 'checking' : 'unavailable');

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Offline research & local paper simulation overview. Backend: ${backendStatus}. Aggregates remain unavailable until approved summary endpoints exist.`}
      />

      <KpiRow />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <EquityChartSection />
        </div>
        <div className="lg:col-span-4">
          <RequiredActionsSection />
        </div>
      </div>

      <div className="mt-4">
        <RecentSignalsTable />
      </div>
    </>
  );
}
