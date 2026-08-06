import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function AlertsHealthPage() {
  return (
    <ResearchPageShell
      title="Alerts and Health"
      description="Track service readiness, data freshness, persistence pressure and operational alerts across local components."
      metrics={[
        { label: 'Active alerts', value: '—', detail: 'No verified alert stream' },
        { label: 'Services ready', value: '—', detail: 'Health checks not loaded' },
        { label: 'Feed freshness', value: '—', detail: 'Gateway status required' },
        { label: 'Persistence queue', value: '—', detail: 'Metrics unavailable' },
      ]}
      panelTitle="Operational health"
      panelDescription="Inspect alerts, dependency state, data freshness and recovery status without hiding degraded conditions."
      columns={['Time', 'Severity', 'Component', 'Event', 'State', 'Resolution']}
      controls={<><FilterButton>All events</FilterButton><FilterButton>Critical</FilterButton><FilterButton>Degraded</FilterButton><FilterButton primary>Refresh health</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Health indicators must reflect real backend and gateway responses; unavailable checks remain visibly unknown.</p>}
    />
  );
}
