import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Truck, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { winchService } from '../services/winchService';
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
  TECHNICIAN_ASSIGNED: { ar: 'معيّن', en: 'Assigned' },
  TECHNICIAN_EN_ROUTE: { ar: 'في الطريق', en: 'En route' },
  ARRIVED: { ar: 'وصل', en: 'Arrived' },
  IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In progress' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed' },
};

function getStatusLabel(status, isAr) {
  const s = STATUS_LABELS[status];
  return s ? (isAr ? s.ar : s.en) : status;
}

export default function VendorWinchJobsPage() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['winch', 'my-jobs'],
    queryFn: () => winchService.getMyJobs(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const [updatingId, setUpdatingId] = useState(null);
  const updateStatus = useMutation({
    mutationFn: ({ jobId, status }) => winchService.updateJobStatus(jobId, status),
    onMutate: ({ jobId }) => setUpdatingId(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winch', 'my-jobs'] });
      setUpdatingId(null);
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: (err) => {
      setUpdatingId(null);
      toast.error(err?.message || (isAr ? 'فشل التحديث' : 'Update failed'));
    },
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'TOWING_SERVICE') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الونش فقط.' : 'This page is only for winch vendors.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
      </div>
    );
  }

  const jobs = data?.jobs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/vendor/winch"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          aria-label={isAr ? 'الونش' : 'My winch'}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'مهامي' : 'My jobs'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'الحجوزات التي قبل العميل عرضك عليها' : 'Bookings where the customer accepted your offer'}</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-slate-600">{isAr ? 'لا توجد مهام معينة حالياً.' : 'No assigned jobs at the moment.'}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const customerName = job.customer?.profile
              ? [job.customer.profile.firstName, job.customer.profile.lastName].filter(Boolean).join(' ')
              : job.customer?.email || (isAr ? 'عميل' : 'Customer');
            const nextStatus = NEXT_STATUS[job.status];
            const isUpdating = updatingId === job.id;

            return (
              <Card key={job.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium text-slate-900">{customerName}</p>
                    {job.bookingNumber && (
                      <p className="text-sm text-slate-500">#{job.bookingNumber}</p>
                    )}
                    {job.pickupAddress && (
                      <p className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="size-4 shrink-0 mt-0.5" /> {job.pickupAddress}
                      </p>
                    )}
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        job.status === 'IN_PROGRESS' || job.status === 'ARRIVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                    }`}>
                      {getStatusLabel(job.status, isAr)}
                    </span>
                  </div>
                  <div>
                    {nextStatus && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus.mutate({ jobId: job.id, status: nextStatus })}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <CheckCircle className="size-4" />
                        {isUpdating ? (isAr ? 'جاري...' : 'Updating...') : (isAr ? `تحديث → ${getStatusLabel(nextStatus, true)}` : `Update → ${getStatusLabel(nextStatus, false)}`)}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
