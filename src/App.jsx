import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import UsersPage from './pages/UsersPage';
import ServicesPage from './pages/ServicesPage';
import CreateServicePage from './pages/CreateServicePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BrandsPage from './pages/BrandsPage';
import VehicleModelsPage from './pages/VehicleModelsPage';
import BookingsPage from './pages/BookingsPage';
import ProductsPage from './pages/ProductsPage';
import InvoicesPage from './pages/InvoicesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    const t = setTimeout(() => hydrate(), 150);
    return () => clearTimeout(t);
  }, [hydrate]);

  useEffect(() => {
    const safety = setTimeout(() => {
      if (!isHydrated) setHydrated(true);
    }, 2500);
    return () => clearTimeout(safety);
  }, [isHydrated, setHydrated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<div className="mx-auto max-w-md p-6"><h1 className="text-xl font-semibold text-slate-900">Forgot password</h1><p className="mt-2 text-slate-500">Reset flow coming soon. Contact support or use the app.</p><Link to="/login" className="mt-4 inline-block font-semibold text-indigo-600 hover:text-indigo-700">Back to sign in</Link></div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/new" element={<CreateServicePage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="models" element={<VehicleModelsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="settings" element={<div className="rounded-xl border border-slate-200 bg-white p-6"><p className="text-slate-500">Settings — coming soon.</p></div>} />
          </Route>
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
          },
          success: { iconTheme: { primary: '#22c55e' } },
          error: { iconTheme: { primary: '#ef4444' } },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
