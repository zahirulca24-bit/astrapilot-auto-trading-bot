import { NavLink } from 'react-router-dom';
import { ChevronLeft, Telescope, X } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { navGroups } from '@/routes/nav-config';
import { useUiStore } from '@/hooks/use-ui-store';

/** Shared navigation list used by both the desktop rail and mobile drawer. */
function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  return (
    <nav className="scrollbar-thin flex-1 overflow-y-auto py-2" aria-label="Primary navigation">
      {navGroups.map((group) => (
        <div key={group.id} className="mb-1 px-2">
          {!collapsed && (
            <div className="text-muted-app px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider">
              {group.label}
            </div>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                        collapsed && 'justify-center',
                        isActive
                          ? 'bg-elevated text-primary-app font-medium'
                          : 'text-secondary-app hover:bg-hover-surface hover:text-primary-app',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--simulation)]/15">
        <Telescope className="h-4 w-4 text-[var(--simulation)]" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-primary-app text-sm font-semibold">AstraPilot</div>
          <div className="text-muted-app text-[10px] uppercase tracking-wider">Research Terminal</div>
        </div>
      )}
    </div>
  );
}

/** Desktop / tablet sidebar: expanded (248px) or collapsed (72px) rail. */
export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'bg-panel border-app hidden shrink-0 flex-col border-r transition-[width] duration-200 sm:flex',
        collapsed ? 'w-[72px]' : 'w-[248px]',
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-app px-3',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Brand collapsed={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="text-muted-app hover:text-primary-app focus-ring rounded-md p-1 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <NavList />

      {collapsed && (
        <div className="border-t border-app p-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="text-muted-app hover:text-primary-app focus-ring flex w-full items-center justify-center rounded-md p-1.5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}
    </aside>
  );
}

/** Mobile overlay drawer (< 640px). Dark backdrop, ~272px width. */
export function MobileSidebar() {
  const open = useUiStore((s) => s.mobileSidebarOpen);
  const close = useUiStore((s) => s.closeMobileSidebar);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop — click outside to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close navigation menu"
        onClick={close}
        tabIndex={-1}
      />
      {/* Drawer panel */}
      <div className="bg-panel border-app absolute inset-y-0 left-0 flex w-[272px] max-w-[85vw] flex-col border-r shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-app px-3">
          <Brand collapsed={false} />
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation menu"
            className="text-muted-app hover:text-primary-app focus-ring rounded-md p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* NavList inside the drawer always shows expanded labels. */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileNavList onNavigate={close} />
        </div>
      </div>
    </div>
  );
}

/** Expanded-only nav list variant for the mobile drawer. */
function MobileNavList({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="scrollbar-thin flex-1 overflow-y-auto py-2" aria-label="Primary navigation">
      {navGroups.map((group) => (
        <div key={group.id} className="mb-1 px-2">
          <div className="text-muted-app px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-elevated text-primary-app font-medium'
                          : 'text-secondary-app hover:bg-hover-surface hover:text-primary-app',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
