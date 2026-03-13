import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarCheck, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';

function customerLabel(req) {
  const p = req.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return req.customer?.email || '—';
}

export default function VendorMobileWorkshopRequestsPage() {
  const { i18n } = useTranslation();
  const { fmtDT } = useDateFormat();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [offerModal, setOfferModal] = useState(null); // { request, workshopId }
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-mobile-workshop-requests'],
    queryFn: () => mobileWorkshopService.getMyRequests(),
    staleTime: 30_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const submitOfferMutation = useMutation({
    mutationFn: ({ workshopId, requestId, payload }) =>
      mobileWorkshopService.submitOffer(workshopId, requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-mobile-workshop-requests'] });
      setOfferModal(null);
      setOfferPrice('');
      setOfferMessage('');
      toast.success(i18n.language === 'ar' ? 'تم الموافقة وإرسال العرض للعميل' : 'Offer submitted');
    },
    onError: (err) => toast.error(err?.message || (i18n.language === 'ar' ? 'فشل إرسال العرض' : 'Failed to submit offer')),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ workshopId, requestId }) =>
      mobileWorkshopService.rejectRequest(workshopId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-mobile-workshop-requests'] });
      toast.success(i18n.language === 'ar' ? 'تم رفض الطلب' : 'Request rejected');
    },
    onError: (err) => toast.error(err?.message || (i18n.language === 'ar' ? 'فشل رفض الطلب' : 'Failed to reject')),
  });

  const requests = data?.data ?? [];
  const myWorkshopId = data?.myWorkshopId ?? null;
  const isAr = i18n.language === 'ar';

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'MOBILE_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة متاحة لمورد الورش المتنقلة فقط.' : 'This page is only available for mobile workshop vendors.'}
          </p>
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
        <Link to="/vendor/mobile-workshop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرجوع' : 'Back'}
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{error?.message || (isAr ? 'فشل تحميل الطلبات' : 'Failed to load requests')}</p>
        </Card>
      </div>
    );
  }

  const openOfferModal = (request) => {
    setOfferModal({ request, workshopId: myWorkshopId });
    setOfferPrice('');
    setOfferMessage('');
  };

  const handleReject = (request) => {
    if (!myWorkshopId || !request?.id) return;
    if (!window.confirm(i18n.language === 'ar' ? 'هل تريد رفض هذا الطلب؟ لن يظهر في قائمتك مرة أخرى.' : 'Reject this request? It will no longer appear in your list.')) return;
    rejectRequestMutation.mutate({ workshopId: myWorkshopId, requestId: request.id });
  };

  const handleSubmitOffer = () => {
    if (!offerModal?.workshopId || !offerModal?.request?.id) return;
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price < 0) {
      toast.error(isAr ? 'أدخل سعراً صحيحاً' : 'Enter a valid price');
      return;
    }
    submitOfferMutation.mutate({
      workshopId: offerModal.workshopId,
      requestId: offerModal.request.id,
      payload: { price, message: offerMessage || undefined },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/mobile-workshop"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرجوع' : 'Back'}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {isAr ? 'طلبات ورشتي' : 'My Workshop Requests'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAr ? 'يمكنك الموافقة على الطلب (مع إدخال سعر الخدمة وتفاصيلك) أو رفضه' : 'You can approve with your price and details, or reject the request'}
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {isAr ? 'لا توجد طلبات حالية يمكنك الرد عليها.' : 'No requests available to respond to.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'رقم الطلب' : 'Request'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'الخدمة / النوع' : 'Service / Type'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'الموقع' : 'Location'}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-500">
                    {isAr ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {req.requestNumber || req.id?.slice(0, 8) || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{customerLabel(req)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {req.workshopTypeService?.nameAr || req.workshopTypeService?.name || req.workshopType?.nameAr || req.workshopType?.name || req.serviceType || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {req.addressText || req.city || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{fmtDT(req.createdAt)}</td>
                    <td className="px-4 py-3 text-end">
                      {myWorkshopId && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openOfferModal(req)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                          >
                            <ThumbsUp className="size-4" /> {isAr ? 'موافق (سعر وتفاصيل)' : 'Approve (price & details)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(req)}
                            disabled={rejectRequestMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <ThumbsDown className="size-4" /> {isAr ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Offer modal */}
      {offerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Card className="w-full max-w-md p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {isAr ? 'إرسال عرض' : 'Submit offer'}
              </h3>
              <button
                type="button"
                onClick={() => setOfferModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              {isAr ? 'طلب: ' : 'Request: '}
              {offerModal.request?.requestNumber || offerModal.request?.id?.slice(0, 8)}
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {isAr ? 'السعر (ريال)' : 'Price (SAR)'} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder={isAr ? '0.00' : '0.00'}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {isAr ? 'رسالة (اختياري)' : 'Message (optional)'}
                </label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder={isAr ? 'تفاصيل إضافية للعميل' : 'Additional details for the customer'}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOfferModal(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSubmitOffer}
                disabled={submitOfferMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                <Send className="size-4" />
                {submitOfferMutation.isPending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'موافق وإرسال للعميل' : 'Approve & send to customer')}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
