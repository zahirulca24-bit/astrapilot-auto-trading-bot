import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotImplementedPage } from '@/pages/NotImplementedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navGroups } from './nav-config';

// Dashboard is the only fully implemented page.
const dashboardRoute: RouteObject = {
  path: 'dashboard',
  element: <DashboardPage />,
};

// Every other approved nav entry renders the consistent placeholder.
const placeholderRoutes: RouteObject[] = navGroups
  .flatMap((g) => g.items)
  .filter((item) => item.path !== '/app/dashboard')
  .map((item) => {
    const relative = item.path.replace(/^\/app\//, '');
    return {
      path: relative,
      element: <NotImplementedPage title={item.label} />,
    };
  });

export const routes: RouteObject[] = [
  // Root-level routes redirect to the dashboard.
  { path: '/', element: <Navigate to="/app/dashboard" replace /> },
  // Unknown root-level routes also redirect to the dashboard.
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      dashboardRoute,
      ...placeholderRoutes,
      // Unknown /app/* routes render NotFoundPage inside the AppShell.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
