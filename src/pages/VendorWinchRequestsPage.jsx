import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Truck, MapPin, Send, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { winchService } from '../services/winchService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function VendorWinchRequestsPage() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['winch', 'my-broadcasts'],
    queryFn: () => winchService.getMyBroadcasts(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const [submittingId, setSubmittingId] = useState(null);
  const submitOffer = useMutation({
    mutationFn: ({ broadcastId }) => winchService.submitOffer(broadcastId),
    onMutate: ({ broadcastId }) => setSubmittingId(broadcastId),
    onSuccess: (_, { broadcastId }) => {
      queryClient.invalidateQueries({ queryKey: ['winch', 'my-broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['winch', 'me'] });
      setSubmittingId(null);
      toast.success(isAr ? 'تم إرسال العرض بنجاح' : 'Offer submitted successfully');
    },
    onError: (err, { broadcastId }) => {
      setSubmittingId(null);
      toast.error(err?.message || (isAr ? 'فشل إرسال العرض' : 'Failed to submit offer'));
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

  const broadcasts = data?.broadcasts ?? [];
  const message = data?.message;

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
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'طلبات قريبة' : 'Nearby requests'}</h1>
          <p className="text-sm text-slate-500">{isAr ? 'طلبات السحب القريبة من موقعك — يمكنك إرسال عرض' : 'Towing requests near you — submit your offer'}</p>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">{message}</p>
      )}

      {broadcasts.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-slate-600">{isAr ? 'لا توجد طلبات قريبة حالياً.' : 'No nearby requests at the moment.'}</p>
          <p className="mt-1 text-sm text-slate-500">{isAr ? 'تأكد من تفعيل الوينش وتحديث الموقع.' : 'Make sure your winch is active and location is set.'}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-slate-900">{b.customer?.name || (isAr ? 'عميل' : 'Customer')}</p>
                  {b.pickupLocation?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 shrink-0 mt-0.5 text-indigo-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{b.pickupLocation.address}</p>
                        {b.pickupLocation.latitude && b.pickupLocation.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${b.pickupLocation.latitude},${b.pickupLocation.longitude}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline"
                          >
                            {isAr ? 'فتح في الخرائط' : 'Open in Maps'} <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {b.destinationLocation?.address && (
                    <div className="flex items-start gap-2">
                      <Truck className="size-4 shrink-0 mt-0.5 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-500">{b.destinationLocation.address}</p>
                        {b.destinationLocation.latitude && b.destinationLocation.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${b.destinationLocation.latitude},${b.destinationLocation.longitude}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:underline"
                          >
                            {isAr ? 'فتح في الخرائط' : 'Open in Maps'} <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-50 mt-2">
                    {b.tripDistanceKm != null && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {b.tripDistanceKm} {isAr ? 'كم' : 'km'}
                      </span>
                    )}
                    {b.yourPrice != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {b.yourPrice} {b.currency || 'SAR'}
                      </span>
                    )}
                    {b.urgency && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${b.urgency === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {b.urgency}
                      </span>
                    )}
                    {b.expiresAt && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        {isAr ? 'ينتهي: ' : 'Exp: '}{new Date(b.expiresAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {b.myOffer ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      {isAr ? 'تم إرسال العرض' : 'Offer sent'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={submittingId === b.id}
                      onClick={() => submitOffer.mutate({ broadcastId: b.id })}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Send className="size-4" /> {submittingId === b.id ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال عرض' : 'Submit offer')}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
