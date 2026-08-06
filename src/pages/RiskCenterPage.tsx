import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function RiskCenterPage() {
  return (
    <ResearchPageShell
      title="Risk Center"
      description="Monitor approved local risk limits, exposure concentration and stop conditions before simulated execution."
      metrics={[
        { label: 'Risk used', value: '—', detail: 'Awaiting portfolio state' },
        { label: 'Daily loss', value: '—', detail: 'No verified ledger loaded' },
        { label: 'Open risk', value: '—', detail: 'Calculated positions only' },
        { label: 'Risk status', value: 'Inactive', detail: 'Engine not confirmed' },
      ]}
      panelTitle="Risk controls"
      panelDescription="Review limits, current utilization, breaches and fail-closed decisions."
      columns={['Control', 'Limit', 'Current', 'Status', 'Last evaluated', 'Action']}
      controls={<><FilterButton>All controls</FilterButton><FilterButton>Breaches</FilterButton><FilterButton>Warnings</FilterButton><FilterButton primary>Evaluate risk</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Risk controls are advisory until backed by verified simulator and ledger data. Missing data must fail closed.</p>}
    />
  );
}
