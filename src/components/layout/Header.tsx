import { PanelLeftClose, PanelLeftOpen, Menu, Search, Bell, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUiStore } from '@/hooks/use-ui-store';

function OfflineBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border border-[var(--boundary-blocked)]/40 bg-[var(--boundary-blocked)]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--boundary-blocked)]"
      aria-label="Offline research mode"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--boundary-blocked)]" aria-hidden />
      Offline Research
    </span>
  );
}

export function Header() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const openMobile = useUiStore((s) => s.openMobileSidebar);

  return (
    <header className="bg-panel border-app sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-3">
      <div className="flex items-center gap-3">
        {/* Mobile: open overlay drawer */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openMobile}
          aria-label="Open navigation menu"
          className="text-secondary-app hover:text-primary-app hover:bg-hover-surface h-8 w-8 sm:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Desktop / tablet: collapse / expand rail */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="text-secondary-app hover:text-primary-app hover:bg-hover-surface hidden h-8 w-8 sm:inline-flex"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-primary-app text-sm font-semibold tracking-tight">AstraPilot</span>
        </div>

        <OfflineBadge />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-secondary-app hover:text-primary-app hover:bg-hover-surface gap-2"
          aria-label="Global search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
          <kbd className="text-muted-app bg-elevated ml-1 hidden rounded border px-1.5 text-[10px] md:inline">
            /
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Alerts"
          className="text-secondary-app hover:text-primary-app hover:bg-hover-surface relative h-8 w-8"
        >
          <Bell className="h-4 w-4" />
          <span
            className="bg-[var(--critical)] absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            aria-hidden
          />
        </Button>

        {/* Workspace: single non-interactive label. Switching is not functional. */}
        <div
          className="bg-elevated border-app text-secondary-app hidden items-center gap-1.5 rounded-md border px-2 py-1 text-xs sm:flex"
          aria-label="Current workspace"
          title="Workspace switching is not available in this build"
        >
          <Layers className="h-3.5 w-3.5 text-muted-app" aria-hidden />
          <span className="text-secondary-app">Default Workspace</span>
        </div>
      </div>
    </header>
  );
}
