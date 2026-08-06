import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function SettingsGovernancePage() {
  return (
    <ResearchPageShell
      title="Settings and Governance"
      description="Review operating boundaries, feature flags, data-retention rules and environment readiness without exposing secrets in the browser."
      metrics={[
        { label: 'Operating mode', value: 'Research', detail: 'Local simulation boundary' },
        { label: 'Execution', value: 'Disabled', detail: 'No exchange order path' },
        { label: 'Secrets', value: 'Server only', detail: 'Never rendered in UI' },
        { label: 'Config status', value: 'Unverified', detail: 'Backend contract not loaded' },
      ]}
      panelTitle="Governed configuration"
      panelDescription="Inspect configuration domain, current effective value, source, validation state, restart requirement and approval status."
      columns={['Setting', 'Domain', 'Effective value', 'Source', 'Validation', 'Restart', 'Approval']}
      controls={
        <>
          <FilterButton>Operating boundary</FilterButton>
          <FilterButton>Data policy</FilterButton>
          <FilterButton>Feature flags</FilterButton>
          <FilterButton primary>Review configuration</FilterButton>
        </>
      }
      footer={<p className="text-xs text-slate-500">Sensitive values, API keys and database credentials are intentionally excluded. Configuration changes remain disabled until backend validation and owner approval exist.</p>}
    />
  );
}
