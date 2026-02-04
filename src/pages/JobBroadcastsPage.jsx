import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Radio } from 'lucide-react';
import { broadcastService } from '../services/broadcastService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const PAGE_SIZE = 10;

function formatDate(d, locale = 'en-SA') {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString(locale, { dateStyle: 'short' });
}

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || b.customerId || '—';
}

function StatusBadge({ status, t }) {
  const colors = {
    BROADCASTING: 'bg-blue-100 text-blue-800',
    OFFERS_RECEIVED: 'bg-amber-100 text-amber-800',
    TECHNICIAN_SELECTED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-slate-100 text-slate-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {t(`broadcasts.status.${status}`) || status?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

function UrgencyBadge({ urgency, t }) {
  if (!urgency) return null;
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[urgency] || 'bg-slate-100 text-slate-700'}`}>
      {t(`broadcasts.urgency.${urgency}`) || urgency}
    </span>
  );
}

export default function JobBroadcastsPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['broadcasts', page, statusFilter],
    queryFn: () => broadcastService.getBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };
  
  const STATUS_OPTIONS = [
    { value: 'BROADCASTING', label: t('broadcasts.status.BROADCASTING') },
    { value: 'OFFERS_RECEIVED', label: t('broadcasts.status.OFFERS_RECEIVED') },
    { value: 'TECHNICIAN_SELECTED', label: t('broadcasts.status.TECHNICIAN_SELECTED') || 'Technician Selected' },
    { value: 'CANCELLED', label: t('finance.status.CANCELLED') },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('broadcasts.title')}</h1>
          <p className="text-sm text-slate-500">{t('broadcasts.subtitle')}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{t('broadcasts.title')}</h1>
          <p className="text-sm text-slate-500">{t('broadcasts.subtitle')}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{t('broadcasts.title')}</h1>
          <p className="text-sm text-slate-500">{t('broadcasts.subtitle')}</p>
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
            <Radio className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">{t('common.noData')}</h3>
            <p className="max-w-sm text-sm text-slate-500">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.id')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.customer')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('broadcasts.urgency.title')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.date')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.offers')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-[150px] truncate" title={b.id}>{b.id.substring(0,8)}...</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(b)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} t={t} />
                      </td>
                      <td className="px-4 py-3">
                        <UrgencyBadge urgency={b.urgency} t={t} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(b.createdAt, i18n.language)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {b._count?.offers ?? 0}
                      </td>
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
