/**
 * Backend API base URL. Must match Akfeek-Backend port (see .env PORT / VITE_API_URL).
 * Default: http://localhost:3000 (same as backend DEFAULT_PORT).
 */
const DEFAULT_BACKEND_PORT = 3000;
const defaultBackendUrl = `http://localhost:${DEFAULT_BACKEND_PORT}`;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? defaultBackendUrl : defaultBackendUrl);