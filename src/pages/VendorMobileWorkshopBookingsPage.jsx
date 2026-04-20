import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Wrench, MapPin, Phone } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';

const NEXT_STATUS = {
  TECHNICIAN_ASSIGNED: 'TECHNICIAN_EN_ROUTE',
  TECHNICIAN_EN_ROUTE: 'ARRIVED',
  ARRIVED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

const STATUS_CONFIG = {
  TECHNICIAN_ASSIGNED: { ar: 'تم التعيين',    en: 'Assigned',    color: 'bg-amber-100 text-amber-800' },
  TECHNICIAN_EN_ROUTE: { ar: 'في الطريق',     en: 'En Route',    color: 'bg-blue-100 text-blue-800' },
  ARRIVED:             { ar: 'وصل',           en: 'Arrived',     color: 'bg-indigo-100 text-indigo-800' },
  IN_PROGRESS:         { ar: 'جاري التنفيذ',  en: 'In Progress', color: 'bg-sky-100 text-sky-800' },
  COMPLETED:           { ar: 'مكتمل',         en: 'Completed',   color: 'bg-green-100 text-green-800' },
  CANCELLED:           { ar: 'ملغي',          en: 'Cancelled',   color: 'bg-red-100 text-red-800' },
};

const NEXT_LABEL = {
  TECHNICIAN_EN_ROUTE: { ar: 'انطلقت',       en: 'En Route' },
  ARRIVED:             { ar: 'وصلت',         en: 'Arrived' },
  IN_PROGRESS:         { ar: 'بدء التنفيذ',  en: 'Start' },
  COMPLETED:           { ar: 'إكمال',        en: 'Complete' },
};

function StatusBadge({ status, isAr }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-slate-500">{status}</span>;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {isAr ? cfg.ar : cfg.en}
    </span>
  );
}

function customerLabel(job, isAr) {
  const p = job.customer?.profile;
  const full = [p?.firstName, p?.lastName].filter(Boolean).join(' ');
  return full || job.customer?.email || (isAr ? 'عميل' : 'Customer');
}

export default function VendorMobileWorkshopBookingsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { fmt } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-mobile-workshop-bookings'],
    queryFn: () => mobileWorkshopService.getMyJobs(),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const updateStatus = useMutation({
    mutationFn: ({ bookingId, status }) => mobileWorkshopService.updateBookingStatus(bookingId, status),
    onMutate: ({ bookingId }) => setUpdatingId(bookingId),
    onSuccess: () => {
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ['vendor-mobile-workshop-bookings'] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: (err) => {
      setUpdatingId(null);
      toast.error(err?.message || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
    },
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'MOBILE_WORKSHOP') {
    return (
      <Card className="p-8 text-center text-slate-600">
        {isAr ? 'هذه الصفحة لفيندور الورش المتنقلة فقط.' : 'This page is only for mobile workshop vendors.'}
      </Card>
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
        <Link to="/vendor/mobile-workshop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرجوع' : 'Back'}
        </Link>
        <Card className="p-8 text-center text-red-600">
          {error?.message || (isAr ? 'فشل تحميل الحجوزات' : 'Failed to load bookings')}
        </Card>
      </div>
    );
  }

  const allJobs = data?.jobs ?? [];
  const jobs = statusFilter ? allJobs.filter((j) => j.status === statusFilter) : allJobs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/mobile-workshop"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {isAr ? 'حجوزات الورشة المتنقلة' : 'Mobile Workshop Bookings'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAr ? 'الحجوزات المعينة لورشتك المتنقلة' : 'Bookings assigned to your mobile workshop'}
            </p>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="">{isAr ? 'كل الحالات' : 'All statuses'}</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{isAr ? cfg.ar : cfg.en}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="mx-auto size-12 text-slate-300" />
            <p className="mt-3 text-slate-500">
              {isAr ? 'لا توجد حجوزات' : 'No bookings yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'رقم الحجز' : 'Booking #'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-500">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {jobs.map((job) => {
                  const nextStatus = NEXT_STATUS[job.status];
                  const isUpdating = updatingId === job.id;
                  const nextLabel = nextStatus ? (isAr ? NEXT_LABEL[nextStatus]?.ar : NEXT_LABEL[nextStatus]?.en) : null;
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        #{job.bookingNumber || job.id?.slice(0, 8) || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{customerLabel(job, isAr)}</p>
                        {job.customer?.phone && (
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="size-3" /> {job.customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                        {Number(job.agreedPrice || 0).toFixed(0)} {job.currency || 'SAR'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} isAr={isAr} />
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {nextStatus && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => updateStatus.mutate({ bookingId: job.id, status: nextStatus })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                              <CheckCircle className="size-3.5" />
                              {isUpdating ? (isAr ? 'جاري...' : 'Updating...') : nextLabel}
                            </button>
                          )}
                          <Link
                            to={`/bookings/${job.id}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {isAr ? 'تفاصيل' : 'Details'}
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
    </div>
  );
}
