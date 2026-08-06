import { FilterButton, ResearchPageShell } from '@/components/operations/ResearchPageShell';

export function DatasetImportPage() {
  return (
    <ResearchPageShell
      title="Dataset Import"
      description="Stage, validate and register historical research datasets without bypassing preflight or fingerprint controls."
      metrics={[
        { label: 'Pending files', value: '—', detail: 'No staged uploads' },
        { label: 'Validated', value: '—', detail: 'Preflight not executed' },
        { label: 'Rejected', value: '—', detail: 'No validation failures' },
        { label: 'Fingerprint', value: 'Required', detail: 'Registration remains fail-closed' },
      ]}
      panelTitle="Import staging queue"
      panelDescription="Review source, schema, symbol coverage, timeframe, date range, row count, duplicate state and deterministic fingerprint before registration."
      columns={['File', 'Source', 'Schema', 'Coverage', 'Rows', 'Preflight', 'Fingerprint']}
      controls={
        <>
          <FilterButton>CSV</FilterButton>
          <FilterButton>JSON</FilterButton>
          <FilterButton>Validation report</FilterButton>
          <FilterButton primary>Select local file</FilterButton>
        </>
      }
      footer={<p className="text-xs text-slate-500">Import remains local and research-only. Files are not registered until schema, ordering, timestamps, duplicates and fingerprint checks pass.</p>}
    />
  );
}
