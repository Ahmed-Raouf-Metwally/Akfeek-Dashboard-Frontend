import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, User, ArrowRight, CalendarCheck } from 'lucide-react';
import { broadcastService } from '../services/broadcastService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';

const PAGE_SIZE = 10;

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || '—';
}

/** سائق/منفّذ السحب: فيندور الوينش (اسم النشاط) أو فني من العرض المختار أو الملف الشخصي */
function getSelectedDriver(b, isAr) {
  const offer = b.offers?.find((o) => o.isSelected);
  const booking = b.booking;
  const tech = booking?.technician;

  if (offer?.winch) {
    const w = offer.winch;
    const v = w.vendor;
    const trade =
      v && (isAr && v.businessNameAr ? v.businessNameAr : v?.businessName);
    const name = trade || w.nameAr || w.name || w.vendorName || w.vendorNameAr || tech?.email;
    const phone = v?.contactPhone ?? tech?.phone;
    if (name) return { name, phone, email: tech?.email };
  }

  if (tech?.vendorProfile?.vendorType === 'TOWING_SERVICE') {
    const vp = tech.vendorProfile;
    const name =
      (isAr && vp.businessNameAr ? vp.businessNameAr : null) || vp.businessName || tech.email;
    return {
      name,
      phone: vp.contactPhone || tech.phone,
      email: tech.email,
    };
  }

  if (offer?.technician) {
    const p = offer.technician.profile;
    const name =
      p?.firstName || p?.lastName
        ? [p.firstName, p.lastName].filter(Boolean).join(' ')
        : offer.technician.email;
    return { name, phone: offer.technician.phone, email: offer.technician.email };
  }

  if (tech?.profile && (tech.profile.firstName || tech.profile.lastName)) {
    const p = tech.profile;
    return {
      name: [p.firstName, p.lastName].filter(Boolean).join(' ') || tech.email,
      phone: tech.phone,
      email: tech.email,
    };
  }

  if (tech?.email) {
    return { name: tech.email, phone: tech.phone, email: tech.email };
  }

  return null;
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

export default function TowingRequestsPage() {
  const { t, i18n } = useTranslation();
  const { fmt } = useDateFormat();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['broadcasts', 'towing', page, statusFilter],
    queryFn: () =>
      broadcastService.getBroadcasts({
        type: 'towing',
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };
  const isAr = i18n.language === 'ar';

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
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'طلبات الونش' : 'Towing Requests'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'جميع طلبات السحب وسائق الونش المعيّن' : 'All towing requests and assigned driver'}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'طلبات الونش' : 'Towing Requests'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'جميع طلبات السحب وسائق الونش المعيّن' : 'All towing requests and assigned driver'}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'طلبات الونش' : 'Towing Requests'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'جميع طلبات السحب وسائق الونش المعيّن' : 'All towing requests and assigned driver'}</p>
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
            <Truck className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">{isAr ? 'لا توجد طلبات ونش' : 'No towing requests'}</h3>
            <p className="max-w-sm text-sm text-slate-500">{isAr ? 'لم يُنشأ أي طلب سحب حتى الآن.' : 'No towing requests have been created yet.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'رقم الحجز' : 'Booking'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'موقع الالتقاط' : 'Pickup'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'الوجهة' : 'Destination'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'السعر' : 'Price'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'سائق الونش' : 'Towing driver'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'تفاصيل' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => {
                    const driver = getSelectedDriver(b, isAr);
                    const booking = b.booking;
                    const pickupText = booking?.pickupAddress || b.locationAddress || '';
                    const destinationText = booking?.destinationAddress || '';
                    return (
                      <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          {booking?.id ? (
                            <Link to={`/bookings/${booking.id}`} className="font-mono text-sm font-medium text-indigo-600 hover:underline">
                              {booking.bookingNumber || b.id.slice(0, 8)}
                            </Link>
                          ) : (
                            <span className="font-mono text-sm text-slate-600">{b.id.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <span className="font-medium">{customerLabel(b)}</span>
                          {b.customer?.phone && <div className="text-xs text-slate-500">{b.customer.phone}</div>}
                        </td>
                        <td className="max-w-[180px] px-4 py-3 text-sm text-slate-600" title={pickupText || undefined}>
                          {pickupText ? (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="size-3.5 shrink-0 text-slate-400" />
                              {pickupText}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="max-w-[180px] px-4 py-3 text-sm text-slate-600" title={destinationText || undefined}>
                          {destinationText ? (
                            <span className="flex items-center gap-1 truncate">
                              <ArrowRight className="size-3.5 shrink-0 text-slate-400" />
                              {destinationText}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} t={t} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          {booking?.totalPrice != null ? `${Number(booking.totalPrice).toFixed(0)} SAR` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {driver ? (
                            <span className="flex items-center gap-1">
                              <User className="size-3.5 shrink-0 text-slate-400" />
                              {driver.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">{isAr ? 'لم يُعيَّن بعد' : 'Not assigned'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{fmt(b.createdAt)}</td>
                        <td className="px-4 py-3 text-end">
                          <Link
                            to={`/broadcasts/${b.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <CalendarCheck className="size-3.5" />
                            {isAr ? 'تفاصيل البث' : 'Broadcast'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="border-t border-slate-100 p-4">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
