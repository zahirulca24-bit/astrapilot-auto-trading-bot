import { ShieldOff } from 'lucide-react';

/**
 * Persistent banner that communicates the offline / no-live-trading boundary.
 * Always visible at the top of the content area.
 */
export function OfflineBoundaryBanner() {
  return (
    <div
      className="border-app bg-surface flex items-center gap-2 border-b px-4 py-1.5 text-[11px] sm:px-6 lg:px-8"
      role="status"
      aria-label="Offline research boundary"
    >
      <ShieldOff className="h-3.5 w-3.5 shrink-0 text-[var(--boundary-blocked)]" aria-hidden />
      <span className="text-secondary-app">
        Offline research &amp; local paper simulation only. No exchange connectivity,
        live funds, or real order submission is available in this build.
      </span>
    </div>
  );
}
