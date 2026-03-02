import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { RotateCcw, User } from 'lucide-react';
import { walletService } from '../services/walletService';
import { useAuthStore } from '../store/authStore';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../constants/currency';
const PAGE_SIZE = 10;

function userLabel(r) {
  const u = r.user;
  if (u?.profile?.firstName || u?.profile?.lastName) {
    return [u.profile.firstName, u.profile.lastName].filter(Boolean).join(' ');
  }
  return u?.email || u?.phone || r.userId || '—';
}

function StatusBadge({ status, isAr }) {
  const map = {
    PENDING: { label: isAr ? 'قيد الانتظار' : 'Pending', className: 'bg-amber-100 text-amber-800' },
    COMPLETED: { label: isAr ? 'مكتمل' : 'Completed', className: 'bg-emerald-100 text-emerald-800' },
    FAILED: { label: isAr ? 'فاشل' : 'Failed', className: 'bg-red-100 text-red-800' },
    CANCELLED: { label: isAr ? 'ملغى' : 'Cancelled', className: 'bg-slate-100 text-slate-600' },
  };
  const s = map[status] || { label: status || '—', className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function RefundsPage() {
  const { t, i18n } = useTranslation();
  const { fmt } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['refunds', page, statusFilter],
    queryFn: () =>
      walletService.getRefunds({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: isAr ? 'قيد الانتظار' : 'Pending' },
    { value: 'COMPLETED', label: isAr ? 'مكتمل' : 'Completed' },
    { value: 'FAILED', label: isAr ? 'فاشل' : 'Failed' },
    { value: 'CANCELLED', label: isAr ? 'ملغى' : 'Cancelled' },
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة متاحة للمسؤولين فقط.' : 'This page is only available for administrators.'}
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isAr ? 'الاستردادات' : 'Refunds'}
          </h1>
          <p className="text-sm text-slate-500">
            {isAr ? 'عرض معاملات الاسترداد للمحافظ.' : 'View wallet refund transactions.'}
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={5} cols={6} />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isAr ? 'الاستردادات' : 'Refunds'}
          </h1>
          <p className="text-sm text-slate-500">
            {isAr ? 'عرض معاملات الاسترداد للمحافظ.' : 'View wallet refund transactions.'}
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message ?? t('common.error')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isAr ? 'الاستردادات' : 'Refunds'}
          </h1>
          <p className="text-sm text-slate-500">
            {isAr ? 'عرض معاملات الاسترداد للمحافظ.' : 'View wallet refund transactions.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">{t('common.status')}</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">{t('common.all')}</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RotateCcw className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">
              {isAr ? 'لا توجد استردادات' : 'No refunds'}
            </h3>
            <p className="max-w-sm text-sm text-slate-500">
              {isAr ? 'لم تُسجّل أي معاملات استرداد في هذه الفترة.' : 'No refund transactions have been recorded.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {isAr ? 'رقم المعاملة' : 'Transaction #'}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {isAr ? 'المستخدم' : 'User'}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {isAr ? 'المبلغ' : 'Amount'} ({CURRENCY_SYMBOL})
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {isAr ? 'الوصف' : 'Description'}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('common.status')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {isAr ? 'التاريخ' : 'Date'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900">
                        {r.transactionNumber ?? r.id?.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <User className="size-4 text-slate-400" />
                          {userLabel(r)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {r.amount != null ? `${Number(r.amount).toFixed(2)} ${CURRENCY_SYMBOL}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={r.description}>
                        {r.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} isAr={isAr} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
              disabled={isLoading}
            />
          </>
        )}
      </Card>
    </div>
  );
}
