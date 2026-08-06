import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';
import { useApiResource } from '@/hooks/useApiResource';
import { api, gatewayBaseUrl } from '@/lib/api';

export function MarketExplorerPage() {
  const universe = useApiResource(api.marketUniverse, Boolean(gatewayBaseUrl));
  const status = useApiResource(api.gatewayStatus, Boolean(gatewayBaseUrl));
  const symbols = universe.data?.symbols ?? [];

  return (
    <ResearchPageShell
      title="Market Explorer"
      description="Inspect the approved public USDT-perpetual universe and data freshness without exposing exchange credentials."
      metrics={[
        { label: 'Eligible symbols', value: universe.state === 'success' ? String(symbols.length) : '—', detail: universe.state === 'loading' ? 'Loading gateway universe' : universe.error ?? 'Top 20 public universe' },
        { label: 'Fresh tickers', value: '—', detail: 'Ticker fan-out not connected yet' },
        { label: 'Closed candles', value: '—', detail: 'Candle aggregation not connected yet' },
        { label: 'Feed health', value: status.data?.state ?? (status.state === 'loading' ? 'Loading' : 'Unknown'), detail: status.error ?? status.data?.reason ?? 'Gateway status endpoint' },
      ]}
      panelTitle="Market universe"
      panelDescription="Verified symbols loaded directly from the public market-data gateway."
      columns={['Symbol', 'Last', '24h turnover', 'Spread', 'Trend', 'Freshness']}
      controls={<><FilterButton>Top 20</FilterButton><FilterButton>USDT perpetual</FilterButton><FilterButton>Fresh only</FilterButton><FilterButton primary disabled={!gatewayBaseUrl || universe.state === 'loading'} onClick={() => { universe.refresh(); status.refresh(); }}>Refresh gateway</FilterButton></>}
      content={symbols.length > 0 ? (
        <div className="min-w-[760px] bg-slate-900/45">
          {symbols.map((item, index) => {
            const record = typeof item === 'string' ? { symbol: item } : item;
            return (
              <div key={`${record.symbol ?? index}`} className="grid border-t border-slate-800 px-4 py-3 text-xs text-slate-300" style={{ gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))' }}>
                <span className="font-semibold text-slate-100">{record.symbol ?? 'Unknown'}</span>
                <span>{record.lastPrice ?? '—'}</span>
                <span>{record.turnover24h ?? '—'}</span>
                <span>—</span><span>—</span><span>Gateway</span>
              </div>
            );
          })}
        </div>
      ) : undefined}
      emptyTitle={universe.state === 'unconfigured' ? 'Gateway URL not configured' : universe.state === 'error' ? 'Gateway request failed' : 'No verified symbols returned'}
      emptyDescription={universe.error ?? 'Set VITE_MARKET_GATEWAY_URL to the public gateway base URL. No credentials are used.'}
      footer={<p className="text-xs text-slate-500">Boundary: public market data only. No balances, private endpoints or order actions are available here.</p>}
    />
  );
}
