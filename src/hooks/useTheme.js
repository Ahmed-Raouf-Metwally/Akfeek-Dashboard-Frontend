import { useEffect } from 'react';
import { useDashboardSettingsStore } from '../store/dashboardSettingsStore';

/**
 * Applies the correct dark/light class on <html> based on the stored theme.
 * Call this once from App (or any top-level component) so it runs before paint.
 */
export function useTheme() {
  const theme = useDashboardSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      const dark = theme === 'dark' || (theme === 'system' && prefersDark);
      root.classList.toggle('dark', dark);
    };

    apply();

    // Re-apply when system preference changes (only relevant for 'system' mode)
    const mq =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    mq?.addEventListener('change', apply);
    return () => mq?.removeEventListener('change', apply);
  }, [theme]);
}

/**
 * Initialise theme synchronously BEFORE React renders to avoid flash of wrong theme.
 * Call this at the very top of main.jsx / index.jsx.
 */
export function initThemeSync() {
  try {
    const raw = localStorage.getItem('akfeek-dashboard-settings');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const theme = parsed?.state?.theme ?? 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
  } catch {
    // silently ignore — React will apply the correct theme after hydration
  }
}
