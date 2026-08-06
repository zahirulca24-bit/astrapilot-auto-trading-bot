import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function AuditDecisionsPage() {
  return (
    <ResearchPageShell
      title="Audit and Decisions"
      description="Track architecture decisions, checkpoint evidence, approvals, exceptions and unresolved blockers in one governed register."
      metrics={[
        { label: 'Open decisions', value: '—', detail: 'Decision register unavailable' },
        { label: 'Pending approval', value: '—', detail: 'No verified approval queue' },
        { label: 'Open blockers', value: '—', detail: 'Checkpoint evidence not loaded' },
        { label: 'Last lock', value: '—', detail: 'No verified phase-lock record' },
      ]}
      panelTitle="Decision and audit register"
      panelDescription="Track decision IDs, scope, owner, evidence, status, effective date and implementation impact without silently changing approved architecture."
      columns={['Decision ID', 'Category', 'Summary', 'Owner', 'Evidence', 'Status', 'Effective']}
      controls={
        <>
          <FilterButton>All categories</FilterButton>
          <FilterButton>Pending approval</FilterButton>
          <FilterButton>Blocked</FilterButton>
          <FilterButton primary>New decision record</FilterButton>
        </>
      }
      footer={<p className="text-xs text-slate-500">Governance rule: architecture, risk and scope changes require recorded evidence and explicit owner approval before implementation.</p>}
    />
  );
}
