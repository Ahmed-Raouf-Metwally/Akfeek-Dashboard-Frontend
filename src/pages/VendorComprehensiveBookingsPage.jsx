import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Wrench, ArrowLeft, Eye } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';

const PAGE_SIZE = 10;

function formatDate(d, locale = 'ar-SA') {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString(locale, { dateStyle: 'short' });
}

function formatTime(t) {
  if (!t) return '';
  return t;
}

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || '—';
}

export default function VendorComprehensiveBookingsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const vendorType = user?.vendorType;
  const isCarWash = vendorType === 'CAR_WASH';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-comprehensive-bookings', page, statusFilter],
    queryFn: () => vendorService.getMyComprehensiveCareBookings({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };
  const isAr = i18n.language === 'ar';
  const isForbidden = error?.response?.status === 403;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="overflow-hidden p-0"><TableSkeleton rows={5} cols={5} /></Card>
      </div>
    );
  }

  const allowedVendor = vendorType === 'COMPREHENSIVE_CARE' || vendorType === 'CAR_WASH';
  if (user?.role === 'VENDOR' && !allowedVendor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/vendor/comprehensive-care/services" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="size-4" /> {isAr ? 'الرجوع للخدمات' : 'Back to services'}
          </Link>
        </div>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور العناية الشاملة أو خدمة الغسيل فقط.' : 'This page is only available for comprehensive care or car wash vendor accounts.'}</p>
        </Card>
      </div>
    );
  }
  if (isForbidden || (isError && !isLoading)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/vendor/comprehensive-care/services" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="size-4" /> {isAr ? 'الرجوع للخدمات' : 'Back to services'}
          </Link>
        </div>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور العناية الشاملة أو خدمة الغسيل فقط. سجّل الدخول بحساب فيندور.' : 'This page is only available for comprehensive care or car wash vendor accounts. Please sign in with a vendor account.'}</p>
        </Card>
      </div>
    );
  }

  const pageTitle = isCarWash ? (isAr ? 'حجوزات الغسيل' : 'Car wash appointments') : (isAr ? 'مواعيد الحجوزات' : 'Appointments');
  const pageSubtitle = isCarWash ? (isAr ? 'الحجوزات المرتبطة بخدمات الغسيل الخاصة بك' : 'Bookings for your car wash services') : (isAr ? 'الحجوزات المرتبطة بخدمات العناية الشاملة الخاصة بك' : 'Bookings for your comprehensive care services');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/comprehensive-care/services"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرجوع للخدمات' : 'Back to services'}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
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
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الخدمة' : 'Service'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-500">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {list.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{b.bookingNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(b)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {(b.services ?? []).map((bs) => bs.service?.nameAr || bs.service?.name).join(', ') || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {formatDate(b.scheduledDate)} {formatTime(b.scheduledTime) && ` ${formatTime(b.scheduledTime)}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">{b.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">{Number(b.totalPrice ?? 0).toFixed(2)} SAR</td>
                      <td className="px-4 py-3 text-end">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:border-indigo-200"
                        >
                          <Eye className="size-4" />
                          {isAr ? 'عرض التفاصيل' : 'View details'}
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
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={setPage}
                  pageSize={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
