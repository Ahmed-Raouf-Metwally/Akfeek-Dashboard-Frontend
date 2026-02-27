import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { useDateFormat } from '../hooks/useDateFormat';

const PAGE_SIZE = 10;

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || '—';
}

export default function VendorWorkshopBookingsPage() {
  const { t, i18n } = useTranslation();
  const { fmt, fmtDT } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-workshop-bookings', page, statusFilter],
    queryFn: () => workshopService.getMyWorkshopBookings({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };
  const isAr = i18n.language === 'ar';

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'CERTIFIED_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الورش المعتمدة فقط.' : 'This page is only available for certified workshop vendors.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="overflow-hidden p-0"><TableSkeleton rows={5} cols={5} /></Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Link to="/vendor/workshop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرجوع للورشة' : 'Back to workshop'}
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{error?.message || (isAr ? 'فشل تحميل الحجوزات' : 'Failed to load bookings')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/workshop"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرجوع للورشة' : 'Back to workshop'}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'حجوزات الورشة' : 'Workshop Bookings'}</h1>
            <p className="text-sm text-slate-500">{isAr ? 'الحجوزات المرتبطة بالورشة المعتمدة' : 'Bookings for your certified workshop'}</p>
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="">{isAr ? 'كل الحالات' : 'All statuses'}</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {isAr ? 'لا توجد حجوزات' : 'No bookings yet'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'رقم الحجز' : 'Booking'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-500">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {list.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{b.id?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{customerLabel(b)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(b.scheduledDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Link to={`/bookings/${b.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          {isAr ? 'عرض' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
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
