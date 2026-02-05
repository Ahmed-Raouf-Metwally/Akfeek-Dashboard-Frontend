import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_NAV = {
  dashboard: true,
  profile: true,
  users: true,
  roles: true,
  notifications: true,
  activity: true,
  services: true,
  mobileCarService: true,
  brands: true,
  models: true,
  bookings: true,
  products: true,
  invoices: true,
  settings: true,
};

/**
 * Dashboard UI settings: nav visibility, page size, theme, date format, compact mode.
 * Persisted to localStorage so Settings page "controls everything" in the dashboard.
 */
export const useDashboardSettingsStore = create(
  persist(
    (set, get) => ({
      navVisibility: { ...DEFAULT_NAV },
      defaultPageSize: 10,
      theme: 'light', // 'light' | 'dark' | 'system'
      dateFormat: 'short', // 'short' | 'medium' | 'long'
      compactMode: false,

      setNavVisible: (key, visible) => {
        set((s) => ({
          navVisibility: { ...s.navVisibility, [key]: visible },
        }));
      },

      setNavVisibility: (next) => {
        set((s) => ({
          navVisibility: typeof next === 'function' ? next(s.navVisibility) : { ...DEFAULT_NAV, ...next },
        }));
      },

      setDefaultPageSize: (size) => {
        set({ defaultPageSize: Math.min(100, Math.max(5, Number(size) || 10)) });
      },

      setTheme: (theme) => set({ theme: theme === 'dark' || theme === 'light' || theme === 'system' ? theme : 'light' }),
      setDateFormat: (format) => set({ dateFormat: ['short', 'medium', 'long'].includes(format) ? format : 'short' }),
      setCompactMode: (v) => set({ compactMode: Boolean(v) }),

      resetNav: () => set({ navVisibility: { ...DEFAULT_NAV } }),
      resetAll: () => set({
        navVisibility: { ...DEFAULT_NAV },
        defaultPageSize: 10,
        theme: 'light',
        dateFormat: 'short',
        compactMode: false,
      }),
    }),
    { name: 'akfeek-dashboard-settings' }
  )
);
