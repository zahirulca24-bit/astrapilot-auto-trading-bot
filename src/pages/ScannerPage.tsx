import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function ScannerPage() {
  return (
    <ResearchPageShell
      title="Scanner"
      description="Run the approved closed-candle research workflow across the eligible universe."
      metrics={[
        { label: 'Universe', value: '—', detail: 'Eligibility gate not loaded' },
        { label: 'Scanned', value: '0', detail: 'No completed scan session' },
        { label: 'Candidates', value: '0', detail: 'No verified setups' },
        { label: 'Rejected', value: '0', detail: 'No decision records' },
      ]}
      panelTitle="Scanner results"
      panelDescription="Review setup candidates with score, strategy, timeframe, freshness and rejection evidence."
      columns={['Symbol', 'Direction', 'Strategy', 'Timeframe', 'Score', 'Decision']}
      controls={<><FilterButton>All strategies</FilterButton><FilterButton>All timeframes</FilterButton><FilterButton>A and above</FilterButton><FilterButton primary>Run scanner</FilterButton></>}
      footer={<div className="grid gap-3 md:grid-cols-3"><Status label="Closed candles" value="Required"/><Status label="Stale-data gate" value="Enforced"/><Status label="Execution" value="Disabled"/></div>}
    />
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-200">{value}</p></div>;
}
