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
import UserDetailPage from './pages/UserDetailPage';
import EditUserPage from './pages/EditUserPage';
import ServicesPage from './pages/ServicesPage';
import CreateServicePage from './pages/CreateServicePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailPage from './pages/BrandDetailPage';
import VehicleModelsPage from './pages/VehicleModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import BookingsPage from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import WalletsPage from './pages/WalletsPage';
import PointsPage from './pages/PointsPage';
import RatingsPage from './pages/RatingsPage';
import JobBroadcastsPage from './pages/JobBroadcastsPage';
import BroadcastDetailPage from './pages/BroadcastDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import SupplyRequestsPage from './pages/SupplyRequestsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import VendorsPage from './pages/VendorsPage';
import CreateVendorPage from './pages/CreateVendorPage';
import VendorDetailPage from './pages/VendorDetailPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
import AutoPartsPage from './pages/AutoPartsPage';
import CreateAutoPartPage from './pages/CreateAutoPartPage';
import AutoPartDetailPage from './pages/AutoPartDetailPage';
import AutoPartCategoriesPage from './pages/AutoPartCategoriesPage';
import MarketplaceOrdersPage from './pages/MarketplaceOrdersPage';
import MarketplaceOrderDetailPage from './pages/MarketplaceOrderDetailPage';
import MobileCarServicePage from './pages/MobileCarServicePage';
import MobileCarSubServiceNewPage from './pages/MobileCarSubServiceNewPage';
import MobileCarSubServiceDetailPage from './pages/MobileCarSubServiceDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WorkshopsPage from './pages/WorkshopsPage';
import WorkshopDetailPage from './pages/WorkshopDetailPage';
import FeedbackPage from './pages/FeedbackPage';



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
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPermissionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="activity" element={<ActivityLogsPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/new" element={<CreateServicePage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="mobile-car-service" element={<MobileCarServicePage />} />
            <Route path="mobile-car-service/new" element={<MobileCarSubServiceNewPage />} />
            <Route path="mobile-car-service/:id" element={<MobileCarSubServiceDetailPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="brands/:id" element={<BrandDetailPage />} />
            <Route path="models" element={<VehicleModelsPage />} />
            <Route path="models/:id" element={<ModelDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="broadcasts" element={<JobBroadcastsPage />} />
            <Route path="broadcasts/:id" element={<BroadcastDetailPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="supply-requests" element={<SupplyRequestsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="wallets" element={<WalletsPage />} />
            <Route path="points" element={<PointsPage />} />
            <Route path="ratings" element={<RatingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="feedback" element={<FeedbackPage />} />

            {/* Marketplace Routes */}
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="vendors/onboarding" element={<VendorOnboardingPage />} />
            <Route path="vendors/new" element={<CreateVendorPage />} />
            <Route path="vendors/:id" element={<VendorDetailPage />} />
            <Route path="auto-parts" element={<AutoPartsPage />} />
            <Route path="auto-parts/new" element={<CreateAutoPartPage />} />
            <Route path="auto-parts/:id" element={<AutoPartDetailPage />} />
            <Route path="auto-part-categories" element={<AutoPartCategoriesPage />} />
            <Route path="marketplace-orders" element={<MarketplaceOrdersPage />} />
            <Route path="marketplace-orders/:id" element={<MarketplaceOrderDetailPage />} />

            {/* Workshops Routes */}
            <Route path="workshops" element={<WorkshopsPage />} />
            <Route path="workshops/:id" element={<WorkshopDetailPage />} />
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
