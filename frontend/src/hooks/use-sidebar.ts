import { create } from 'zustand'

export interface SidebarStore {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggle: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebar = create<SidebarStore>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () =>
    set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}))
