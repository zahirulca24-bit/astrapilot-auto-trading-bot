import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Database,
  FileDown,
  Compass,
  Radar,
  ListChecks,
  Library,
  FlaskConical,
  MonitorPlay,
  ListOrdered,
  Briefcase,
  ShieldAlert,
  NotebookPen,
  Activity,
  ScrollText,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// Approved navigation only. Paths must match the approved route table exactly.
// Do not add new pages here without approval.
export const navGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'data',
    label: 'Data and Markets',
    items: [
      { label: 'Dataset Library', path: '/app/data', icon: Database },
      { label: 'Dataset Import', path: '/app/data/import', icon: FileDown },
      { label: 'Market Explorer', path: '/app/markets', icon: Compass },
    ],
  },
  {
    id: 'scanner',
    label: 'Scanner and Signals',
    items: [
      { label: 'Scanner', path: '/app/scanner', icon: Radar },
      { label: 'Signal Queue', path: '/app/signals', icon: ListChecks },
    ],
  },
  {
    id: 'strategies',
    label: 'Strategies',
    items: [
      { label: 'Strategy Library', path: '/app/strategies', icon: Library },
    ],
  },
  {
    id: 'research',
    label: 'Research and Backtests',
    items: [
      { label: 'Backtests', path: '/app/backtests', icon: FlaskConical },
    ],
  },
  {
    id: 'simulation',
    label: 'Simulation and Portfolio',
    items: [
      { label: 'Simulator', path: '/app/simulator', icon: MonitorPlay },
      { label: 'Simulated Orders', path: '/app/simulator/orders', icon: ListOrdered },
      { label: 'Portfolio', path: '/app/simulator/positions', icon: Briefcase },
    ],
  },
  {
    id: 'risk',
    label: 'Risk and Journal',
    items: [
      { label: 'Risk Center', path: '/app/risk', icon: ShieldAlert },
      { label: 'Journal', path: '/app/journal', icon: NotebookPen },
    ],
  },
  {
    id: 'ops',
    label: 'Operations and Governance',
    items: [
      { label: 'Alerts and Health', path: '/app/alerts-health', icon: Activity },
      { label: 'Audit and Decisions', path: '/app/audit-decisions', icon: ScrollText },
      { label: 'Settings and Governance', path: '/app/settings-governance', icon: Settings },
    ],
  },
];
