import { useAsync } from '@/hooks/use-async';
import { dashboardService } from '@/services/dashboard-service';
import { RequiredActionsPanel } from '@/components/common/RequiredActionsPanel';

export function RequiredActionsSection() {
  const actions = useAsync(() => dashboardService.getRequiredActions());

  return (
    <RequiredActionsPanel
      actions={actions.data ?? []}
      state={actions.state}
      error={actions.error}
      onRetry={actions.reload}
    />
  );
}
