import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, StatusChip, Surface, SurfaceHeader, controlClass, secondaryButton } from '@/components/common/OperationalPage';

export function SimulatedOrdersPage() {
  return (
    <>
      <PageHeader title="Simulated Orders" description="Local paper-order history with explicit lifecycle and risk controls." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Pending" value="0" detail="No queued orders" tone="warn" />
        <MetricCard label="Filled" value="0" detail="No simulated fills" tone="good" />
        <MetricCard label="Cancelled" value="0" detail="No cancellations" />
        <MetricCard label="Rejected" value="0" detail="No risk rejections" />
      </div>

      <Surface className="mt-4">
        <SurfaceHeader title="Order ledger" description="Every local order will retain side, size, entry, stop, target, status and timestamps." action={<StatusChip tone="neutral">No exchange orders</StatusChip>} />
        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-5 py-3">
          <input className={`${controlClass} min-w-52 flex-1`} placeholder="Search symbol or order ID" aria-label="Search simulated orders" />
          <select className={controlClass} defaultValue="all"><option value="all">All sides</option></select>
          <select className={controlClass} defaultValue="all"><option value="all">All statuses</option></select>
          <select className={controlClass} defaultValue="newest"><option value="newest">Newest first</option></select>
          <button className={secondaryButton}>Reset</button>
        </div>
        <EmptyState title="No simulated orders" description="Orders will appear only after simulator configuration, approved risk rules and an explicit local paper-order action. No demo, testnet or live exchange order is created." />
      </Surface>
    </>
  );
}
