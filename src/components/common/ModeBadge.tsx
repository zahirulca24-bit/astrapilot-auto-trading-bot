import { cn } from '@/lib/utils';
import type { Mode } from '@/types/domain';

interface ModeBadgeProps {
  mode: Mode;
  className?: string;
}

const modeColor: Record<Mode, string> = {
  'LOCAL PAPER': 'var(--simulation)',
  RESEARCH: 'var(--ai-advisory)',
};

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  const color = modeColor[mode];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {mode}
    </span>
  );
}
