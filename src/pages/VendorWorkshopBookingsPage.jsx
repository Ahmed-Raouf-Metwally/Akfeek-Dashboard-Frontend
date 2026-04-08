import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, CircleCheck, FileText, Play } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
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
  const { fmt } = useDateFormat();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [akfeekDocsBookingId, setAkfeekDocsBookingId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-workshop-bookings', page, statusFilter],
    queryFn: () => workshopService.getMyWorkshopBookings({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const {
    data: akfeekDocs,
    isLoading: akfeekDocsLoading,
    isError: akfeekDocsError,
    error: akfeekDocsErr,
  } = useQuery({
    queryKey: ['vendor-akfeek-docs', akfeekDocsBookingId],
    queryFn: () => workshopService.getAkfeekJourneyDocuments(akfeekDocsBookingId),
    enabled: Boolean(akfeekDocsBookingId),
    staleTime: 60_000,
  });

  const openAkfeekDocFile = async (bookingId, documentId) => {
    try {
      const blob = await workshopService.downloadAkfeekJourneyDocumentFile(bookingId, documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
      toast.error(e?.message || (isAr ? 'تعذر فتح الملف' : 'Could not open file'));
    }
  };

  const confirmMutation = useMutation({
    mutationFn: (id) => workshopService.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-workshop-bookings'] });
      toast.success(i18n.language === 'ar' ? 'تم تأكيد الحجز' : 'Booking confirmed');
    },
    onError: (err) => toast.error(err?.response?.data?.errorAr || err?.message || (i18n.language === 'ar' ? 'فشل التأكيد' : 'Failed to confirm')),
  });

  const startMutation = useMutation({
    mutationFn: (id) => workshopService.startBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-workshop-bookings'] });
      toast.success(i18n.language === 'ar' ? 'تم بدء تنفيذ الحجز' : 'Booking started');
    },
    onError: (err) => toast.error(err?.response?.data?.errorAr || err?.message || (i18n.language === 'ar' ? 'فشل بدء الحجز' : 'Failed to start')),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => workshopService.completeBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-workshop-bookings'] });
      toast.success(i18n.language === 'ar' ? 'تم إكمال الحجز' : 'Booking completed');
    },
    onError: (err) => toast.error(err?.response?.data?.errorAr || err?.message || (i18n.language === 'ar' ? 'فشل الإكمال' : 'Failed to complete')),
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
          <option value="IN_PROGRESS">{isAr ? 'قيد التنفيذ' : 'In progress'}</option>
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
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{b.bookingNumber || b.id?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{customerLabel(b)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(b.scheduledDate)}{b.scheduledTime ? ` ${b.scheduledTime}` : ''}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status === 'IN_PROGRESS' && isAr ? 'قيد التنفيذ' : b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAkfeekDocsBookingId(b.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="size-4 shrink-0 text-indigo-600" />
                            {isAr ? 'مستندات أكفيك' : 'Akfeek docs'}
                          </button>
                          {b.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => confirmMutation.mutate(b.id)}
                              disabled={confirmMutation.isPending}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                              <CheckCircle className="size-4" />
                              {isAr ? 'تأكيد' : 'Confirm'}
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => startMutation.mutate(b.id)}
                              disabled={startMutation.isPending}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
                            >
                              <Play className="size-4" />
                              {isAr ? 'بدء' : 'Start'}
                            </button>
                          )}
                          {(b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && (
                            <button
                              type="button"
                              onClick={() => completeMutation.mutate(b.id)}
                              disabled={completeMutation.isPending}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
                            >
                              <CircleCheck className="size-4" />
                              {isAr ? 'إكمال' : 'Complete'}
                            </button>
                          )}
                          <Link to={`/bookings/${b.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            {isAr ? 'عرض' : 'View'}
                          </Link>
                        </div>
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
                  pageSize={pagination.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={Boolean(akfeekDocsBookingId)}
        onClose={() => setAkfeekDocsBookingId(null)}
        title={isAr ? 'مستندات التأمين (خدمة أكفيك)' : 'Insurance documents (Akfeek)'}
        size="lg"
      >
        {!akfeekDocsBookingId ? null : akfeekDocsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : akfeekDocsError ? (
          <p className="text-sm text-red-600">{akfeekDocsErr?.message || (isAr ? 'فشل التحميل' : 'Failed to load')}</p>
        ) : !akfeekDocs?.hasAkfeekJourney || !(akfeekDocs.documents?.length > 0) ? (
          <p className="text-sm text-slate-600">
            {isAr
              ? 'لا توجد رحلة أكفيك مرتبطة بهذا الحجز أو لا توجد مستندات مرفوعة.'
              : 'No Akfeek journey linked to this booking, or no documents uploaded.'}
          </p>
        ) : (
          <div className="space-y-4">
            {akfeekDocs.journey && (
              <p className="text-xs text-slate-500">
                {isAr ? 'الخطوة الحالية:' : 'Current step:'}{' '}
                <span className="font-medium text-slate-700">{akfeekDocs.journey.currentStep}</span>
                {' · '}
                {isAr ? 'الحالة:' : 'Status:'}{' '}
                <span className="font-medium text-slate-700">{akfeekDocs.journey.status}</span>
              </p>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium text-slate-600">{isAr ? 'النوع' : 'Label'}</th>
                    <th className="px-3 py-2 text-start font-medium text-slate-600">{isAr ? 'الاسم' : 'File'}</th>
                    <th className="px-3 py-2 text-start font-medium text-slate-600">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="px-3 py-2 text-end font-medium text-slate-600">{isAr ? 'عرض' : 'Open'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {akfeekDocs.documents.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2 text-slate-800">{d.label}</td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-slate-600" title={d.originalName || ''}>
                        {d.originalName || '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{fmt(d.createdAt)}</td>
                      <td className="px-3 py-2 text-end">
                        <button
                          type="button"
                          onClick={() => openAkfeekDocFile(akfeekDocsBookingId, d.id)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {isAr ? 'فتح' : 'Open'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
