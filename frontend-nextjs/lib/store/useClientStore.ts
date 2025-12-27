'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'client-storage',
    }
  )
);

