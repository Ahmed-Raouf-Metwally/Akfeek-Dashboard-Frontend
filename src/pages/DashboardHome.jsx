import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
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
import { userService } from '../services/userService';
import { serviceService } from '../services/serviceService';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

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
  const user = useAuthStore((s) => s.user);
  const firstName = user?.profile?.firstName || user?.email?.split('@')[0] || '';
  const name = firstName || 'Admin';
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome to your dashboard';
  const [recentPage, setRecentPage] = useState(1);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: () => userService.getUsers({ page: 1, limit: 1 }),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['dashboard', 'bookings'],
    queryFn: () => bookingService.getBookings({ page: 1, limit: 1 }),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['dashboard', 'services'],
    queryFn: () => serviceService.getServices(),
    staleTime: 60_000,
    retry: 1,
  });

  const totalUsers = usersData?.pagination?.total ?? 0;
  const totalBookings = bookingsData?.pagination?.total ?? 0;
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
    { to: '/services/new', label: 'New service', icon: Plus },
    { to: '/users', label: 'Manage users', icon: UserPlus },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/products', label: 'Products', icon: Package },
  ];

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
        <p className="mt-1.5 text-sm text-indigo-100/90">Here’s what’s happening across your platform.</p>
      </motion.section>

      {/* Quick actions */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="mb-3 text-sm font-medium text-slate-500">Quick actions</h2>
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
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/users" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              icon={Users}
              colorClass="bg-indigo-500"
              loading={usersLoading}
            />
          </Link>
          <Link to="/bookings" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title="Bookings"
              value={bookingsLoading ? '…' : totalBookings.toLocaleString()}
              icon={CalendarCheck}
              colorClass="bg-emerald-500"
              loading={bookingsLoading}
            />
          </Link>
          <Link to="/services" className="block transition-transform hover:scale-[1.02]">
            <StatCard
              title="Services"
              value={totalServices}
              icon={Wrench}
              colorClass="bg-amber-500"
              loading={servicesLoading}
            />
          </Link>
          <StatCard
            title="Revenue (SAR)"
            value="—"
            icon={TrendingUp}
            colorClass="bg-blue-500"
            loading={false}
          />
        </div>
      </section>

      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="mb-4 text-lg font-semibold text-slate-900">
          Activity & distribution
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title="Weekly activity" />
            <CardBody className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
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
            <CardHeader title="Services by category" />
            <CardBody className="pt-0">
              <div className="h-[280px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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
                    No services yet
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="recent-heading" className="text-lg font-semibold text-slate-900">
            Recent services
          </h2>
          <Link
            to="/services"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View all
          </Link>
        </div>
        <Card className="overflow-hidden">
          {servicesLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : recentServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <p>No services.</p>
              <Link to="/services/new" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Create one
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Duration
                      </th>
                      <th className="w-14 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentServices.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <ImageOrPlaceholder
                              src={s.imageUrl || s.icon}
                              alt={s.name}
                              className="size-10 shrink-0"
                              aspect="square"
                            />
                            <div className="min-w-0">
                              <span className="block font-medium text-slate-900">{s.name}</span>
                              {s.nameAr && (
                                <span className="block text-sm text-slate-500">{s.nameAr}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {s.category ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {s.type ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {s.estimatedDuration != null ? `${s.estimatedDuration} min` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/services/${s.id}`}
                            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label="View details"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={recentPage}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setRecentPage}
                disabled={servicesLoading}
              />
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
