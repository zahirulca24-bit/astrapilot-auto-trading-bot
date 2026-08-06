import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function PortfolioPage() {
  return (
    <ResearchPageShell
      title="Portfolio"
      description="Review local simulated positions, exposure and mark-to-market state without connecting to exchange balances."
      metrics={[
        { label: 'Open positions', value: '—', detail: 'Awaiting simulator state' },
        { label: 'Gross exposure', value: '—', detail: 'Local simulation only' },
        { label: 'Unrealized P&L', value: '—', detail: 'No verified marks loaded' },
        { label: 'Portfolio heat', value: '—', detail: 'Risk engine not confirmed' },
      ]}
      panelTitle="Position book"
      panelDescription="Inspect simulated entries, current marks, risk allocation and unrealized performance."
      columns={['Symbol', 'Side', 'Quantity', 'Entry', 'Mark', 'Unrealized P&L', 'Risk']}
      controls={<><FilterButton>All positions</FilterButton><FilterButton>Open only</FilterButton><FilterButton>Highest risk</FilterButton><FilterButton primary>Refresh portfolio</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Boundary: values shown here must come from the local simulator. No exchange account or balance access is permitted.</p>}
    />
  );
}
