import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, Truck, CheckCircle, Star } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

export default function CustomerMobileWorkshopRequestDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const { fmtDT } = useDateFormat();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [selectingOfferId, setSelectingOfferId] = useState(null);
  // When backend returns "acceptOnly" offers (price=0), customer must choose a service
  // (send mobileWorkshopServiceId) to proceed.
  const [selectedServiceIdByOffer, setSelectedServiceIdByOffer] = useState({});

  const { data: request, isLoading, isError, error } = useQuery({
    queryKey: ['customer-mobile-workshop-request', id],
    queryFn: () => mobileWorkshopService.getRequestByIdAsCustomer(id),
    enabled: !!id,
    staleTime: 30_000,
  });

  const selectOfferMutation = useMutation({
    mutationFn: ({ requestId, offerId, mobileWorkshopServiceId }) =>
      mobileWorkshopService.selectOfferAsCustomer(
        requestId,
        offerId,
        mobileWorkshopServiceId ? { mobileWorkshopServiceId } : {}
      ),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-mobile-workshop-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['customer-mobile-workshop-requests'] });
      setSelectingOfferId(null);
      setSelectedServiceIdByOffer({});
      toast.success(i18n.language === 'ar' ? 'تم اختيار العرض وإنشاء الحجز' : 'Offer selected; booking created');
    },
    onError: (err) => {
      setSelectingOfferId(null);
      toast.error(err?.message || (i18n.language === 'ar' ? 'فشل اختيار العرض' : 'Failed to select offer'));
    },
  });

  const offers = request?.offers ?? [];
  const isAr = i18n.language === 'ar';

  if (user?.role !== 'CUSTOMER') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة للعملاء فقط.' : 'This page is for customers only.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-40 w-full" /></Card>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="space-y-6">
        <Link to="/my-mobile-workshop-requests" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرجوع للطلبات' : 'Back to requests'}
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{error?.message || (isAr ? 'الطلب غير موجود' : 'Request not found')}</p>
        </Card>
      </div>
    );
  }

  const handleSelectOffer = (offer) => {
    if (!request?.id) return;

    const isAcceptOnlyOffer = Boolean(offer?.acceptOnly) || Number(offer?.price) === 0;
    const chosenServiceId = isAcceptOnlyOffer ? selectedServiceIdByOffer[offer.id] : undefined;
    if (isAcceptOnlyOffer && !chosenServiceId) {
      toast.error(isAr ? 'اختر خدمة أولاً' : 'Please select a service first');
      return;
    }

    setSelectingOfferId(offer.id);
    selectOfferMutation.mutate({
      requestId: request.id,
      offerId: offer.id,
      mobileWorkshopServiceId: chosenServiceId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/my-mobile-workshop-requests"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isAr ? 'تفاصيل الطلب' : 'Request details'}
          </h1>
          <p className="text-sm text-slate-500">
            {request.requestNumber || request.id?.slice(0, 8)} — {request.workshopType?.nameAr || request.workshopType?.name}
          </p>
        </div>
      </div>

      <Card className="p-4">
        <p className="text-sm text-slate-600">
          {request.addressText || request.city ? `${request.addressText || ''} ${request.city || ''}`.trim() : '—'}
        </p>
        <p className="text-sm text-slate-500 mt-1">{fmtDT(request.createdAt)}</p>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          {isAr ? 'الورش التي وافقت على الطلب (السعر والتفاصيل)' : 'Workshops that approved (price & details)'}
        </h2>
        {offers.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            {isAr ? 'لا توجد عروض حتى الآن. انتظر رد الورش.' : 'No offers yet. Waiting for workshops to respond.'}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((offer) => {
              const workshop = offer.mobileWorkshop;
              const name = workshop?.nameAr || workshop?.name;
              const businessName = workshop?.vendor?.businessNameAr || workshop?.vendor?.businessName;
              const price = offer.price != null ? Number(offer.price) : null;
              const isSelecting = selectingOfferId === offer.id;
              const isAcceptOnlyOffer = Boolean(offer?.acceptOnly) || Number(offer?.price) === 0;
              const chosenServiceId = selectedServiceIdByOffer[offer.id] ?? '';
              const chosenService =
                isAcceptOnlyOffer && offer?.workshopServices?.length
                  ? offer.workshopServices.find((s) => s.id === chosenServiceId)
                  : null;
              const chosenServicePrice =
                chosenService?.price != null ? Number(chosenService.price) : null;
              const canConfirmOffer = !isAcceptOnlyOffer || Boolean(chosenServiceId);

              return (
                <Card key={offer.id} className="p-5 border-2 border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <ImageOrPlaceholder
                        src={workshop?.imageUrl}
                        alt={name}
                        className="size-16 rounded-lg object-cover bg-slate-100"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{name}</p>
                      {businessName && (
                        <p className="text-sm text-slate-500 truncate">{businessName}</p>
                      )}
                      {workshop?.city && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <Truck className="size-3.5" /> {workshop.city}
                        </p>
                      )}
                      {(workshop?.averageRating != null && workshop.averageRating > 0) && (
                        <p className="text-sm text-amber-600 flex items-center gap-1 mt-0.5">
                          <Star className="size-3.5 fill-amber-400" /> {Number(workshop.averageRating).toFixed(1)}
                          {workshop.totalReviews > 0 && ` (${workshop.totalReviews})`}
                        </p>
                      )}
                      {price != null && price > 0 && (
                        <p className="text-lg font-bold text-indigo-600 mt-2">
                          {price} {offer.currency || 'SAR'}
                        </p>
                      )}
                      {isAcceptOnlyOffer && chosenServicePrice != null && chosenServicePrice > 0 && (
                        <p className="text-lg font-bold text-indigo-600 mt-2">
                          {chosenServicePrice} {chosenService?.currency || offer.currency || 'SAR'}
                        </p>
                      )}
                      {offer.message && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{offer.message}</p>
                      )}

                      {isAcceptOnlyOffer && offer?.workshopServices?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <label className="block text-xs font-medium text-slate-600">
                            {isAr ? 'اختر خدمة' : 'Select a service'}
                          </label>
                          <select
                            value={chosenServiceId}
                            onChange={(e) =>
                              setSelectedServiceIdByOffer((prev) => ({
                                ...prev,
                                [offer.id]: e.target.value,
                              }))
                            }
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">{isAr ? '— اختر —' : '— Choose —'}</option>
                            {offer.workshopServices.map((svc) => (
                              <option key={svc.id} value={svc.id}>
                                {svc.nameAr || svc.name}{svc.price != null ? ` - ${Number(svc.price)} ${svc.currency || offer.currency || 'SAR'}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isAcceptOnlyOffer && (!offer?.workshopServices || offer.workshopServices.length === 0) && (
                        <p className="mt-3 text-sm text-amber-700">
                          {isAr ? 'لا توجد خدمات متاحة لهذه الورشة. تواصل مع الدعم.' : 'No services available for this workshop. Contact support.'}
                        </p>
                      )}

                      {request.status === 'BROADCASTING' || request.status === 'OFFERS_RECEIVED' ? (
                        <button
                          type="button"
                          onClick={() => handleSelectOffer(offer)}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                          title={canConfirmOffer ? undefined : (isAr ? 'اختر خدمة أولاً' : 'Select a service first')}
                          disabled={
                            selectOfferMutation.isPending ||
                            isSelecting ||
                            !canConfirmOffer
                          }
                        >
                          <CheckCircle className="size-4" />
                          {isSelecting
                            ? (isAr ? 'جاري الاختيار...' : 'Selecting...')
                            : isAcceptOnlyOffer
                              ? (isAr ? 'اختر الخدمة ثم تأكيد' : 'Select service then confirm')
                              : (isAr ? 'اختر هذا العرض' : 'Select this offer')}
                        </button>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          {request.status === 'ASSIGNED' ? (isAr ? 'تم اختيار عرض لهذا الطلب' : 'An offer was already selected') : request.status}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
