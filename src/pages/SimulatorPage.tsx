import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, StatusChip, Surface, SurfaceHeader, primaryButton } from '@/components/common/OperationalPage';

export function SimulatorPage() {
  return (
    <>
      <PageHeader title="Simulator" description="Local paper-simulation account, exposure and position overview." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Starting capital" value="Not configured" detail="Set in governance before use" tone="warn" />
        <MetricCard label="Available balance" value="—" detail="No simulation ledger" />
        <MetricCard label="Open positions" value="0" detail="No local paper positions" tone="info" />
        <MetricCard label="Realized P&L" value="—" detail="No completed paper trades" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Surface className="xl:col-span-8">
          <SurfaceHeader title="Open positions" description="Positions appear only after a locally authorized paper order is filled." action={<StatusChip tone="neutral">Local only</StatusChip>} />
          <EmptyState title="No simulated positions" description="The simulator has no configured capital or filled local paper orders. Exchange balances and private endpoints are never used here." />
        </Surface>
        <Surface className="xl:col-span-4">
          <SurfaceHeader title="Simulation controls" description="All controls remain disabled until governance setup is complete." />
          <div className="space-y-3 p-5 text-xs text-slate-400">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"><span>Simulation mode</span><StatusChip tone="warn">Not configured</StatusChip></div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"><span>Risk profile</span><span className="text-slate-300">Awaiting approval</span></div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"><span>Order intake</span><span className="text-slate-300">Disabled</span></div>
            <button className={`${primaryButton} w-full`} disabled>Configure simulator</button>
          </div>
        </Surface>
      </div>
    </>
  );
}
