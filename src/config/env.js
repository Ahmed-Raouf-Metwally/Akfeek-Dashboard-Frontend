/**
 * Environment configuration for the dashboard.
 * In dev with proxy: use same origin so Vite proxies /api to the backend.
 * Otherwise set VITE_API_URL to the backend URL (e.g. http://localhost:5000).
 */
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ? .replace(/\/$/, '') ||
    (
        import.meta.env.DEV ? '' : 'http://localhost:5000');