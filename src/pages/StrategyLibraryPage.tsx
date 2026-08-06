import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function StrategyLibraryPage() {
  return (
    <ResearchPageShell
      title="Strategy Library"
      description="Govern approved research strategies, versions, readiness and validation evidence."
      metrics={[
        { label: 'Approved', value: '0', detail: 'No registered strategy builds' },
        { label: 'Draft', value: '0', detail: 'No pending versions' },
        { label: 'Validated', value: '0', detail: 'No backtest evidence linked' },
        { label: 'Disabled', value: '0', detail: 'No retired strategies' },
      ]}
      panelTitle="Strategy registry"
      panelDescription="Each strategy version must expose scope, parameters, data requirements, risk assumptions and validation status."
      columns={['Strategy', 'Version', 'Style', 'Timeframes', 'Validation', 'Status']}
      controls={<><FilterButton>All styles</FilterButton><FilterButton>Approved only</FilterButton><FilterButton>Needs validation</FilterButton><FilterButton primary>Register strategy</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Registration does not authorize exchange execution. Strategy activation remains blocked until validation and owner approval are recorded.</p>}
    />
  );
}
