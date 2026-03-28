import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Route } from 'lucide-react';
import { akfeekJourneyAdminService } from '../services/akfeekJourneyAdminService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';

const PAGE_SIZE = 20;

function customerLabel(j) {
  const c = j.customer;
  if (!c) return '—';
  return c.email || c.phone || c.id?.slice(0, 8) || '—';
}

function vehicleLabel(j) {
  const v = j.vehicle;
  if (!v) return '—';
  return v.plateDigits || v.id?.slice(0, 8) || '—';
}

function JourneyStatusBadge({ status, t }) {
  const colors = {
    ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    ABANDONED: 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-100',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}
    >
      {t(`akfeekJourney.status.${status}`, status)}
    </span>
  );
}

export default function AkfeekJourneysPage() {
  const { t, i18n } = useTranslation();
  const { fmt } = useDateFormat();
  const isAr = i18n.language === 'ar';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-akfeek-journeys', page, statusFilter],
    queryFn: () =>
      akfeekJourneyAdminService.list({
        page,
        limit: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    staleTime: 30_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const STATUS_OPTIONS = [
    { value: '', label: t('common.all', 'All') },
    { value: 'ACTIVE', label: t('akfeekJourney.status.ACTIVE', 'Active') },
    { value: 'COMPLETED', label: t('akfeekJourney.status.COMPLETED', 'Completed') },
    { value: 'ABANDONED', label: t('akfeekJourney.status.ABANDONED', 'Abandoned') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('akfeekJourney.title', 'Akfeek journeys')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('akfeekJourney.subtitle', 'Insurance and workshop guided journeys')}
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={6} cols={7} />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('akfeekJourney.title', 'Akfeek journeys')}
          </h1>
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
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            <Route className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('akfeekJourney.title', 'Akfeek journeys')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('akfeekJourney.subtitle', 'Insurance and workshop guided journeys')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('common.status', 'Status')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Route className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('akfeekJourney.empty', 'No journeys')}
            </h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {t('akfeekJourney.emptyDesc', 'No Akfeek journeys match the selected filter.')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('common.id', 'ID')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('bookings.customer', 'Customer')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('common.vehicle', 'Vehicle')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('common.status', 'Status')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('akfeekJourney.currentStep', 'Current step')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('akfeekJourney.documents', 'Documents')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('bookings.date', 'Updated')}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('common.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((j) => (
                    <tr
                      key={j.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                    >
                      <td className="max-w-[120px] truncate px-4 py-3 font-mono text-sm text-slate-900 dark:text-slate-100" title={j.id}>
                        {j.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customerLabel(j)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{vehicleLabel(j)}</td>
                      <td className="px-4 py-3">
                        <JourneyStatusBadge status={j.status} t={t} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{j.currentStep}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {Array.isArray(j.documents) ? j.documents.length : 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{fmt(j.updatedAt)}</td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex flex-col items-end gap-1 sm:flex-row sm:justify-end sm:gap-3">
                          <Link
                            to={`/akfeek-journeys/${j.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                          >
                            {t('akfeekJourney.viewDetails', 'Details')}
                          </Link>
                          {j.workshopBookingId ? (
                            <Link
                              to={`/bookings/${j.workshopBookingId}`}
                              className="text-sm text-slate-600 underline decoration-slate-300 hover:text-indigo-600 dark:text-slate-400"
                            >
                              {isAr ? 'حجز الورشة' : 'Workshop booking'}
                            </Link>
                          ) : null}
                        </div>
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
