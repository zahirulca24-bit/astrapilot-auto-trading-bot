import { useEffect, useState } from 'react';
import { Database, Radio, ShieldAlert, Activity, Wallet, FlaskConical, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { systemStatusService } from '@/services/system-status-service';
import type { ConnectionState, SystemStatus } from '@/types/domain';

const stateColor: Record<ConnectionState, string> = {
  connected: 'var(--success)',
  degraded: 'var(--warning)',
  disconnected: 'var(--text-muted)',
  offline: 'var(--text-muted)',
};

const stateLabel: Record<ConnectionState, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
  offline: 'Offline',
};

function ContextDot({ state }: { state: ConnectionState }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: stateColor[state] }}
      aria-hidden
    />
  );
}

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  state?: ConnectionState;
}

function ContextItem({ icon, label, value, state }: ItemProps) {
  return (
    <div
      className="flex min-w-0 items-center gap-2 px-3"
      role="group"
      aria-label={`${label} status`}
    >
      <span className="text-muted-app shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="text-muted-app shrink-0 text-[11px] uppercase tracking-wide">{label}</span>
      <span className="text-secondary-app truncate text-xs font-medium">{value}</span>
      {state && (
        <span className="flex items-center gap-1 shrink-0">
          <ContextDot state={state} />
          <span className="text-muted-app text-[11px]">{stateLabel[state]}</span>
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <span className="bg-[var(--border-base)] h-4 w-px shrink-0" aria-hidden />;
}

export function ContextBar() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    let active = true;
    systemStatusService
      .get()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus(null));
    return () => {
      active = false;
    };
  }, []);

  const modeColor =
    status?.mode === 'LOCAL PAPER' ? 'var(--simulation)' : 'var(--ai-advisory)';

  const riskValue = status ? status.risk.summary : '—';

  return (
    <div className="bg-surface border-app sticky top-14 z-20 flex h-11 shrink-0 items-center border-b">
      {/* --- Mobile (< md): mode, risk, market first; rest behind toggle --- */}
      <div className="flex w-full items-center md:hidden">
        {/* Mode — always first */}
        <div className="flex items-center gap-2 px-3">
          <FlaskConical className="h-3.5 w-3.5" style={{ color: modeColor }} aria-hidden />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: modeColor }}
          >
            {status?.mode ?? '—'}
          </span>
        </div>
        <Divider />
        {/* Risk — always second */}
        <ContextItem
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          label="Risk"
          value={riskValue}
          state={status?.risk.state}
        />
        <Divider />
        {/* Market data — always third */}
        <ContextItem
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Mkt"
          value={status ? status.marketData.source : '—'}
          state={status?.marketData.state}
        />
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-label="Toggle more status items"
          className="text-muted-app hover:text-primary-app focus-ring ml-auto flex items-center gap-1 rounded-md px-3 py-1 text-[11px] transition-colors"
        >
          More
          <ChevronDown className={cn('h-3 w-3 transition-transform', moreOpen && 'rotate-180')} />
        </button>

        {moreOpen && (
          <div className="bg-elevated border-app absolute left-0 right-0 top-11 z-30 flex flex-col border-b py-1 shadow-lg">
            <ContextItem
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Portfolio"
              value={status ? `${status.portfolio.balance.toLocaleString()} ${status.portfolio.quoteAsset}` : '—'}
            />
            <ContextItem
              icon={<Database className="h-3.5 w-3.5" />}
              label="Datasets"
              value={status ? `${status.datasets.datasets} · ${status.datasets.lastImport}` : '—'}
              state={status?.datasets.state}
            />
            <ContextItem
              icon={<Radio className="h-3.5 w-3.5" />}
              label="SSE"
              value={status ? status.sse.channel : '—'}
              state={status?.sse.state}
            />
          </div>
        )}
      </div>

      {/* --- Desktop (md+): full item list, horizontal --- */}
      <div className="hidden w-full items-center overflow-x-auto scrollbar-thin md:flex">
        <ContextItem
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Portfolio"
          value={status ? `${status.portfolio.balance.toLocaleString()} ${status.portfolio.quoteAsset}` : '—'}
        />
        <Divider />
        <ContextItem
          icon={<Database className="h-3.5 w-3.5" />}
          label="Datasets"
          value={status ? `${status.datasets.datasets} · ${status.datasets.lastImport}` : '—'}
          state={status?.datasets.state}
        />
        <Divider />
        <ContextItem
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Market Data"
          value={status ? status.marketData.source : '—'}
          state={status?.marketData.state}
        />
        <Divider />
        <ContextItem
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          label="Risk"
          value={riskValue}
          state={status?.risk.state}
        />
        <Divider />
        <ContextItem
          icon={<Radio className="h-3.5 w-3.5" />}
          label="SSE"
          value={status ? status.sse.channel : '—'}
          state={status?.sse.state}
        />
        <Divider />
        <div className="ml-auto flex items-center gap-2 px-3">
          <FlaskConical className="h-3.5 w-3.5" style={{ color: modeColor }} aria-hidden />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: modeColor }}
          >
            {status?.mode ?? '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
