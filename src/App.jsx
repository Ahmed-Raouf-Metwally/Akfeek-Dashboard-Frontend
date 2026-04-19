import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { setTokenGetter } from './services/api';
import { useTheme } from './hooks/useTheme';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const AdminCouponsPage = lazy(() => import('./pages/AdminCouponsPage'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const EditUserPage = lazy(() => import('./pages/EditUserPage'));
const CreateUserPage = lazy(() => import('./pages/CreateUserPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const BrandDetailPage = lazy(() => import('./pages/BrandDetailPage'));
const VehicleModelsPage = lazy(() => import('./pages/VehicleModelsPage'));
const ModelDetailPage = lazy(() => import('./pages/ModelDetailPage'));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceDetailPage = lazy(() => import('./pages/InvoiceDetailPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const RefundsPage = lazy(() => import('./pages/RefundsPage'));
const WalletsPage = lazy(() => import('./pages/WalletsPage'));
const CommissionReportPage = lazy(() => import('./pages/CommissionReportPage'));
const PointsPage = lazy(() => import('./pages/PointsPage'));
const RatingsPage = lazy(() => import('./pages/RatingsPage'));
const JobBroadcastsPage = lazy(() => import('./pages/JobBroadcastsPage'));
const BroadcastDetailPage = lazy(() => import('./pages/BroadcastDetailPage'));
const AkfeekJourneysPage = lazy(() => import('./pages/AkfeekJourneysPage'));
const AkfeekJourneyDetailPage = lazy(() => import('./pages/AkfeekJourneyDetailPage'));
const TowingRequestsPage = lazy(() => import('./pages/TowingRequestsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TowingPricingPage = lazy(() => import('./pages/TowingPricingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const RolesPermissionsPage = lazy(() => import('./pages/RolesPermissionsPage'));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogsPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));
const CreateVendorPage = lazy(() => import('./pages/CreateVendorPage'));
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'));
const EditVendorPage = lazy(() => import('./pages/EditVendorPage'));
const WinchesPage = lazy(() => import('./pages/WinchesPage'));
const WinchDetailPage = lazy(() => import('./pages/WinchDetailPage'));
const CreateEditWinchPage = lazy(() => import('./pages/CreateEditWinchPage'));
const MyVendorRedirectPage = lazy(() => import('./pages/MyVendorRedirectPage'));
const VendorOnboardingPage = lazy(() => import('./pages/VendorOnboardingPage'));
const MobileWorkshopHierarchyPage = lazy(() => import('./pages/MobileWorkshopHierarchyPage'));
const AutoPartsPage = lazy(() => import('./pages/AutoPartsPage'));
const CreateAutoPartPage = lazy(() => import('./pages/CreateAutoPartPage'));
const AutoPartDetailPage = lazy(() => import('./pages/AutoPartDetailPage'));
const EditAutoPartPage = lazy(() => import('./pages/EditAutoPartPage'));
const AutoPartCategoriesPage = lazy(() => import('./pages/AutoPartCategoriesPage'));
const CreateAutoPartCategoryPage = lazy(() => import('./pages/CreateAutoPartCategoryPage'));
const EditAutoPartCategoryPage = lazy(() => import('./pages/EditAutoPartCategoryPage'));
const MarketplaceOrdersPage = lazy(() => import('./pages/MarketplaceOrdersPage'));
const MarketplaceOrderDetailPage = lazy(() => import('./pages/MarketplaceOrderDetailPage'));
const MarketplaceOrderInvoicePage = lazy(() => import('./pages/MarketplaceOrderInvoicePage'));
const MobileCarServicePage = lazy(() => import('./pages/MobileCarServicePage'));
const MobileCarSubServiceNewPage = lazy(() => import('./pages/MobileCarSubServiceNewPage'));
const MobileCarSubServiceDetailPage = lazy(() => import('./pages/MobileCarSubServiceDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'));
const WorkshopsCarWashPage = lazy(() => import('./pages/WorkshopsCarWashPage'));
const WorkshopsComprehensiveCarePage = lazy(() => import('./pages/WorkshopsComprehensiveCarePage'));
const WorkshopDetailPage = lazy(() => import('./pages/WorkshopDetailPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const TechnicalSupportRequestsPage = lazy(() => import('./pages/TechnicalSupportRequestsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const CreateEmployeePage = lazy(() => import('./pages/CreateEmployeePage'));
const EmployeePermissionsPage = lazy(() => import('./pages/EmployeePermissionsPage'));
const VendorComprehensiveServicesPage = lazy(() => import('./pages/VendorComprehensiveServicesPage'));
const VendorComprehensiveBookingsPage = lazy(() => import('./pages/VendorComprehensiveBookingsPage'));
const VendorWorkshopPage = lazy(() => import('./pages/VendorWorkshopPage'));
const VendorWorkshopBookingsPage = lazy(() => import('./pages/VendorWorkshopBookingsPage'));
const VendorWorkshopEditPage = lazy(() => import('./pages/VendorWorkshopEditPage'));
const VendorWorkshopServicesPage = lazy(() => import('./pages/VendorWorkshopServicesPage'));
const VendorCouponsPage = lazy(() => import('./pages/VendorCouponsPage'));
const VendorCarWashBookingsPage = lazy(() => import('./pages/VendorCarWashBookingsPage'));
const VendorMobileWorkshopPage = lazy(() => import('./pages/VendorMobileWorkshopPage'));
const VendorMobileWorkshopRequestsPage = lazy(() => import('./pages/VendorMobileWorkshopRequestsPage'));
const VendorMobileWorkshopJobsPage = lazy(() => import('./pages/VendorMobileWorkshopJobsPage'));
const VendorMobileWorkshopEditPage = lazy(() => import('./pages/VendorMobileWorkshopEditPage'));
const VendorWinchPage = lazy(() => import('./pages/VendorWinchPage'));
const VendorWinchEditPage = lazy(() => import('./pages/VendorWinchEditPage'));
const VendorWinchRequestsPage = lazy(() => import('./pages/VendorWinchRequestsPage'));
const VendorWinchJobsPage = lazy(() => import('./pages/VendorWinchJobsPage'));
const CustomerMobileWorkshopRequestsPage = lazy(() => import('./pages/CustomerMobileWorkshopRequestsPage'));
const CustomerMobileWorkshopRequestDetailPage = lazy(() => import('./pages/CustomerMobileWorkshopRequestDetailPage'));
const MobileWorkshopVendorsPage = lazy(() => import('./pages/MobileWorkshopVendorsPage'));
const BannersPage = lazy(() => import('./pages/BannersPage'));
const DashboardPackages = lazy(() => import('./pages/DashboardPackages'));
const DashboardSubscriptions = lazy(() => import('./pages/DashboardSubscriptions'));
const PackagesListPage = lazy(() => import('./pages/PackagesListPage'));
const MyPackagesPage = lazy(() => import('./pages/MyPackagesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AppAboutPage = lazy(() => import('./pages/AppAboutPage'));

/** Redirect non-admin (vendor, employee) away from admin-only pages (e.g. employees, ratings, points) */
function AdminOnlyRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400"
        aria-hidden
      />
    </div>
  );
}

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
    setTokenGetter(() => useAuthStore.getState().token);
  }, []);

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
        <Suspense fallback={<RouteFallback />}>
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
              <Route path="users/new" element={<CreateUserPage />} />
              <Route path="roles" element={<RolesPermissionsPage />} />
              <Route path="employees" element={<AdminOnlyRoute><EmployeesPage /></AdminOnlyRoute>} />
              <Route path="employees/new" element={<AdminOnlyRoute><CreateEmployeePage /></AdminOnlyRoute>} />
              <Route path="employees/:id/permissions" element={<AdminOnlyRoute><EmployeePermissionsPage /></AdminOnlyRoute>} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="activity" element={<ActivityLogsPage />} />
              <Route path="users/:id" element={<UserDetailPage />} />
              <Route path="users/:id/edit" element={<EditUserPage />} />
              <Route path="services" element={<Navigate to="/dashboard" replace />} />
              <Route path="services/new" element={<Navigate to="/dashboard" replace />} />
              <Route path="services/:id" element={<Navigate to="/dashboard" replace />} />
              <Route path="mobile-car-service" element={<MobileCarServicePage />} />
              <Route path="mobile-car-service/new" element={<MobileCarSubServiceNewPage />} />
              <Route path="mobile-car-service/:id" element={<MobileCarSubServiceDetailPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="brands/:id" element={<BrandDetailPage />} />
              <Route path="models" element={<VehicleModelsPage />} />
              <Route path="models/:id" element={<ModelDetailPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
              <Route path="broadcasts" element={<JobBroadcastsPage />} />
              <Route path="broadcasts/:id" element={<BroadcastDetailPage />} />
              <Route path="akfeek-journeys" element={<AdminOnlyRoute><AkfeekJourneysPage /></AdminOnlyRoute>} />
              <Route path="akfeek-journeys/:id" element={<AdminOnlyRoute><AkfeekJourneyDetailPage /></AdminOnlyRoute>} />
              <Route path="towing-requests" element={<TowingRequestsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="commission-report" element={<CommissionReportPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="refunds" element={<AdminOnlyRoute><RefundsPage /></AdminOnlyRoute>} />
              <Route path="wallets" element={<WalletsPage />} />
              <Route path="points" element={<AdminOnlyRoute><PointsPage /></AdminOnlyRoute>} />
              <Route path="ratings" element={<AdminOnlyRoute><RatingsPage /></AdminOnlyRoute>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="towing-pricing" element={<AdminOnlyRoute><TowingPricingPage /></AdminOnlyRoute>} />
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
              <Route path="winches" element={<WinchesPage />} />
              <Route path="winches/new" element={<CreateEditWinchPage />} />
              <Route path="winches/:id" element={<WinchDetailPage />} />
              <Route path="winches/:id/edit" element={<CreateEditWinchPage />} />
              <Route path="mobile-workshops" element={<MobileWorkshopHierarchyPage />} />
              <Route path="mobile-workshops/*" element={<Navigate to="/mobile-workshops" replace />} />
              <Route path="mobile-workshop-types/*" element={<Navigate to="/mobile-workshops" replace />} />
              <Route path="mobile-workshop-vendors" element={<MobileWorkshopVendorsPage />} />
              <Route path="auto-parts" element={<AutoPartsPage />} />
              <Route path="auto-parts/new" element={<CreateAutoPartPage />} />
              <Route path="auto-parts/:id" element={<AutoPartDetailPage />} />
              <Route path="auto-parts/:id/edit" element={<EditAutoPartPage />} />
              <Route path="auto-part-categories" element={<AutoPartCategoriesPage />} />
              <Route path="auto-part-categories/new" element={<CreateAutoPartCategoryPage />} />
              <Route path="auto-part-categories/:id/edit" element={<EditAutoPartCategoryPage />} />
              <Route path="marketplace-orders" element={<MarketplaceOrdersPage />} />
              <Route path="marketplace-orders/:id" element={<MarketplaceOrderDetailPage />} />
              <Route path="marketplace-orders/:id/invoice" element={<MarketplaceOrderInvoicePage />} />
              <Route path="coupons" element={<AdminOnlyRoute><AdminCouponsPage /></AdminOnlyRoute>} />
              <Route path="banners" element={<AdminOnlyRoute><BannersPage /></AdminOnlyRoute>} />

              {/* Packages Routes */}
              <Route path="packages" element={<PackagesListPage />} />
              <Route path="my-packages" element={<MyPackagesPage />} />
              <Route path="admin/packages" element={<AdminOnlyRoute><DashboardPackages /></AdminOnlyRoute>} />
              <Route path="admin/subscriptions" element={<AdminOnlyRoute><DashboardSubscriptions /></AdminOnlyRoute>} />

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
              {/* Vendor – Mobile Workshop (MOBILE_WORKSHOP vendor) */}
              <Route path="vendor/mobile-workshop" element={<VendorMobileWorkshopPage />} />
              <Route path="vendor/mobile-workshop/edit" element={<VendorMobileWorkshopEditPage />} />
              <Route path="vendor/mobile-workshop/requests" element={<VendorMobileWorkshopRequestsPage />} />
              <Route path="vendor/mobile-workshop/jobs" element={<VendorMobileWorkshopJobsPage />} />
              {/* Vendor – Winch / Towing (TOWING_SERVICE vendor) */}
              <Route path="vendor/winch" element={<VendorWinchPage />} />
              <Route path="vendor/winch/edit" element={<VendorWinchEditPage />} />
              <Route path="vendor/winch/requests" element={<VendorWinchRequestsPage />} />
              <Route path="vendor/winch/jobs" element={<VendorWinchJobsPage />} />
              {/* Customer – طلبات الورش المتنقلة (يرى كل الفيندورز اللي وافقوا + السعر والتفاصيل) */}
              <Route path="my-mobile-workshop-requests" element={<CustomerMobileWorkshopRequestsPage />} />
              <Route path="my-mobile-workshop-requests/:id" element={<CustomerMobileWorkshopRequestDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="app-about" element={<AdminOnlyRoute><AppAboutPage /></AdminOnlyRoute>} />
            </Route>
          </Routes>
        </Suspense>
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
