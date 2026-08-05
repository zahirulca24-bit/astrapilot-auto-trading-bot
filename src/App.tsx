import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { routes } from '@/routes';
import { TooltipProvider } from '@/components/ui/tooltip';

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}
