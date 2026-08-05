import { cn } from '@/lib/utils';
import type { Severity, SignalGrade } from '@/types/domain';

type Tone = 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'simulation' | 'ai';

const toneStyles: Record<Tone, string> = {
  success: 'border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]',
  warning: 'border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]',
  critical: 'border-[var(--critical)]/40 bg-[var(--critical)]/10 text-[var(--critical)]',
  info: 'border-[var(--simulation)]/40 bg-[var(--simulation)]/10 text-[var(--simulation)]',
  neutral: 'border-[var(--border-base)] bg-elevated text-secondary-app',
  simulation: 'border-[var(--simulation)]/40 bg-[var(--simulation)]/10 text-[var(--simulation)]',
  ai: 'border-[var(--ai-advisory)]/40 bg-[var(--ai-advisory)]/10 text-[var(--ai-advisory)]',
};

interface StatusBadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  /** Optional leading dot indicator. */
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ tone = 'neutral', children, dot = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        toneStyles[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const gradeTone: Record<SignalGrade, Tone> = {
  'A+': 'success',
  A: 'info',
  'B+': 'warning',
};

export function GradeBadge({ grade }: { grade: SignalGrade }) {
  return <StatusBadge tone={gradeTone[grade]}>{grade}</StatusBadge>;
}

const severityTone: Record<Severity, Tone> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <StatusBadge tone={severityTone[severity]} dot>
      {severity}
    </StatusBadge>
  );
}
