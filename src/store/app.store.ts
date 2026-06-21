import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  showBalance: boolean;
  toggleSidebar: () => void;
  toggleBalance: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  showBalance: true,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleBalance: () => set((s) => ({ showBalance: !s.showBalance })),
}));
