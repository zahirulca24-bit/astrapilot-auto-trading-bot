import { create } from 'zustand';

interface UiState {
  /** Desktop/tablet: collapsed rail (72px) vs expanded (248px). */
  sidebarCollapsed: boolean;
  /** Mobile: overlay drawer open state. */
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const STORAGE_KEY = 'astrapilot.sidebar.collapsed';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: readInitial(),
  mobileSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
}));
