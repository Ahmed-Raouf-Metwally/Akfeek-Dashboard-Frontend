import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { bookingService } from '../services/bookingService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';

const PAGE_SIZE = 10;

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || b.customerId || '—';
}

function technicianLabel(b) {
  if (!b.technician) return '—';
  const p = b.technician.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.technician.email || '—';
}

export default function BookingsPage() {
  const { t } = useTranslation();
  const { fmt } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', isAdmin ? 'all' : 'my', page, statusFilter],
    queryFn: () =>
      isAdmin
        ? bookingService.getBookings({ page, limit: PAGE_SIZE, status: statusFilter || undefined })
        : bookingService.getMyBookings({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: t('finance.status.PENDING') },
    { value: 'CONFIRMED', label: t('finance.status.CONFIRMED') || 'Confirmed' },
    { value: 'BROADCASTING', label: t('broadcasts.status.BROADCASTING') },
    { value: 'OFFERS_RECEIVED', label: t('broadcasts.status.OFFERS_RECEIVED') },
    { value: 'TECHNICIAN_ASSIGNED', label: t('broadcasts.status.TECHNICIAN_SELECTED') || 'Technician Assigned' },
    { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { value: 'IN_TRANSIT_PICKUP', label: 'In Transit (Pickup)' },
    { value: 'INSPECTING', label: 'Inspecting' },
    { value: 'QUOTE_PENDING', label: 'Quote Pending' },
    { value: 'QUOTE_APPROVED', label: 'Quote Approved' },
    { value: 'QUOTE_REJECTED', label: 'Quote Rejected' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'PARTS_NEEDED', label: 'Parts Needed' },
    { value: 'PARTS_ORDERED', label: 'Parts Ordered' },
    { value: 'PARTS_DELIVERED', label: 'Parts Delivered' },
    { value: 'COMPLETED', label: t('finance.status.COMPLETED') },
    { value: 'READY_FOR_DELIVERY', label: 'Ready for Delivery' },
    { value: 'IN_TRANSIT_DELIVERY', label: 'In Transit (Delivery)' },
    { value: 'DELIVERED', label: t('finance.status.DELIVERED') || 'Delivered' },
    { value: 'CANCELLED', label: t('finance.status.CANCELLED') },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('bookings.title')}</h1>
          <p className="text-sm text-slate-500">{t('bookings.manage') || 'Manage customer bookings.'}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{t('bookings.title')}</h1>
          <p className="text-sm text-slate-500">{t('bookings.manage') || 'Manage customer bookings.'}</p>
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
            {isAdmin ? t('bookings.title') : (i18n.language === 'ar' ? 'حجوزاتي' : 'My bookings')}
          </h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? (t('bookings.manage') || 'Manage customer bookings.') : (i18n.language === 'ar' ? 'عرض وإدارة حجوزاتك.' : 'View and manage your appointments.')}
          </p>
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
            <CalendarCheck className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">{t('bookings.noBookings')}</h3>
            <p className="max-w-sm text-sm text-slate-500">{t('bookings.noBookingsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.bookingId')}</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.customer')}</th>
                    )}
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.vehicle')}</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.technician')}</th>
                    )}
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.date')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.time')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('bookings.totalPrice')}</th>
                    <th className="w-20 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{b.bookingNumber ?? b.id}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(b)}</td>
                      )}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {b.vehicle?.plateNumber ?? (b.vehicle?.vehicleModel?.brand?.name
                          ? `${b.vehicle.vehicleModel.brand.name} ${b.vehicle.vehicleModel?.name ?? ''}`.trim()
                          : '—')}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-sm text-slate-600">{technicianLabel(b)}</td>
                      )}
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {b.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(b.scheduledDate)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{b.scheduledTime ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {b.totalPrice != null ? Number(b.totalPrice).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title={t('common.details')}
                          aria-label={t('common.details')}
                        >
                          <Eye className="size-5" />
                        </Link>
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
