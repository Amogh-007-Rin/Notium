import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/api/client';

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { access_token, user } = response.data;
        set({ token: access_token, user });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      },

      logout: () => {
        apiClient.post('/auth/logout').catch(() => {});
        delete apiClient.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: 'notium-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
