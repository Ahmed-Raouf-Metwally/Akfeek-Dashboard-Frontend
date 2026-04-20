import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Wrench, MapPin, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const NEXT_STATUS = {
  TECHNICIAN_ASSIGNED: 'TECHNICIAN_EN_ROUTE',
  TECHNICIAN_EN_ROUTE: 'ARRIVED',
  ARRIVED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

const STATUS_LABELS = {
  TECHNICIAN_ASSIGNED: { ar: 'معين', en: 'Assigned' },
  TECHNICIAN_EN_ROUTE: { ar: 'في الطريق', en: 'En route' },
  ARRIVED: { ar: 'وصل', en: 'Arrived' },
  IN_PROGRESS: { ar: 'جاري الإصلاح', en: 'In progress' },
  COMPLETED: { ar: 'تم الإصلاح', en: 'Completed' },
};

function getStatusLabel(status, isAr) {
  return STATUS_LABELS[status] ? (isAr ? STATUS_LABELS[status].ar : STATUS_LABELS[status].en) : status;
}

function customerName(customer, isAr) {
  const p = customer?.profile;
  const full = [p?.firstName, p?.lastName].filter(Boolean).join(' ');
  return full || customer?.email || (isAr ? 'عميل' : 'Customer');
}

export default function VendorMobileWorkshopJobsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-mobile-workshop-jobs'],
    queryFn: () => mobileWorkshopService.getMyJobs(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ bookingId, status }) => mobileWorkshopService.updateBookingStatus(bookingId, status),
    onMutate: ({ bookingId }) => setUpdatingId(bookingId),
    onSuccess: () => {
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ['vendor-mobile-workshop-jobs'] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: (err) => {
      setUpdatingId(null);
      toast.error(err?.message || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
    },
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'MOBILE_WORKSHOP') {
    return <Card className="p-8 text-center text-slate-600">{isAr ? 'هذه الصفحة لفيندور الورش المتنقلة فقط.' : 'This page is only for mobile workshop vendors.'}</Card>;
  }

  if (isLoading) {
    return <Card className="p-6"><Skeleton className="h-28 w-full" /></Card>;
  }

  const jobs = data?.jobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/vendor/mobile-workshop" className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'مهام الورشة المتنقلة' : 'Mobile Workshop Jobs'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'تحديث حالة الإصلاح خطوة بخطوة' : 'Update service status step-by-step'}</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-8 text-center">
          <Wrench className="mx-auto size-12 text-slate-300" />
          <p className="mt-3 text-slate-600">{isAr ? 'لا توجد مهام حالياً.' : 'No assigned jobs yet.'}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const nextStatus = NEXT_STATUS[job.status];
            const isUpdating = updatingId === job.id;
            return (
              <Card key={job.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{customerName(job.customer, isAr)}</p>
                    <p className="text-xs text-slate-400">#{job.bookingNumber || job.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-emerald-700">{Number(job.agreedPrice || 0)} {job.currency || 'SAR'}</span>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {getStatusLabel(job.status, isAr)}
                      </span>
                    </div>
                  </div>
                  {nextStatus && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus.mutate({ bookingId: job.id, status: nextStatus })}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <CheckCircle className="size-4" />
                      {isUpdating ? (isAr ? 'جاري...' : 'Updating...') : (isAr ? `تحديث -> ${getStatusLabel(nextStatus, true)}` : `Update -> ${getStatusLabel(nextStatus, false)}`)}
                    </button>
                  )}
                </div>

                {/* العنوان والتفاصيل */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  {(job.pickupAddress || job.pickupLat) && (
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <MapPin className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-slate-400">{isAr ? 'موقع العميل:' : 'Pickup:'}</span>
                        {job.pickupAddress && <p className="font-medium">{job.pickupAddress}</p>}
                        {(job.pickupLat && job.pickupLng) ? (
                          <a
                            href={`https://www.google.com/maps?q=${job.pickupLat},${job.pickupLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                          >
                            <MapPin className="size-3" />
                            {isAr ? 'فتح في الخريطة' : 'Open in Maps'}
                          </a>
                        ) : job.pickupAddress && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.pickupAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                          >
                            <MapPin className="size-3" />
                            {isAr ? 'بحث في الخريطة' : 'Search in Maps'}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {job.destinationAddress && (
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <MapPin className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-slate-400">{isAr ? 'الوجهة:' : 'Destination:'}</span>
                        <p>{job.destinationAddress}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.destinationAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-600 hover:underline"
                        >
                          <MapPin className="size-3" />
                          {isAr ? 'فتح في الخريطة' : 'Open in Maps'}
                        </a>
                      </div>
                    </div>
                  )}
                  {job.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="size-4 shrink-0 text-slate-400" />
                      <span>{job.scheduledDate}{job.scheduledTime ? ` — ${job.scheduledTime}` : ''}</span>
                    </div>
                  )}
                  {job.notes && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="size-4 shrink-0 text-slate-400 mt-0.5" />
                      <span>{job.notes}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

