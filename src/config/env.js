/**
 * Backend API base URL (for API calls).
 * - In dev: use '' so requests go to same origin and Vite proxies /api to backend.
 * - In production: set VITE_API_URL to your backend URL.
 */
export const API_BASE_URL =
  import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '');

/**
 * Socket.IO URL — always points to the actual backend server (never Vite dev server).
 * - In dev: http://localhost:3000
 * - In production: VITE_API_URL
 */
export const SOCKET_BASE_URL = (() => {
  const v = import.meta.env.VITE_API_URL?.toString().replace(/\/$/, '');
  if (v) return v;
  if (import.meta.env.DEV) return 'http://localhost:3000';
  return '';
})();

/**
 * Base URL for static assets (uploads) — صور وملفات من الباكند.
 * لازم نستخدمه في <img src> عشان الطلب يروح للسيرفر اللي فيه الملفات.
 * في التطوير: نستخدم نفس عنوان الباكند (مثلاً 3000) حتى تظهر الصور.
 */
export const UPLOADS_BASE_URL = (() => {
  const v = import.meta.env.VITE_API_URL?.toString().replace(/\/$/, '');
  if (v) return v;
  if (import.meta.env.DEV) return 'http://localhost:3000';
  return (import.meta.env.VITE_API_URL || '').toString().replace(/\/$/, '') || '';
})();
