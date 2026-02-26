import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useTheme } from './hooks/useTheme';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

/** Redirect vendor away from admin-only pages (e.g. ratings, points / متوسط التقييم) */
function AdminOnlyRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'VENDOR') return <Navigate to="/dashboard" replace />;
  return children;
}
import AdminCouponsPage from './pages/AdminCouponsPage';
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
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import WalletsPage from './pages/WalletsPage';
import PointsPage from './pages/PointsPage';
import RatingsPage from './pages/RatingsPage';
import JobBroadcastsPage from './pages/JobBroadcastsPage';
import BroadcastDetailPage from './pages/BroadcastDetailPage';
import TowingRequestsPage from './pages/TowingRequestsPage';
import InspectionsPage from './pages/InspectionsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import VendorsPage from './pages/VendorsPage';
import CreateVendorPage from './pages/CreateVendorPage';
import VendorDetailPage from './pages/VendorDetailPage';
import EditVendorPage from './pages/EditVendorPage';
import MyVendorRedirectPage from './pages/MyVendorRedirectPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
import AutoPartsPage from './pages/AutoPartsPage';
import CreateAutoPartPage from './pages/CreateAutoPartPage';
import AutoPartDetailPage from './pages/AutoPartDetailPage';
import EditAutoPartPage from './pages/EditAutoPartPage';
import AutoPartCategoriesPage from './pages/AutoPartCategoriesPage';
import CreateAutoPartCategoryPage from './pages/CreateAutoPartCategoryPage';
import EditAutoPartCategoryPage from './pages/EditAutoPartCategoryPage';
import MarketplaceOrdersPage from './pages/MarketplaceOrdersPage';
import MarketplaceOrderDetailPage from './pages/MarketplaceOrderDetailPage';
import MobileCarServicePage from './pages/MobileCarServicePage';
import MobileCarSubServiceNewPage from './pages/MobileCarSubServiceNewPage';
import MobileCarSubServiceDetailPage from './pages/MobileCarSubServiceDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WorkshopsPage from './pages/WorkshopsPage';
import WorkshopsCarWashPage from './pages/WorkshopsCarWashPage';
import WorkshopsComprehensiveCarePage from './pages/WorkshopsComprehensiveCarePage';
import WorkshopDetailPage from './pages/WorkshopDetailPage';
import FeedbackPage from './pages/FeedbackPage';
import TechnicalSupportRequestsPage from './pages/TechnicalSupportRequestsPage';
import VendorComprehensiveServicesPage from './pages/VendorComprehensiveServicesPage';
import VendorComprehensiveBookingsPage from './pages/VendorComprehensiveBookingsPage';
import VendorWorkshopPage from './pages/VendorWorkshopPage';
import VendorWorkshopBookingsPage from './pages/VendorWorkshopBookingsPage';
import VendorWorkshopEditPage from './pages/VendorWorkshopEditPage';
import VendorWorkshopServicesPage from './pages/VendorWorkshopServicesPage';
import VendorCouponsPage from './pages/VendorCouponsPage';
import VendorCarWashBookingsPage from './pages/VendorCarWashBookingsPage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  useTheme(); // Apply and keep dark/light/system in sync

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
          <Route path="/register" element={<Navigate to="/login" replace />} />
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
            <Route path="towing-requests" element={<TowingRequestsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="wallets" element={<WalletsPage />} />
            <Route path="points" element={<AdminOnlyRoute><PointsPage /></AdminOnlyRoute>} />
            <Route path="ratings" element={<AdminOnlyRoute><RatingsPage /></AdminOnlyRoute>} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="technical-support-requests" element={<TechnicalSupportRequestsPage />} />

            {/* Marketplace Routes */}
            <Route path="my-vendor" element={<MyVendorRedirectPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="vendors/onboarding" element={<VendorOnboardingPage />} />
            <Route path="vendors/new" element={<CreateVendorPage />} />
            <Route path="vendors/:id" element={<VendorDetailPage />} />
            <Route path="vendors/:id/edit" element={<EditVendorPage />} />
            <Route path="auto-parts" element={<AutoPartsPage />} />
            <Route path="auto-parts/new" element={<CreateAutoPartPage />} />
            <Route path="auto-parts/:id" element={<AutoPartDetailPage />} />
            <Route path="auto-parts/:id/edit" element={<EditAutoPartPage />} />
            <Route path="auto-part-categories" element={<AutoPartCategoriesPage />} />
            <Route path="auto-part-categories/new" element={<CreateAutoPartCategoryPage />} />
            <Route path="auto-part-categories/:id/edit" element={<EditAutoPartCategoryPage />} />
            <Route path="marketplace-orders" element={<MarketplaceOrdersPage />} />
            <Route path="marketplace-orders/:id" element={<MarketplaceOrderDetailPage />} />
            <Route path="coupons" element={<AdminOnlyRoute><AdminCouponsPage /></AdminOnlyRoute>} />

            {/* Workshops Routes */}
            <Route path="workshops" element={<WorkshopsPage />} />
            <Route path="car-wash" element={<WorkshopsCarWashPage />} />
            <Route path="comprehensive-care" element={<WorkshopsComprehensiveCarePage />} />
            <Route path="workshops/:id" element={<WorkshopDetailPage />} />

            {/* Vendor – Comprehensive Care (VENDOR only) */}
            <Route path="vendor/comprehensive-care/services" element={<VendorComprehensiveServicesPage />} />
            <Route path="vendor/comprehensive-care/bookings" element={<VendorComprehensiveBookingsPage />} />
            {/* Vendor – Coupons (كل فيندور) */}
            <Route path="vendor/coupons" element={<VendorCouponsPage />} />
            {/* Vendor – Certified Workshop (VENDOR only) */}
            <Route path="vendor/workshop" element={<VendorWorkshopPage />} />
            <Route path="vendor/workshop/bookings" element={<VendorWorkshopBookingsPage />} />
            <Route path="vendor/workshop/edit" element={<VendorWorkshopEditPage />} />
            <Route path="vendor/workshop/services" element={<VendorWorkshopServicesPage />} />
            {/* Vendor – Car Wash Bookings (CAR_WASH vendor) */}
            <Route path="vendor/car-wash/bookings" element={<VendorCarWashBookingsPage />} />
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
