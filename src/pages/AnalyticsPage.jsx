import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Users,
  CalendarCheck,
  DollarSign,
  Filter,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { GlowButton } from '../components/ui/GlowButton';

const CHART_COLORS = [
  'rgb(99 102 241)',
  'rgb(34 197 94)',
  'rgb(245 158 11)',
  'rgb(59 130 246)',
  'rgb(139 92 246)',
  'rgb(236 72 153)',
];

const MOCK_WEEKLY = [
  { name: 'Mon', bookings: 24, revenue: 4200 },
  { name: 'Tue', bookings: 31, revenue: 5800 },
  { name: 'Wed', bookings: 28, revenue: 5100 },
  { name: 'Thu', bookings: 35, revenue: 6200 },
  { name: 'Fri', bookings: 42, revenue: 7500 },
  { name: 'Sat', bookings: 38, revenue: 6800 },
  { name: 'Sun', bookings: 29, revenue: 5300 },
];

const MOCK_CATEGORY = [
  { name: 'MAINTENANCE', value: 35 },
  { name: 'REPAIR', value: 28 },
  { name: 'CLEANING', value: 22 },
  { name: 'EMERGENCY', value: 15 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState('7d');

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('dashboard.analytics', 'Analytics')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('dashboard.analyticsSubtitle', 'Platform metrics and performance')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${range === r
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-200 hover:text-indigo-700'
                }`}
            >
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
          <GlowButton variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            {t('common.filter', 'Filter')}
          </GlowButton>
          <GlowButton variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            {t('common.export', 'Export')}
          </GlowButton>
        </div>
      </motion.div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { title: t('dashboard.totalUsers'), value: '12,847', icon: Users, color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10' },
          { title: t('dashboard.bookings'), value: '3,291', icon: CalendarCheck, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10' },
          { title: t('dashboard.revenueSAR'), value: '284,500', icon: DollarSign, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
          { title: t('dashboard.growth', 'Growth'), value: '+12.5%', icon: TrendingUp, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={item}>
              <AnimatedCard className="flex items-center gap-4 p-5">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="size-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </AnimatedCard>
            </motion.div>
          );
        })}
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatedCard className="overflow-hidden">
            <CardHeader
              title={t('dashboard.revenueTrend', 'Revenue trend')}
              subtitle="Last 7 days"
              action={
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  +8.2%
                </span>
              }
            />
            <CardBody className="pt-0">
              <div className="relative w-full min-w-0" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
                  <AreaChart data={MOCK_WEEKLY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="rgb(99 102 241)" strokeWidth={2} fill="url(#fillRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </AnimatedCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AnimatedCard className="overflow-hidden">
            <CardHeader
              title={t('dashboard.bookingsByDay', 'Bookings by day')}
              subtitle="Last 7 days"
            />
            <CardBody className="pt-0">
              <div className="relative w-full min-w-0" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
                  <BarChart data={MOCK_WEEKLY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Bar dataKey="bookings" fill="rgb(34 197 94)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </AnimatedCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedCard className="overflow-hidden">
          <CardHeader
            title={t('dashboard.servicesByCategory')}
            subtitle="Distribution by category"
          />
          <CardBody className="pt-0">
            <div className="relative w-full min-w-0" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300} debounce={50}>
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {MOCK_CATEGORY.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </AnimatedCard>
      </motion.div>
    </div>
  );
}
