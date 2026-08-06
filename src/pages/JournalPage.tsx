import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function JournalPage() {
  return (
    <ResearchPageShell
      title="Journal"
      description="Capture research decisions, simulated trade reviews and lessons with traceable timestamps and references."
      metrics={[
        { label: 'Journal entries', value: '—', detail: 'No verified entries loaded' },
        { label: 'Open reviews', value: '—', detail: 'Awaiting review workflow' },
        { label: 'Linked trades', value: '—', detail: 'Simulator ledger required' },
        { label: 'Last update', value: '—', detail: 'No persisted timestamp' },
      ]}
      panelTitle="Research and trade journal"
      panelDescription="Review decisions, outcomes, mistakes, follow-up actions and linked evidence."
      columns={['Date', 'Type', 'Reference', 'Summary', 'Outcome', 'Review status']}
      controls={<><FilterButton>All entries</FilterButton><FilterButton>Trade reviews</FilterButton><FilterButton>Research notes</FilterButton><FilterButton primary>New journal entry</FilterButton></>}
      footer={<p className="text-xs text-slate-500">Journal records must remain append-only and traceable once persistence is connected.</p>}
    />
  );
}
