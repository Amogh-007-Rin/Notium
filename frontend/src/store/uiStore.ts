import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeNotifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      activeNotifications: [],

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addNotification: (n) => {
        const notification: Notification = {
          ...n,
          id: Math.random().toString(36).slice(2),
          timestamp: new Date(),
          read: false,
        };
        set((s) => ({ activeNotifications: [notification, ...s.activeNotifications].slice(0, 10) }));
      },

      markAllRead: () =>
        set((s) => ({
          activeNotifications: s.activeNotifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: 'notium-ui' }
  )
);
