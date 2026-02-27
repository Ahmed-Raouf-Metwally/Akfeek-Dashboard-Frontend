/**
 * Backend API base URL.
 * - In dev: use '' so requests go to same origin (localhost:5173) and Vite proxies /api to backend.
 *   Set VITE_API_URL in .env to where backend runs (e.g. http://localhost:3000 or 5000).
 * - In production: set VITE_API_URL to your backend URL.
 */
export const API_BASE_URL =
  import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '');