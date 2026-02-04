import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const PAGE_SIZE = 10;

function formatDate(d, locale = 'en-SA') {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString(locale, { dateStyle: 'short' });
}

function customerLabel(i) {
  const p = i.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return i.customer?.email || i.customer?.phone || i.customerId || '—';
}

export default function InvoicesPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', page, statusFilter],
    queryFn: () => invoiceService.getInvoices({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const STATUS_OPTIONS = [
    { value: 'DRAFT', label: t('finance.status.DRAFT') || 'Draft' },
    { value: 'PENDING', label: t('finance.status.PENDING') },
    { value: 'PAID', label: t('finance.status.PAID') },
    { value: 'PARTIALLY_PAID', label: t('finance.status.PARTIALLY_PAID') || 'Partially Paid' },
    { value: 'OVERDUE', label: t('finance.status.OVERDUE') || 'Overdue' },
    { value: 'CANCELLED', label: t('finance.status.CANCELLED') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('finance.invoices')}</h1>
          <p className="text-sm text-slate-500">{t('finance.invoices')}</p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={5} cols={5} />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('finance.invoices')}</h1>
          <p className="text-sm text-slate-500">{t('finance.invoices')}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{t('finance.invoices')}</h1>
          <p className="text-sm text-slate-500">{t('finance.manageInvoices') || 'View and manage invoices.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">{t('common.status')}</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">{t('common.all')}</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">{t('common.noData')}</h3>
            <p className="max-w-sm text-sm text-slate-500">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('finance.invoiceNumber')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.customer')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.totalPrice')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(inv)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {inv.amount != null ? Number(inv.amount).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3">
                         <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            inv.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-700'
                         }`}>
                           {t(`finance.status.${inv.status}`) || inv.status}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(inv.createdAt, i18n.language)}</td>
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
