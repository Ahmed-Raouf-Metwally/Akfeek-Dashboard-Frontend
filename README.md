# Akfeek Admin Dashboard

Professional admin dashboard for the Akfeek auto-services backend. Built with React, Vite, and connected to the backend REST API.

## Features

- **Backend integration**: REST API client with JWT auth, centralized services, error handling
- **Auth**: Login (email/phone + password), persisted session, role-based access (Admin)
- **UI/UX**: Responsive layout (sidebar + navbar), design tokens, loading skeletons, toasts (no `window.alert`)
- **Dashboard**: Analytics cards, charts (Recharts), stats from users & services
- **Users**: Data table with pagination, search, filters (role/status), actions (status change, delete) with modal confirmations
- **Services**: Data table, search, category filter, delete with confirmation
- **State**: Zustand (auth), TanStack Query (server state, cache, loading)

## Setup

1. **Backend**: Ensure [Akfeek-Backend](../Akfeek-Backend) is running (e.g. `npm run dev` on port 5000).

2. **Env** (optional):  
   - Copy `.env.example` to `.env`.  
   - Set `VITE_API_URL` if the backend is not at `http://localhost:5000`.  
   - In dev, if `VITE_API_URL` is unset, the app uses the same origin and Vite proxies `/api` to `http://localhost:5000`.

3. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
   Open the URL shown (e.g. `http://localhost:5173`).

## Admin user

The dashboard requires an **ADMIN** user. Create one via your database or backend (e.g. set `role = 'ADMIN'` for a user, or add an admin seed). Log in with that user’s email/phone and password.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build

## Tech stack

- React 19, Vite 7
- React Router 7
- TanStack Query (React Query)
- Zustand (persist for auth)
- Axios, react-hot-toast
- Recharts (dashboard charts)
