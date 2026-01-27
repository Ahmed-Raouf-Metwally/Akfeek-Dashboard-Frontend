import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken, clearAuthToken } from '../services/api';
import authService from '../services/authService';

/**
 * Auth store: user, token, permissions.
 * Token is persisted; user is refetched on app load when token exists.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      setAuth: (user, token) => {
        if (token) {
          setAuthToken(token);
          set({ user, token });
        } else {
          set({ user: null, token: null });
          clearAuthToken();
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null });
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isAuthenticated: () => Boolean(get().token && get().user),

      /** Restore session from stored token. Call after persist rehydration or on app mount. */
      hydrate: async () => {
        const token = get().token;
        if (!token) {
          set({ isHydrated: true });
          return;
        }
        setAuthToken(token);
        try {
          const user = await authService.getMe();
          set({ user, token, isHydrated: true });
        } catch {
          clearAuthToken();
          set({ user: null, token: null, isHydrated: true });
        }
      },

      setHydrated: (v) => set({ isHydrated: v }),
    }),
    {
      name: 'akfeek-admin-auth',
      partialize: (s) => ({ token: s.token }),
      onRehydrateStorage: () => (state, err) => {
        if (err) return;
        // When rehydration finishes, trigger hydrate so isHydrated is set
        setTimeout(() => {
          try {
            useAuthStore.getState().hydrate();
          } catch (_) {}
        }, 0);
      },
    }
  )
);
