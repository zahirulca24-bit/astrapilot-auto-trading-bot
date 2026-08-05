import { PageHeader } from '@/components/common/PageHeader';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { EquityChartSection } from '@/components/dashboard/EquityChartSection';
import { RecentSignalsTable } from '@/components/dashboard/RecentSignalsTable';
import { RequiredActionsSection } from '@/components/dashboard/RequiredActionsSection';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Offline research & local paper simulation overview."
      />

      {/* Section 1 — KPI row */}
      <KpiRow />

      {/* Sections 2 + 4 — chart with required actions beside it on wide screens */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <EquityChartSection />
        </div>
        <div className="lg:col-span-4">
          <RequiredActionsSection />
        </div>
      </div>

      {/* Section 3 — recent signals */}
      <div className="mt-4">
        <RecentSignalsTable />
      </div>
    </>
  );
}
