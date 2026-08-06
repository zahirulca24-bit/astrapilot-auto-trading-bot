import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, MetricCard, StatusChip, Surface, SurfaceHeader, controlClass, primaryButton, secondaryButton } from '@/components/common/OperationalPage';

export function SignalQueuePage() {
  return (
    <>
      <PageHeader title="Signal Queue" description="Review generated research signals before paper simulation." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Queued" value="0" detail="No pending signals" tone="info" />
        <MetricCard label="A / A+" value="0" detail="No qualified signals" tone="good" />
        <MetricCard label="Watchlist" value="0" detail="No B+ setups" tone="warn" />
        <MetricCard label="Rejected" value="0" detail="No evaluated signals" />
      </div>
      <Surface className="mt-4">
        <SurfaceHeader title="Signal review queue" description="Grades, confidence and rejection reasons come from approved strategy-engine output only." action={<StatusChip tone="warn">Engine not connected</StatusChip>} />
        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-5 py-3">
          <input className={`${controlClass} min-w-52 flex-1`} placeholder="Search symbol or strategy" aria-label="Search signals" />
          <select className={controlClass} defaultValue="all"><option value="all">All grades</option></select>
          <select className={controlClass} defaultValue="all"><option value="all">All timeframes</option></select>
          <select className={controlClass} defaultValue="all"><option value="all">All statuses</option></select>
          <button className={secondaryButton}>Reset</button>
        </div>
        <EmptyState title="No validated signals available" description="This queue stays empty until an approved engine produces a closed-candle result that passes freshness and risk-precheck contracts." action={<button className={primaryButton} disabled>Scanner unavailable</button>} />
      </Surface>
    </>
  );
}
