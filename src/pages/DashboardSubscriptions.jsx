import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * DashboardSubscriptions - Admin page to view all user package subscriptions
 * Shows: user subscriptions, usage count, remaining count, expiry date, status
 */
export default function DashboardSubscriptions() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    packageId: '',
    isActive: '',
  });

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-subscriptions', filters, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.packageId) params.append('packageId', filters.packageId);
      if (filters.isActive !== '') params.append('isActive', filters.isActive);
      if (search) params.append('search', search);

      try {
        const { data } = await api.get(`/packages/admin/subscriptions?${params}`);
        if (!data.success) throw new Error(data.error || 'Failed to load subscriptions');
        return data.data || [];
      } catch (err) {
        if (err.response?.status === 500) {
          return [];
        }
        throw err;
      }
    },
  });

  // Fetch packages for filter
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data } = await api.get('/packages');
      if (!data.success) throw new Error(data.error || 'Failed to load packages');
      return data.data || [];
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!subscriptions.length) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        totalRevenue: 0,
      };
    }

    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.isActive && !s.isExpired).length,
      expired: subscriptions.filter(s => s.isExpired).length,
      totalRevenue: subscriptions.reduce(
        (sum, s) => sum + (parseFloat(s.package.price) || 0),
        0
      ),
    };
  }, [subscriptions]);

  // Export to CSV
  const handleExport = () => {
    const headers = isAr
      ? ['المستخدم', 'البريد', 'الحزمة', 'السعر', 'المستخدم', 'المتبقي', 'انتهاء الصلاحية', 'الحالة']
      : ['User', 'Email', 'Package', 'Price', 'Used', 'Remaining', 'Expires', 'Status'];

    const rows = subscriptions.map(sub => [
      sub.user.fullName,
      sub.user.email,
      isAr ? sub.package.nameAr || sub.package.name : sub.package.name,
      sub.package.price,
      sub.usedCount,
      sub.remainingCount !== null ? sub.remainingCount : 'Unlimited',
      new Date(sub.expiresAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
      sub.isExpired ? (isAr ? 'منتهي' : 'Expired') : (sub.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {isAr ? 'الاشتراكات' : 'Subscriptions'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isAr ? 'إدارة اشتراكات المستخدمين والحزم' : 'Manage user subscriptions and packages'}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <Download className="h-4 w-4" />
          {isAr ? 'تحميل' : 'Export'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isAr ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            {isAr ? 'نشطة' : 'Active'}
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-700 dark:text-green-300">
            {stats.active}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            {isAr ? 'منتهية الصلاحية' : 'Expired'}
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
            {stats.expired}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.totalRevenue.toFixed(2)} SAR
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {isAr ? 'البحث والتصفية' : 'Search & Filter'}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن المستخدم...' : 'Search user...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
              />
            </div>

            {/* Package Filter */}
            <select
              value={filters.packageId}
              onChange={(e) =>
                setFilters({ ...filters, packageId: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
            >
              <option value="">
                {isAr ? 'جميع الحزم' : 'All Packages'}
              </option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {isAr ? pkg.nameAr || pkg.name : pkg.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
            >
              <option value="">{isAr ? 'جميع الحالات' : 'All Status'}</option>
              <option value="true">{isAr ? 'نشطة' : 'Active'}</option>
              <option value="false">{isAr ? 'معطلة' : 'Inactive'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">
                {isAr ? 'خطأ' : 'Error'}
              </h4>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                {error?.message || (isAr ? 'حدث خطأ ما' : 'Something went wrong')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {subscriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {isAr ? 'لا يوجد اشتراكات حاليه' : 'No current subscriptions'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'المستخدم' : 'User'}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'الحزمة' : 'Package'}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'السعر' : 'Price'}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'المستخدم' : 'Used'}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'المتبقي' : 'Remaining'}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'انتهاء الصلاحية' : 'Expires'}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'أيام متبقية' : 'Days Left'}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {sub.user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {sub.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isAr ? sub.package.nameAr || sub.package.name : sub.package.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sub.package.price} SAR
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white">
                      {sub.usedCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sub.remainingCount !== null ? (
                        <span className={sub.remainingCount === 0 ? 'text-red-600 dark:text-red-400' : ''}>
                          {sub.remainingCount}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          {isAr ? 'غير محدود' : 'Unlimited'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(sub.expiresAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-medium ${
                          sub.daysRemaining < 0
                            ? 'text-red-600 dark:text-red-400'
                            : sub.daysRemaining < 7
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {sub.daysRemaining < 0 ? 0 : sub.daysRemaining}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {sub.isExpired ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400">
                              {isAr ? 'منتهي' : 'Expired'}
                            </span>
                          </>
                        ) : sub.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">
                              {isAr ? 'نشط' : 'Active'}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            {isAr ? 'معطل' : 'Inactive'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
