import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Eye, Truck } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';
import Pagination from '../components/ui/Pagination';
import { CURRENCY_SYMBOL } from '../constants/currency';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 50;
const ADMIN_REASON_PREFIX = 'Mobile workshop booking status update';

export default function MobileWorkshopVendorsPage() {
  const { i18n, t } = useTranslation();
  const { fmt } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['mobile-workshop-vendors', page],
    queryFn: () =>
      bookingService.getBookings({
        page,
        limit: PAGE_SIZE,
      }),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const bookingsRaw = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const mobileBookings = bookingsRaw.filter((b) => Boolean(b.mobileWorkshop?.id));

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) =>
      api.patch(`/bookings/${bookingId}/status`, {
        status,
        reason: `${ADMIN_REASON_PREFIX} -> ${status}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-vendors'] });
      toast.success(isAr ? 'تم تحديث حالة الحجز' : 'Booking status updated');
    },
    onError: (err) => toast.error(err?.response?.data?.error || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status')),
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة خاصة بالإدمن.' : 'This page is for admins only.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="overflow-hidden p-0">
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message || (isAr ? 'فشل تحميل البيانات' : 'Failed to load data')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
            <Truck className="size-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {isAr ? 'حجوزات الورش المتنقلة' : 'Mobile Workshop Bookings'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAr ? 'حجوزات الورش المتنقلة (المعينة) مع مقدم الخدمة.' : 'Assigned mobile workshop bookings with provider.'}
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {mobileBookings.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <CalendarCheck className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="font-medium text-slate-700">{isAr ? 'لا توجد حجوزات متاحة' : 'No bookings found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'رقم الحجز' : 'Booking'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'مقدم الخدمة (الفيندور)' : 'Provider'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'الوقت' : 'Time'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'الإجمالي' : 'Total'}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500">
                    {isAr ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {mobileBookings.map((b) => {
                  const vendorName = b?.mobileWorkshop?.vendor?.businessNameAr || b?.mobileWorkshop?.vendor?.businessName || '—';
                  const total = b?.totalPrice ?? b?.invoice?.totalAmount ?? b?.subtotal ?? 0;
                  const statusValue = b?.displayStatus ?? b?.status;
                  const statusLabel = t(`bookings.statusValues.${statusValue}`, statusValue);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{b.bookingNumber || b.id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{vendorName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {statusLabel || '—'}
                        </span>
                      </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{fmt(b.scheduledDate) ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{b.scheduledTime ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {total != null ? `${Number(total).toFixed(2)} ${CURRENCY_SYMBOL}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatusMutation.mutate({ bookingId: b.id, status: 'PENDING' })}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {isAr ? 'قيد الانتظار' : 'Pending'}
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatusMutation.mutate({ bookingId: b.id, status: 'CONFIRMED' })}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {isAr ? 'مؤكد' : 'Confirmed'}
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatusMutation.mutate({ bookingId: b.id, status: 'COMPLETED' })}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {isAr ? 'منتهي' : 'Completed'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm(isAr ? 'هل تريد إلغاء هذا الحجز؟' : 'Cancel this booking?')) return;
                            updateStatusMutation.mutate({ bookingId: b.id, status: 'CANCELLED' });
                          }}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        >
                          {isAr ? 'Cancel' : 'Cancel'}
                        </button>

                        <Link
                          to={`/bookings/${b.id}`}
                          className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label={isAr ? 'تفاصيل' : 'Details'}
                          title={isAr ? 'تفاصيل' : 'Details'}
                        >
                          <Eye className="size-5" />
                        </Link>
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.limit}
        onPageChange={setPage}
        disabled={isLoading}
      />
    </div>
  );
}

