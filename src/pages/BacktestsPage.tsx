import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function BacktestsPage() {
  return (
    <ResearchPageShell
      title="Backtests"
      description="Create reproducible historical research runs with locked datasets, strategy versions and assumptions."
      metrics={[
        { label: 'Runs', value: '0', detail: 'No completed backtests' },
        { label: 'Passed', value: '0', detail: 'No approved evidence' },
        { label: 'Failed', value: '0', detail: 'No failed runs' },
        { label: 'In progress', value: '0', detail: 'No active worker' },
      ]}
      panelTitle="Backtest runs"
      panelDescription="Track immutable run inputs, date range, fees, slippage, execution assumptions and validation outcome."
      columns={['Run ID', 'Strategy', 'Dataset', 'Period', 'Result', 'Status']}
      controls={<><FilterButton>All strategies</FilterButton><FilterButton>All datasets</FilterButton><FilterButton>Completed</FilterButton><FilterButton primary>New backtest</FilterButton></>}
      footer={<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/80">A backtest result is research evidence only. It does not authorize demo, testnet or live exchange orders.</div>}
    />
  );
}
