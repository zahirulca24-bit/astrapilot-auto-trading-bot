import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { DatasetLibraryPage } from '@/pages/DatasetLibraryPage';
import { MarketExplorerPage } from '@/pages/MarketExplorerPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { SignalQueuePage } from '@/pages/SignalQueuePage';
import { StrategyLibraryPage } from '@/pages/StrategyLibraryPage';
import { BacktestsPage } from '@/pages/BacktestsPage';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { SimulatedOrdersPage } from '@/pages/SimulatedOrdersPage';
import { NotImplementedPage } from '@/pages/NotImplementedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navGroups } from './nav-config';

const implementedRoutes: RouteObject[] = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'data', element: <DatasetLibraryPage /> },
  { path: 'markets', element: <MarketExplorerPage /> },
  { path: 'scanner', element: <ScannerPage /> },
  { path: 'signals', element: <SignalQueuePage /> },
  { path: 'strategies', element: <StrategyLibraryPage /> },
  { path: 'backtests', element: <BacktestsPage /> },
  { path: 'simulator', element: <SimulatorPage /> },
  { path: 'simulator/orders', element: <SimulatedOrdersPage /> },
];

const implementedPaths = new Set([
  '/app/dashboard',
  '/app/data',
  '/app/markets',
  '/app/scanner',
  '/app/signals',
  '/app/strategies',
  '/app/backtests',
  '/app/simulator',
  '/app/simulator/orders',
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
