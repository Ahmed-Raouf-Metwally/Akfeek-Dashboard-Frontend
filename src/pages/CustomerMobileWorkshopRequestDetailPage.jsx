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

  const { data: request, isLoading, isError, error } = useQuery({
    queryKey: ['customer-mobile-workshop-request', id],
    queryFn: () => mobileWorkshopService.getRequestByIdAsCustomer(id),
    enabled: !!id,
    staleTime: 30_000,
  });

  const selectOfferMutation = useMutation({
    mutationFn: ({ requestId, offerId }) =>
      mobileWorkshopService.selectOfferAsCustomer(requestId, offerId),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-mobile-workshop-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['customer-mobile-workshop-requests'] });
      setSelectingOfferId(null);
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

  const handleSelectOffer = (offerId) => {
    if (!request?.id) return;
    setSelectingOfferId(offerId);
    selectOfferMutation.mutate({ requestId: request.id, offerId });
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
                      {offer.message && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{offer.message}</p>
                      )}
                      {request.status === 'BROADCASTING' || request.status === 'OFFERS_RECEIVED' ? (
                        <button
                          type="button"
                          onClick={() => handleSelectOffer(offer.id)}
                          disabled={selectOfferMutation.isPending || isSelecting}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          <CheckCircle className="size-4" />
                          {isSelecting ? (isAr ? 'جاري الاختيار...' : 'Selecting...') : (isAr ? 'اختر هذا العرض' : 'Select this offer')}
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
