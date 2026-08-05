// Local demo data adapter for AstraPilot.
//
// This is the ONLY place where sample/presentation values live.
// Page components never import this file directly — they go through the
// service layer (src/services/*), so swapping in a real REST/SSE backend
// later only requires replacing the service implementations.
//
// Nothing here contacts any network. All values are illustrative.

import type {
  DashboardSummary,
  PortfolioSnapshot,
  RequiredAction,
  SignalSummary,
  SystemStatus,
  TimeRange,
} from '@/types/domain';

const NOW = () => Date.now();

function iso(secondsAgo: number): string {
  return new Date(NOW() - secondsAgo * 1000).toISOString();
}

function fmtTime(secondsAgo: number): string {
  const d = new Date(NOW() - secondsAgo * 1000);
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

export const demoAdapter = {
  getDashboardSummary(): DashboardSummary {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'LOCAL PAPER',
      kpis: [
        {
          id: 'equity',
          label: 'Portfolio Equity',
          value: '48,213.55 USDT_SIM',
          status: 'Sample presentation value',
          source: `paper-engine · ${fmtTime(12)}`,
          trend: 'up',
          href: '/app/simulator/positions',
        },
        {
          id: 'daily-loss',
          label: 'Daily Loss Used',
          value: '—',
          status: 'Awaiting authoritative risk service',
          source: `risk-service · ${fmtTime(8)}`,
          trend: 'flat',
          href: '/app/risk',
        },
        {
          id: 'open-risk',
          label: 'Open Risk',
          value: '—',
          status: 'Open Risk Review',
          source: `risk-service · ${fmtTime(8)}`,
          trend: 'flat',
          href: '/app/risk',
        },
        {
          id: 'active-positions',
          label: 'Active Positions',
          value: '2',
          status: 'Sample presentation value',
          source: `sim-engine · ${fmtTime(5)}`,
          trend: 'flat',
          href: '/app/simulator',
        },
      ],
    };
  },

  getPortfolioSnapshot(_range: TimeRange): PortfolioSnapshot {
    void _range;
    const points = 120;
    let equity = 47000;
    const equitySeries = Array.from({ length: points }, (_, i) => {
      const t = Math.floor(NOW() / 1000) - (points - i) * 3600;
      // gentle upward drift with noise, deterministic-ish per session
      const drift = 14;
      const noise = Math.sin(i / 5) * 220 + Math.cos(i / 9) * 130;
      equity = Math.round((equity + drift + noise) * 100) / 100;
      return { time: t, equity };
    });

    const peak: number[] = [];
    let runningPeak = -Infinity;
    for (const p of equitySeries) {
      runningPeak = Math.max(runningPeak, p.equity);
      peak.push(runningPeak);
    }
    const drawdownSeries = equitySeries.map((p, i) => ({
      time: p.time,
      drawdown: Math.round(((p.equity - peak[i]) / peak[i]) * 1000) / 10,
    }));

    return {
      equity: equitySeries[equitySeries.length - 1].equity,
      equitySeries,
      drawdownSeries,
      source: 'paper-engine · local dataset',
      watermark: 'PAPER MODE · LOCAL SIMULATION',
    };
  },

  getRecentSignals(): SignalSummary[] {
    return [
      {
        id: 'sig-0421',
        grade: 'A+',
        symbol: 'BTCUSDT',
        strategy: 'Mean-Reversion Z',
        rr: 3.1,
        status: 'Risk Review',
        createdAt: iso(140),
      },
      {
        id: 'sig-0420',
        grade: 'A',
        symbol: 'ETHUSDT',
        strategy: 'Trend Pullback',
        rr: 2.6,
        status: 'Risk Review',
        createdAt: iso(320),
      },
      {
        id: 'sig-0419',
        grade: 'B+',
        symbol: 'SOLUSDT',
        strategy: 'Breakout Retest',
        rr: 1.9,
        status: 'Watch Only',
        createdAt: iso(510),
      },
      {
        id: 'sig-0418',
        grade: 'A',
        symbol: 'AVAXUSDT',
        strategy: 'Range Exhaustion',
        rr: 2.4,
        status: 'Risk Review',
        createdAt: iso(780),
      },
      {
        id: 'sig-0417',
        grade: 'B+',
        symbol: 'DOGEUSDT',
        strategy: 'Volatility Compression',
        rr: 1.7,
        status: 'Watch Only',
        createdAt: iso(1240),
      },
      {
        id: 'sig-0416',
        grade: 'A+',
        symbol: 'LINKUSDT',
        strategy: 'Liquidity Sweep',
        rr: 3.4,
        status: 'New',
        createdAt: iso(1520),
      },
    ];
  },

  getRequiredActions(): RequiredAction[] {
    return [
      {
        id: 'act-01',
        severity: 'info',
        title: 'Risk profile loaded',
        reason: 'Daily risk utilization available from authoritative risk service.',
        timestamp: fmtTime(90),
        detailsHref: '/app/risk',
      },
      {
        id: 'act-02',
        severity: 'warning',
        title: 'Pending signal review',
        reason: '2 A-grade signals awaiting manual risk review.',
        timestamp: fmtTime(220),
        detailsHref: '/app/signals',
      },
      {
        id: 'act-03',
        severity: 'warning',
        title: 'Dataset issue',
        reason: 'BTCUSDT 1h dataset has a 3-bar gap from last import.',
        timestamp: fmtTime(600),
        detailsHref: '/app/data',
      },
      {
        id: 'act-04',
        severity: 'info',
        title: 'Market-data gateway idle',
        reason: 'No market-data gateway configured. Using local dataset only.',
        timestamp: fmtTime(1200),
        detailsHref: '/app/alerts-health',
      },
    ];
  },

  getSystemStatus(): SystemStatus {
    return {
      mode: 'LOCAL PAPER',
      marketData: {
        state: 'offline',
        lastTick: '—',
        symbolsTracked: 0,
        source: 'no gateway configured',
      },
      risk: {
        state: 'connected',
        summary: 'Awaiting authoritative risk service',
      },
      sse: {
        state: 'disconnected',
        lastEvent: '—',
        channel: 'none',
      },
      datasets: {
        state: 'degraded',
        datasets: 6,
        lastImport: fmtTime(3600),
      },
      portfolio: {
        quoteAsset: 'USDT_SIM',
        balance: 48213.55,
      },
    };
  },
};

export type DemoAdapter = typeof demoAdapter;
