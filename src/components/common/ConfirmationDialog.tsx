import { AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ImpactSummary {
  /** Human-readable, deterministic description of what the action will do. */
  summary: string;
  /** Optional bullet list of affected resources / side effects. */
  effects?: string[];
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  impact: ImpactSummary;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  disabledReason?: string | null;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  impact,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  disabledReason = null,
  onConfirm,
}: ConfirmationDialogProps) {
  const disabled = loading || !!disabledReason;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-elevated border-app max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {destructive && (
              <AlertTriangle className="text-[var(--critical)] h-4 w-4" aria-hidden />
            )}
            <DialogTitle className="text-primary-app">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-secondary-app">{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="bg-surface border-app rounded-md border p-3">
          <p className="text-secondary-app text-xs leading-relaxed">{impact.summary}</p>
          {impact.effects && impact.effects.length > 0 && (
            <ul className="text-muted-app mt-2 space-y-1 text-xs">
              {impact.effects.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-muted-app mt-0.5" aria-hidden>
                    •
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {disabledReason && (
          <p className="text-[var(--warning)] text-xs" role="note">
            {disabledReason}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-secondary-app hover:text-primary-app hover:bg-hover-surface"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
