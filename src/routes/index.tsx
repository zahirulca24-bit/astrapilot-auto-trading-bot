import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { DatasetLibraryPage } from '@/pages/DatasetLibraryPage';
import { DatasetImportPage } from '@/pages/DatasetImportPage';
import { MarketExplorerPage } from '@/pages/MarketExplorerPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { SignalQueuePage } from '@/pages/SignalQueuePage';
import { StrategyLibraryPage } from '@/pages/StrategyLibraryPage';
import { BacktestsPage } from '@/pages/BacktestsPage';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { SimulatedOrdersPage } from '@/pages/SimulatedOrdersPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { RiskCenterPage } from '@/pages/RiskCenterPage';
import { JournalPage } from '@/pages/JournalPage';
import { AlertsHealthPage } from '@/pages/AlertsHealthPage';
import { AuditDecisionsPage } from '@/pages/AuditDecisionsPage';
import { SettingsGovernancePage } from '@/pages/SettingsGovernancePage';
import { NotImplementedPage } from '@/pages/NotImplementedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navGroups } from './nav-config';

const implementedRoutes: RouteObject[] = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'data', element: <DatasetLibraryPage /> },
  { path: 'data/import', element: <DatasetImportPage /> },
  { path: 'markets', element: <MarketExplorerPage /> },
  { path: 'scanner', element: <ScannerPage /> },
  { path: 'signals', element: <SignalQueuePage /> },
  { path: 'strategies', element: <StrategyLibraryPage /> },
  { path: 'backtests', element: <BacktestsPage /> },
  { path: 'simulator', element: <SimulatorPage /> },
  { path: 'simulator/orders', element: <SimulatedOrdersPage /> },
  { path: 'simulator/positions', element: <PortfolioPage /> },
  { path: 'risk', element: <RiskCenterPage /> },
  { path: 'journal', element: <JournalPage /> },
  { path: 'alerts-health', element: <AlertsHealthPage /> },
  { path: 'audit-decisions', element: <AuditDecisionsPage /> },
  { path: 'settings-governance', element: <SettingsGovernancePage /> },
];

const implementedPaths = new Set([
  '/app/dashboard',
  '/app/data',
  '/app/data/import',
  '/app/markets',
  '/app/scanner',
  '/app/signals',
  '/app/strategies',
  '/app/backtests',
  '/app/simulator',
  '/app/simulator/orders',
  '/app/simulator/positions',
  '/app/risk',
  '/app/journal',
  '/app/alerts-health',
  '/app/audit-decisions',
  '/app/settings-governance',
]);

const placeholderRoutes: RouteObject[] = navGroups
  .flatMap((group) => group.items)
  .filter((item) => !implementedPaths.has(item.path))
  .map((item) => ({
    path: item.path.replace(/^\/app\//, ''),
    element: <NotImplementedPage title={item.label} />,
  }));

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/app/dashboard" replace /> },
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      ...implementedRoutes,
      ...placeholderRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
