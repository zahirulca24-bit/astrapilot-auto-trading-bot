import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';
import { useApiResource } from '@/hooks/useApiResource';
import { api, backendBaseUrl, gatewayBaseUrl } from '@/lib/api';

export function AlertsHealthPage() {
  const backend = useApiResource(api.backendHealth, Boolean(backendBaseUrl));
  const gateway = useApiResource(api.gatewayStatus, Boolean(gatewayBaseUrl));
  const dependencyCount = backend.data ? Object.keys(backend.data.dependencies ?? {}).length : 0;
  const persistenceMetrics = gateway.data?.persistence?.metrics ?? {};
  const queueDepth = persistenceMetrics.pending ?? persistenceMetrics.queued ?? 0;

  const events = [
    backend.data ? { component: backend.data.service, state: backend.data.status, detail: `Version ${backend.data.version}` } : null,
    gateway.data ? { component: gateway.data.service, state: gateway.data.state, detail: gateway.data.reason ?? `Version ${gateway.data.version}` } : null,
  ].filter(Boolean) as Array<{ component: string; state: string; detail: string }>;

  return (
    <ResearchPageShell
      title="Alerts and Health"
      description="Track service readiness, data freshness, persistence pressure and operational alerts across local components."
      metrics={[
        { label: 'Active alerts', value: String(events.filter((item) => !['ok', 'connected'].includes(item.state)).length), detail: 'Derived from verified service states' },
        { label: 'Services ready', value: `${events.filter((item) => ['ok', 'connected', 'degraded'].includes(item.state)).length}/2`, detail: `${dependencyCount} backend dependencies reported` },
        { label: 'Feed freshness', value: gateway.data?.lastEventAt ? new Date(gateway.data.lastEventAt).toLocaleTimeString() : '—', detail: gateway.error ?? 'Gateway last normalized event' },
        { label: 'Persistence queue', value: String(queueDepth), detail: gateway.data?.persistence?.enabled ? 'Persistence enabled' : 'Persistence disabled or unavailable' },
      ]}
      panelTitle="Operational health"
      panelDescription="Live status from FastAPI health and Node gateway status endpoints."
      columns={['Time', 'Severity', 'Component', 'Event', 'State', 'Resolution']}
      controls={<><FilterButton>All events</FilterButton><FilterButton>Critical</FilterButton><FilterButton>Degraded</FilterButton><FilterButton primary disabled={backend.state === 'loading' || gateway.state === 'loading'} onClick={() => { backend.refresh(); gateway.refresh(); }}>Refresh health</FilterButton></>}
      content={events.length > 0 ? (
        <div className="min-w-[760px] bg-slate-900/45">
          {events.map((event) => (
            <div key={event.component} className="grid border-t border-slate-800 px-4 py-3 text-xs text-slate-300" style={{ gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))' }}>
              <span>{new Date().toLocaleTimeString()}</span><span>{event.state === 'ok' || event.state === 'connected' ? 'Info' : 'Warning'}</span><span>{event.component}</span><span>{event.detail}</span><span>{event.state}</span><span>Observe</span>
            </div>
          ))}
        </div>
      ) : undefined}
      emptyTitle="Health endpoints unavailable"
      emptyDescription={backend.error ?? gateway.error ?? 'Configure VITE_BACKEND_API_URL and VITE_MARKET_GATEWAY_URL to enable live health checks.'}
      footer={<p className="text-xs text-slate-500">Health indicators reflect real backend and gateway responses; unavailable checks remain visibly unknown.</p>}
    />
  );
}
