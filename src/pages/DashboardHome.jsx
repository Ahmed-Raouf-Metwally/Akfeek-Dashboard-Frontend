import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line no-unused-vars -- motion.section used in JSX
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Wrench,
  ExternalLink,
  Plus,
  UserPlus,
  FileText,
  Activity,
  ShoppingBag,
  Package,
  UserCircle,
  Star,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { serviceService } from '../services/serviceService';
import { autoPartService } from '../services/autoPartService';
import { marketplaceOrderService } from '../services/marketplaceOrderService';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  'rgb(99 102 241)',   // indigo-500
  'rgb(34 197 94)',    // green-500
  'rgb(245 158 11)',   // amber-500
  'rgb(59 130 246)',   // blue-500
  'rgb(139 92 246)',   // violet-500
  'rgb(236 72 153)',   // pink-500
];

const MOCK_CHART = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 18 },
  { name: 'Sat', count: 24 },
  { name: 'Sun', count: 14 },
];

function StatCard({ title, value, icon, colorClass, loading }) {
  const IconEl = icon;
  if (loading) {
    return (
      <Card className="flex items-center gap-4 p-5">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`} aria-hidden>
          <IconEl className="size-6 text-white/90" />
        </div>
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </Card>
    );
  }
  return (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`} aria-hidden>
        <IconEl className="size-6 text-white/90" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="truncate text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.profile?.firstName || user?.email?.split('@')[0] || '';
  const greeting = firstName ? t('dashboard.welcomeBack', { name: firstName }) : t('dashboard.welcomeToDashboard');
  const isVendor = user?.role === 'VENDOR';
  const vt = user?.vendorType;
  const isCareVendor = isVendor && vt === 'COMPREHENSIVE_CARE';
  const isCarWashVendor = isVendor && vt === 'CAR_WASH';
  const isWorkshopVendor = isVendor && vt === 'CERTIFIED_WORKSHOP';
  const isAutoPartsVendor = isVendor && !isCareVendor && !isCarWashVendor && !isWorkshopVendor;

  const { data: vendorParts = [], isLoading: partsLoading } = useQuery({
    queryKey: ['auto-parts', 'dashboard-count'],
    queryFn: () => autoPartService.getAutoParts({ limit: 1 }),
    enabled: isAutoPartsVendor,
    staleTime: 60_000,
  });
  const { data: vendorOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['marketplace-orders', 'vendor-dashboard'],
    queryFn: () => marketplaceOrderService.getVendorOrders({ page: 1, limit: 1 }),
    enabled: isAutoPartsVendor,
    staleTime: 60_000,
  });
  const myPartsCount = Array.isArray(vendorParts) ? vendorParts.length : (vendorParts?.length ?? 0);
  const myOrdersCount = vendorOrdersData?.pagination?.total ?? 0;

  const { data: myVendorProfile, isLoading: vendorProfileLoading } = useQuery({
    queryKey: ['vendor-profile-me'],
    queryFn: () => vendorService.getMyVendorProfile(),
    enabled: isVendor,
    staleTime: 60_000,
  });
  const vendorRating = myVendorProfile?.averageRating != null ? Number(myVendorProfile.averageRating) : 0;
  const vendorReviewsCount = myVendorProfile?.totalReviews ?? 0;

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
    retry: (failureCount, error) => error?.response?.status !== 403 && failureCount < 2,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['dashboard', 'services'],
    queryFn: () => serviceService.getServices(),
    staleTime: 300_000, // Cache services longer
  });

  const stats = statsError ? {} : (statsData?.data?.stats || {});
  const rawBookings = statsError ? [] : (statsData?.data?.recentBookings || []);
  const rawActivity = statsError ? [] : (statsData?.data?.recentActivity || []);
  // Only treat as activity if it looks like ActivityLog (action/entity), not e.g. WorkshopReview
  const recentActivity = Array.isArray(rawActivity)
    ? rawActivity.filter((log) => log && (log.action != null || log.entity != null))
    : [];
  // Only treat as booking if it looks like Booking (bookingNumber or status), not other entities
  const recentBookings = Array.isArray(rawBookings)
    ? rawBookings.filter((b) => b && (b.bookingNumber != null || b.status != null))
    : [];

  const services = useMemo(
    () => (Array.isArray(servicesData) ? servicesData : servicesData?.length ? servicesData : []),
    [servicesData]
  );
  const totalServices = services.length;

  const categoryData = useMemo(() => {
    const byCat = {};
    services.forEach((s) => {
      const c = s.category || 'OTHER';
      byCat[c] = (byCat[c] || 0) + 1;
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [services]);

  const quickLinks = [
    { to: '/services/new', label: t('dashboard.newService'), icon: Plus },
    { to: '/users', label: t('dashboard.manageUsers'), icon: UserPlus },
    { to: '/bookings', label: t('nav.bookings'), icon: CalendarCheck },
    { to: '/invoices', label: t('nav.invoices'), icon: FileText },
  ];

  const totalUsers = stats.totalUsers ?? 0;
  const totalBookingsCount = stats.totalBookings ?? 0;
  const revenue = stats.revenue ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-indigo-600 via-indigo-600 to-indigo-700 px-6 py-6 text-white shadow-lg"
      >
        <h2 className="text-xl font-semibold">{greeting}</h2>
        <p className="mt-1.5 text-sm text-indigo-100/90">
          {isCareVendor ? (i18n.language === 'ar' ? 'إدارة خدماتك وحجوزات العناية الشاملة' : 'Manage your services and comprehensive care appointments')
            : isCarWashVendor ? (i18n.language === 'ar' ? 'إدارة خدمات الغسيل والحجوزات' : 'Manage your car wash services and appointments')
            : isWorkshopVendor ? (i18n.language === 'ar' ? 'إدارة الورشة المعتمدة' : 'Manage your certified workshop')
            : isAutoPartsVendor ? (i18n.language === 'ar' ? 'إدارة منتجاتك وطلبات المتجر' : 'Manage your products and store orders')
            : t('dashboard.platformActivity')}
        </p>
      </motion.section>

      {/* فيندور العناية الشاملة: قسمه الخاص */}
      {isCareVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="vendor-section-heading"
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6"
        >
          <h2 id="vendor-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'قسمك (العناية الشاملة)' : 'Your section (Comprehensive Care)'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/vendor/comprehensive-care/services" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <Wrench className="size-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'خدماتي' : 'My services'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? `عدد الخدمات: ${totalServices}` : `${totalServices} service(s)`}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/comprehensive-care/bookings" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'الحجوزات' : 'Appointments'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'عرض وإدارة المواعيد' : 'View and manage appointments'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* فيندور خدمة الغسيل: قسمه الخاص */}
      {isCarWashVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="carwash-section-heading"
          className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6"
        >
          <h2 id="carwash-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'قسمك (خدمة الغسيل)' : 'Your section (Car Wash)'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/vendor/comprehensive-care/services" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <Wrench className="size-6 text-sky-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'خدماتي' : 'My services'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'إدارة خدمات الغسيل' : 'Manage car wash services'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/comprehensive-care/bookings" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'الحجوزات' : 'Appointments'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'عرض وإدارة المواعيد' : 'View and manage appointments'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* فيندور الورش المعتمدة: قسمه الخاص */}
      {isWorkshopVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="workshop-section-heading"
          className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6"
        >
          <h2 id="workshop-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'قسمك (الورش المعتمدة)' : 'Your section (Certified Workshop)'}
          </h2>
          <Link to="/workshops" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Wrench className="size-6 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'الورشة' : 'Workshop'}</p>
              <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'عرض وإدارة الورشة المعتمدة' : 'View and manage your certified workshop'}</p>
            </div>
            <ExternalLink className="size-5 shrink-0 text-slate-400" />
          </Link>
        </motion.section>
      )}

      {/* متوسط التقييم — يظهر لكل الفيندورات */}
      {isVendor && (myVendorProfile || vendorProfileLoading) && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Star className="size-6 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{i18n.language === 'ar' ? 'متوسط التقييم' : 'Average rating'}</p>
              <p className="text-xl font-bold text-slate-900">
                {vendorProfileLoading ? '...' : `${vendorRating.toFixed(1)} / 5`}
                {!vendorProfileLoading && vendorReviewsCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">({vendorReviewsCount} {i18n.language === 'ar' ? 'تقييم' : 'reviews'})</span>
                )}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* فيندور قطع الغيار: قسمه الخاص */}
      {isAutoPartsVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="autoparts-section-heading"
          className="rounded-2xl border border-violet-100 bg-violet-50/50 p-6"
        >
          <h2 id="autoparts-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'قسمك (قطع الغيار)' : 'Your section (Auto Parts)'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/auto-parts/new" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                <ShoppingBag className="size-6 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'منتجاتي' : 'My products'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? `عدد المنتجات: ${partsLoading ? '...' : myPartsCount}` : `${partsLoading ? '...' : myPartsCount} product(s)`}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/marketplace-orders" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <Package className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'طلبات المتجر' : 'Store orders'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? `عدد الطلبات: ${ordersLoading ? '...' : myOrdersCount}` : `${ordersLoading ? '...' : myOrdersCount} order(s)`}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Quick actions */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="mb-3 text-sm font-medium text-slate-500">{t('dashboard.quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          {isAutoPartsVendor ? (
            <>
              <Link to="/auto-parts/new" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Plus className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'إضافة منتج' : 'Add product'}
              </Link>
              <Link to="/auto-parts" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <ShoppingBag className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'منتجاتي' : 'My products'}
              </Link>
              <Link to="/marketplace-orders" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Package className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'طلبات المتجر' : 'Store orders'}
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <UserCircle className="size-4 text-slate-500" /> {t('nav.profile', 'Profile')}
              </Link>
            </>
          ) : (
            quickLinks.map(({ to, label, icon: linkIcon }) => {
              const LinkIcon = linkIcon;
              return (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <LinkIcon className="size-4 text-slate-500" /> {label}
                </Link>
              );
            })
          )}
        </div>
      </section>

      {isAutoPartsVendor && (
        <section aria-labelledby="vendor-overview-heading">
          <h2 id="vendor-overview-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/auto-parts" className="block transition-transform hover:scale-[1.02]">
              <StatCard
                title={i18n.language === 'ar' ? 'منتجاتي' : 'My products'}
                value={partsLoading ? '...' : String(myPartsCount)}
                icon={ShoppingBag}
                colorClass="bg-violet-500"
                loading={partsLoading}
              />
            </Link>
            <Link to="/marketplace-orders" className="block transition-transform hover:scale-[1.02]">
              <StatCard
                title={i18n.language === 'ar' ? 'طلبات المتجر' : 'Store orders'}
                value={ordersLoading ? '...' : String(myOrdersCount)}
                icon={Package}
                colorClass="bg-emerald-500"
                loading={ordersLoading}
              />
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="overview-heading" className={isAutoPartsVendor ? 'hidden' : ''}>
        <h2 id="overview-heading" className="mb-4 text-lg font-semibold text-slate-900">
          {t('dashboard.overview')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/users" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title={t('dashboard.totalUsers')}
              value={totalUsers.toLocaleString()}
              icon={Users}
              colorClass="bg-indigo-500"
              loading={statsLoading}
            />
          </Link>
          <Link to="/bookings" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title={t('dashboard.bookings')}
              value={totalBookingsCount.toLocaleString()}
              icon={CalendarCheck}
              colorClass="bg-emerald-500"
              loading={statsLoading}
            />
          </Link>
          <Link to="/services" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title={t('dashboard.services')}
              value={totalServices}
              icon={Wrench}
              colorClass="bg-amber-500"
              loading={servicesLoading}
            />
          </Link>
          <StatCard
            title={t('dashboard.revenueSAR')}
            value={revenue.toLocaleString()}
            icon={TrendingUp}
            colorClass="bg-blue-500"
            loading={statsLoading}
          />
        </div>
      </section>

      <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${isAutoPartsVendor ? 'hidden' : ''}`}>
        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="activity-heading" className="text-lg font-semibold text-slate-900">
              {t('dashboard.recentActivity')}
            </h2>
            <Link to="/activity" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <Card className="h-full overflow-hidden">
            {statsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
                {t('dashboard.noActivity')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Activity className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        <span className="font-mono text-xs text-indigo-600 mr-2">{log.action}</span>
                        {log.entity}
                      </p>
                      <div className="flex items-center text-xs text-slate-500 gap-2">
                        <span>{log.user?.profile?.firstName || log.user?.email || 'System'}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString(i18n.language)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Recent Bookings */}
        <section aria-labelledby="bookings-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="bookings-heading" className="text-lg font-semibold text-slate-900">
              {t('dashboard.recentBookings')}
            </h2>
            <Link to="/bookings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <Card className="h-full overflow-hidden">
            {statsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
                {t('dashboard.noBookings')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CalendarCheck className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {booking.vehicle?.vehicleModel?.name || 'Unknown Vehicle'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.bookingNumber} • {booking.customer?.profile?.firstName || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      <section aria-labelledby="chart-heading" className={`min-h-[320px] ${isAutoPartsVendor ? 'hidden' : ''}`}>
        <h2 id="chart-heading" className="mb-4 text-lg font-semibold text-slate-900">
          {t('dashboard.activityDistribution')}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title={t('dashboard.weeklyActivity')} />
            <CardBody className="pt-0">
              <div className="relative w-full min-w-0" style={{ width: '100%', height: 280, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280} debounce={50}>
                  <BarChart data={MOCK_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#0f172a' }}
                    />
                    <Bar dataKey="count" fill="rgb(99 102 241)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title={t('dashboard.servicesByCategory')} />
            <CardBody className="pt-0">
              <div className="relative w-full min-w-0" style={{ width: '100%', height: 280, minHeight: 280 }}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280} debounce={50}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, value }) => `${name} (${value})`}
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    {t('dashboard.noServices')}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Recent Services List from previous implementation or removed if not needed. Keeping charts instead. */}
    </div>
  );
}
