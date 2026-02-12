import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Package,
  Activity,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { serviceService } from '../services/serviceService';
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

const PAGE_SIZE = 5;

function StatCard({ title, value, icon: Icon, colorClass, loading }) {
  if (loading) {
    return (
      <Card className="flex items-center gap-4 p-5">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`} aria-hidden>
          <Icon className="size-6 text-white/90" />
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
        <Icon className="size-6 text-white/90" />
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
  const [recentPage, setRecentPage] = useState(1);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['dashboard', 'services'],
    queryFn: () => serviceService.getServices(),
    staleTime: 300_000, // Cache services longer
  });

  const stats = statsData?.data?.stats || {};
  const recentBookings = statsData?.data?.recentBookings || [];
  const recentActivity = statsData?.data?.recentActivity || [];

  const services = Array.isArray(servicesData) ? servicesData : (servicesData?.length ? servicesData : []);
  const totalServices = services.length;

  const categoryData = useMemo(() => {
    const byCat = {};
    services.forEach((s) => {
      const c = s.category || 'OTHER';
      byCat[c] = (byCat[c] || 0) + 1;
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [services]);

  const { paginatedItems: recentServices, totalPages, total } = useMemo(() => {
    const total = services.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (recentPage - 1) * PAGE_SIZE;
    const paginatedItems = services.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [services, recentPage]);

  const quickLinks = [
    { to: '/services/new', label: t('dashboard.newService'), icon: Plus },
    { to: '/users', label: t('dashboard.manageUsers'), icon: UserPlus },
    { to: '/bookings', label: t('nav.bookings'), icon: CalendarCheck },
    { to: '/invoices', label: t('nav.invoices'), icon: FileText },
    { to: '/products', label: t('nav.products'), icon: Package },
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
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 px-6 py-6 text-white shadow-lg"
      >
        <h2 className="text-xl font-semibold">{greeting}</h2>
        <p className="mt-1.5 text-sm text-indigo-100/90">{t('dashboard.platformActivity')}</p>
      </motion.section>

      {/* Quick actions */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="mb-3 text-sm font-medium text-slate-500">{t('dashboard.quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Icon className="size-4 text-slate-500" /> {label}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="overview-heading">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="mb-4 text-lg font-semibold text-slate-900">
          {t('dashboard.activityDistribution')}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title={t('dashboard.weeklyActivity')} />
            <CardBody className="pt-0">
              <div className="relative h-[280px] w-full min-h-[280px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
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
              <div className="relative h-[280px] w-full min-h-[280px] min-w-0">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
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
