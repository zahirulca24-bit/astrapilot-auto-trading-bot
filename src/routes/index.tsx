import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { AlertsHealthPage } from '@/pages/AlertsHealthPage';
import { AuditDecisionsPage } from '@/pages/AuditDecisionsPage';
import { BacktestsPage } from '@/pages/BacktestsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DatasetImportPage } from '@/pages/DatasetImportPage';
import { DatasetLibraryPage } from '@/pages/DatasetLibraryPage';
import { JournalPage } from '@/pages/JournalPage';
import { MarketExplorerPage } from '@/pages/MarketExplorerPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { RiskCenterPage } from '@/pages/RiskCenterPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { SettingsGovernancePage } from '@/pages/SettingsGovernancePage';
import { SignalQueuePage } from '@/pages/SignalQueuePage';
import { SimulatedOrdersPage } from '@/pages/SimulatedOrdersPage';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { StrategyLibraryPage } from '@/pages/StrategyLibraryPage';

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

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/app/dashboard" replace /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      ...implementedRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
];
