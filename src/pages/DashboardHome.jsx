import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line no-unused-vars -- motion.section used in JSX
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../hooks/useDateFormat';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  CircleDollarSign,
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
  Truck,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
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
} from 'recharts';

// Chart data comes from API (statsData?.data?.chartWeeklyBookings)

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
  const { fmtDT } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.profile?.firstName || user?.email?.split('@')[0] || '';
  const greeting = firstName ? t('dashboard.welcomeBack', { name: firstName }) : t('dashboard.welcomeToDashboard');
  const isVendor = user?.role === 'VENDOR';
  const vt = user?.vendorType;
  const isCareVendor = isVendor && vt === 'COMPREHENSIVE_CARE';
  const isCarWashVendor = isVendor && vt === 'CAR_WASH';
  const isWorkshopVendor = isVendor && vt === 'CERTIFIED_WORKSHOP';
  const isMobileWorkshopVendor = isVendor && vt === 'MOBILE_WORKSHOP';
  const isWinchVendor = isVendor && vt === 'TOWING_SERVICE';
  const isAutoPartsVendor = isVendor && !isCareVendor && !isCarWashVendor && !isWorkshopVendor && !isMobileWorkshopVendor && !isWinchVendor;

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

  const { data: vendorRealStats, isLoading: vendorStatsLoading } = useQuery({
    queryKey: ['vendor-stats', myVendorProfile?.id],
    queryFn: () => vendorService.getVendorStats(myVendorProfile.id),
    enabled: !!myVendorProfile?.id,
    staleTime: 60_000,
  });

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    enabled: !isVendor, // Only for admin
    staleTime: 60_000,
    retry: (failureCount, error) => error?.response?.status !== 403 && failureCount < 2,
  });

  const stats = statsError ? {} : (statsData?.data?.stats || {});
  const rawBookings = statsError ? [] : (statsData?.data?.recentBookings || []);
  const rawActivity = statsError ? [] : (statsData?.data?.recentActivity || []);
  const chartWeeklyBookings = statsError ? [] : (statsData?.data?.chartWeeklyBookings || []);
  // Only treat as activity if it looks like ActivityLog (action/entity), not e.g. WorkshopReview
  const recentActivity = Array.isArray(rawActivity)
    ? rawActivity.filter((log) => log && (log.action != null || log.entity != null))
    : [];
  // Only treat as booking if it looks like Booking (bookingNumber or status), not other entities
  const recentBookings = Array.isArray(rawBookings)
    ? rawBookings.filter((b) => b && (b.bookingNumber != null || b.status != null))
    : [];

  const quickLinks = [
    { to: '/users', label: t('dashboard.manageUsers'), icon: UserPlus },
    { to: '/bookings', label: t('nav.bookings'), icon: CalendarCheck },
    { to: '/invoices', label: t('nav.invoices'), icon: FileText },
  ];

  const totalUsers = stats.totalUsers ?? 0;
  const totalBookingsCount = stats.totalBookings ?? 0;
  const revenue = stats.revenue ?? 0;
  const totalCommission = stats.totalCommission ?? 0;

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
          {isCareVendor ? t('dashboard.vendorManageCare')
            : isCarWashVendor ? t('dashboard.vendorManageCarWash')
              : isWorkshopVendor ? t('dashboard.vendorManageWorkshop')
                : isMobileWorkshopVendor ? (i18n.language === 'ar' ? 'إدارة ورشتك المتنقلة والرد على الطلبات' : 'Manage your mobile workshop and respond to requests')
                : isWinchVendor ? (i18n.language === 'ar' ? 'إدارة الونش والرد على طلبات السحب' : 'Manage your winch and respond to towing requests')
                : isAutoPartsVendor ? t('dashboard.vendorManageAutoParts')
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
          <div className="mb-4 flex items-center justify-between">
            <h2 id="vendor-section-heading" className="text-lg font-semibold text-slate-900">
              {t('dashboard.vendorCareOverview')}
            </h2>
            {vendorRealStats?.stats?.revenue != null && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase">{t('dashboard.vendorCareRevenue')}</p>
                <p className="text-lg font-bold text-indigo-600">{vendorRealStats.stats.revenue.toLocaleString()} SAR</p>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/vendor/comprehensive-care/services" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <Wrench className="size-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorCareMyServices')}</p>
                <p className="text-sm text-slate-500">
                  {t('dashboard.vendorCareManageServices')}
                </p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/comprehensive-care/bookings" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorCareBookings')}</p>
                <p className="text-sm text-slate-500">
                  {vendorStatsLoading ? '...' : t('dashboard.vendorCareBookingsCount', { count: vendorRealStats?.stats?.completedBookings || 0 })}
                </p>
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
          <div className="mb-4 flex items-center justify-between">
            <h2 id="carwash-section-heading" className="text-lg font-semibold text-slate-900">
              {t('dashboard.vendorCarWashOverview')}
            </h2>
            {vendorRealStats?.stats?.revenue != null && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase">{t('dashboard.vendorCareRevenue')}</p>
                <p className="text-lg font-bold text-sky-600">{vendorRealStats.stats.revenue.toLocaleString()} SAR</p>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/vendor/comprehensive-care/services" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <Wrench className="size-6 text-sky-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorCarWashMyServices')}</p>
                <p className="text-sm text-slate-500">{t('dashboard.vendorCarWashManageServices')}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/car-wash/bookings" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorCareBookings')}</p>
                <p className="text-sm text-slate-500">
                  {vendorStatsLoading ? '...' : t('dashboard.vendorCarWashBookingsCount', { count: vendorRealStats?.stats?.completedBookings || 0 })}
                </p>
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
            {t('dashboard.vendorWorkshopSection')}
          </h2>
          <Link to="/workshops" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Wrench className="size-6 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{t('dashboard.vendorWorkshopTitle')}</p>
              <p className="text-sm text-slate-500">{t('dashboard.vendorWorkshopSubtitle')}</p>
            </div>
            <ExternalLink className="size-5 shrink-0 text-slate-400" />
          </Link>
        </motion.section>
      )}

      {/* فيندور الورش المتنقلة: قسمه الخاص */}
      {isMobileWorkshopVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="mobile-workshop-section-heading"
          className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6"
        >
          <h2 id="mobile-workshop-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'الورش المتنقلة' : 'Mobile Workshop'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/vendor/mobile-workshop" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <Wrench className="size-6 text-sky-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'ورشتي المتنقلة' : 'My Mobile Workshop'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'عرض بيانات ورشتي' : 'View my workshop details'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/mobile-workshop/requests" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <CalendarCheck className="size-6 text-sky-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'طلبات ورشتي' : 'Requests'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'الرد على الطلبات بعروض' : 'Respond to requests with offers'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/mobile-workshop/jobs" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md sm:col-span-2">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'مهام الإصلاح' : 'Repair Jobs'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'تحديث حالة الحجز: في الطريق -> وصل -> جاري الإصلاح -> تم' : 'Update booking progress from en route to completed'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* فيندور الونش (السطحه): قسمه الخاص */}
      {isWinchVendor && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          aria-labelledby="winch-section-heading"
          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6"
        >
          <h2 id="winch-section-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {i18n.language === 'ar' ? 'الونش / السطحه' : 'Winch / Towing'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link to="/vendor/winch" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Truck className="size-6 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'صفحة الونش' : 'My Winch'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'عرض بيانات الوينش' : 'View winch details'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/winch/requests" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <CalendarCheck className="size-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'طلبات قريبة' : 'Nearby requests'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'إرسال عرض على الطلبات' : 'Submit offers on requests'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/vendor/winch/jobs" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{i18n.language === 'ar' ? 'مهامي' : 'My jobs'}</p>
                <p className="text-sm text-slate-500">{i18n.language === 'ar' ? 'الحجوزات المعينة لوينشي' : 'Assigned bookings'}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
          </div>
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
              <p className="text-sm font-medium text-slate-600">{t('dashboard.vendorWorkshopRating')}</p>
              <p className="text-xl font-bold text-slate-900">
                {vendorProfileLoading ? '...' : `${vendorRating.toFixed(1)} / 5`}
                {!vendorProfileLoading && vendorReviewsCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">({t('dashboard.vendorWorkshopReviews', { count: vendorReviewsCount })})</span>
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
            {t('dashboard.vendorAutoPartsSection')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/auto-parts/new" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                <ShoppingBag className="size-6 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorMyProducts')}</p>
                <p className="text-sm text-slate-500">{t('dashboard.vendorMyProductsCount', { count: partsLoading ? '...' : myPartsCount })}</p>
              </div>
              <ExternalLink className="size-5 shrink-0 text-slate-400" />
            </Link>
            <Link to="/marketplace-orders" className="flex items-center gap-4 rounded-xl border border-white bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <Package className="size-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{t('dashboard.vendorStoreOrders')}</p>
                <p className="text-sm text-slate-500">{t('dashboard.vendorStoreOrdersCount', { count: ordersLoading ? '...' : myOrdersCount })}</p>
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
                <Plus className="size-4 text-slate-500" /> {t('dashboard.vendorAddProduct')}
              </Link>
              <Link to="/auto-parts" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <ShoppingBag className="size-4 text-slate-500" /> {t('dashboard.vendorMyProductsLink')}
              </Link>
              <Link to="/marketplace-orders" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Package className="size-4 text-slate-500" /> {t('dashboard.vendorStoreOrdersLink')}
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <UserCircle className="size-4 text-slate-500" /> {t('nav.profile', 'Profile')}
              </Link>
            </>
          ) : isMobileWorkshopVendor ? (
            <>
              <Link to="/vendor/mobile-workshop" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Wrench className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'ورشتي المتنقلة' : 'My Mobile Workshop'}
              </Link>
              <Link to="/vendor/mobile-workshop/requests" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <CalendarCheck className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'طلبات ورشتي' : 'Requests'}
              </Link>
              <Link to="/vendor/mobile-workshop/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <CalendarCheck className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'مهام الإصلاح' : 'Repair Jobs'}
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <UserCircle className="size-4 text-slate-500" /> {t('nav.profile', 'Profile')}
              </Link>
            </>
          ) : isWinchVendor ? (
            <>
              <Link to="/vendor/winch" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Truck className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'صفحة الونش' : 'My Winch'}
              </Link>
              <Link to="/vendor/winch/requests" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <CalendarCheck className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'طلبات قريبة' : 'Nearby requests'}
              </Link>
              <Link to="/vendor/winch/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <CalendarCheck className="size-4 text-slate-500" /> {i18n.language === 'ar' ? 'مهامي' : 'My jobs'}
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
            {t('dashboard.vendorOverview')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/auto-parts" className="block transition-transform hover:scale-[1.02]">
              <StatCard
                title={t('dashboard.vendorMyProductsTitle')}
                value={partsLoading ? '...' : String(myPartsCount)}
                icon={ShoppingBag}
                colorClass="bg-violet-500"
                loading={partsLoading}
              />
            </Link>
            <Link to="/marketplace-orders" className="block transition-transform hover:scale-[1.02]">
              <StatCard
                title={t('dashboard.vendorStoreOrdersTitle')}
                value={ordersLoading ? '...' : String(myOrdersCount)}
                icon={Package}
                colorClass="bg-emerald-500"
                loading={ordersLoading}
              />
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="overview-heading" className={isAutoPartsVendor || isMobileWorkshopVendor || isWinchVendor ? 'hidden' : ''}>
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
          <StatCard
            title={t('dashboard.revenueSAR')}
            value={revenue.toLocaleString()}
            icon={TrendingUp}
            colorClass="bg-blue-500"
            loading={statsLoading}
          />
          <Link to="/commission-report" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title={t('dashboard.platformCommissionSAR')}
              value={totalCommission.toLocaleString()}
              icon={CircleDollarSign}
              colorClass="bg-amber-500"
              loading={statsLoading}
            />
          </Link>
        </div>
      </section>

      <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${isAutoPartsVendor || isWinchVendor ? 'hidden' : ''}`}>
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
                        <span>{fmtDT(log.createdAt)}</span>
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
                        {booking.displayStatus ? t(`bookings.statusValues.${booking.displayStatus}`, booking.displayStatus) : booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      {!(isAutoPartsVendor || isWinchVendor) && (
        <section aria-labelledby="chart-heading" className="min-h-[320px]">
          <h2 id="chart-heading" className="mb-4 text-lg font-semibold text-slate-900">
            {t('dashboard.activityDistribution')}
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader title={t('dashboard.weeklyActivity')} />
              <CardBody className="pt-0">
                <div className="relative w-full min-w-0" style={{ width: '100%', height: 280, minHeight: 280 }}>
                  <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280} debounce={50}>
                    <BarChart data={chartWeeklyBookings.length ? chartWeeklyBookings : [{ name: '-', count: 0 }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          </div>
        </section>
      )}

      {/* Recent Services List from previous implementation or removed if not needed. Keeping charts instead. */}
    </div>
  );
}
