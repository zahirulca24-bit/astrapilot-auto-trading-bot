import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function MarketExplorerPage() {
  return (
    <ResearchPageShell
      title="Market Explorer"
      description="Inspect the approved public USDT-perpetual universe and data freshness without exposing exchange credentials."
      metrics={[
        { label: 'Eligible symbols', value: '—', detail: 'Awaiting gateway universe' },
        { label: 'Fresh tickers', value: '—', detail: 'No verified stream connected' },
        { label: 'Closed candles', value: '—', detail: 'Validated records only' },
        { label: 'Feed health', value: 'Offline', detail: 'Public gateway not confirmed' },
      ]}
      panelTitle="Market universe"
      panelDescription="Rank, filter and inspect canonical symbols, liquidity, price state and data freshness."
      columns={['Symbol', 'Last', '24h turnover', 'Spread', 'Trend', 'Freshness']}
      controls={<><FilterButton>Top 20</FilterButton><FilterButton>USDT perpetual</FilterButton><FilterButton>Fresh only</FilterButton><FilterButton primary>Refresh gateway</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Boundary: public market data only. No balances, private endpoints or order actions are available here.</p>}
    />
  );
}
