import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Evidence sections rendered inside the drawer body. */
  children: ReactNode;
}

export function EvidenceDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: EvidenceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-elevated border-app flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-app flex-row items-start justify-between border-b p-4">
          <div className="min-w-0">
            <SheetTitle className="text-primary-app text-base">{title}</SheetTitle>
            {description && (
              <p className="text-muted-app mt-1 text-xs">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close evidence drawer"
            onClick={() => onOpenChange(false)}
            className="text-muted-app hover:text-primary-app focus-ring rounded-md p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/** A labelled key/value row used inside evidence drawers. */
export function EvidenceRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-app border-b py-2 last:border-b-0">
      <div className="text-muted-app text-[11px] uppercase tracking-wide">{label}</div>
      <div className="text-secondary-app font-mono mt-0.5 text-sm">{children}</div>
    </div>
  );
}
