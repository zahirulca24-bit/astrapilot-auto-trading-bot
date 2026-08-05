import { Outlet } from 'react-router-dom';

import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';
import { ContextBar } from './ContextBar';
import { OfflineBoundaryBanner } from '@/components/common/OfflineBoundaryBanner';

export function AppShell() {
  return (
    <div className="bg-app flex h-screen w-full overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <ContextBar />
        <main
          id="main-content"
          className="scrollbar-thin relative flex-1 overflow-y-auto"
          role="main"
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus-ring focus:absolute focus:left-2 focus:top-2 focus:z-40 focus:rounded focus:bg-elevated focus:px-3 focus:py-1.5 focus:text-sm"
          >
            Skip to content
          </a>
          <OfflineBoundaryBanner />
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
