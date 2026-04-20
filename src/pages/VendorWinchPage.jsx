import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Truck, MapPin, CalendarCheck, Radio, Pencil, Trash2,
  Weight, Banknote, ShieldCheck, Wifi, WifiOff, Star, Route,
  PlusCircle, AlertTriangle,
} from 'lucide-react';
import winchService from '../services/winchService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { UPLOADS_BASE_URL } from '../config/env';

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

function InfoRow({ label, value, icon: Icon }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="size-4 text-slate-400" />}{label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

/* ── مودال تأكيد الحذف ─────────── */
function ConfirmDeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">حذف الونش</h3>
            <p className="text-sm text-slate-500">هذه العملية لا يمكن التراجع عنها.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 rounded-lg bg-slate-50 p-3">
          هل أنت متأكد من حذف الونش؟ لن يمكنك استقبال طلبات السحب بعد الحذف.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'جاري الحذف...' : 'نعم، احذف'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorWinchPage() {
  const { i18n } = useTranslation();
  const user      = useAuthStore((s) => s.user);
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const isAr      = i18n.language === 'ar';
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: winch, isLoading, isError, error } = useQuery({
    queryKey: ['winch', 'me'],
    queryFn:  () => winchService.getMyWinch(),
    retry:    (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const deleteMutation = useMutation({
    mutationFn: () => winchService.deleteMyWinch(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['winch', 'me'] });
      toast.success('تم حذف الونش');
      setShowDeleteModal(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || err?.message || 'فشل الحذف');
      setShowDeleteModal(false);
    },
  });

  /* ── تحقق من صلاحية الصفحة ─── */
  if (user?.role !== 'VENDOR' || user?.vendorType !== 'TOWING_SERVICE') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <Truck className="mx-auto size-10 text-slate-300" />
          <p className="mt-3 text-slate-600">هذه الصفحة متاحة لفيندور السحب (TOWING_SERVICE) فقط.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card className="p-6"><Skeleton className="h-52 w-full" /></Card>
      </div>
    );
  }

  const noWinch = isError && error?.response?.status === 404;
  const currency = winch?.currency || 'SAR';
  const imageUrl = winch?.imageUrl ? imgSrc(winch.imageUrl) : null;
  const name     = isAr ? (winch?.nameAr || winch?.name) : (winch?.name || winch?.nameAr);

  /* ══════════════════════════════════════════
     حالة لا يوجد ونش → عرض رسالة + زرار إضافة
  ══════════════════════════════════════════ */
  if (noWinch || (!isLoading && !winch)) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-lg p-2 hover:bg-slate-100">
            <ArrowLeft className="size-5 text-slate-500" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">ونشي</h1>
        </div>

        {/* Empty state */}
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-5">
          <div className="size-20 rounded-full bg-indigo-50 flex items-center justify-center">
            <Truck className="size-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">لا يوجد ونش مرتبط بحسابك</h2>
            <p className="mt-2 text-slate-500 max-w-xs mx-auto">
              أضف بيانات ونشك لتبدأ في استقبال طلبات السحب وعرض أسعارك.
            </p>
          </div>
          <Link
            to="/vendor/winch/edit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200"
          >
            <PlusCircle className="size-5" /> إضافة ونشي
          </Link>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500">{error?.message || 'فشل تحميل البيانات'}</p>
      </Card>
    );
  }

  /* ══════════════════════════════════════════
     حالة يوجد ونش → عرض التفاصيل كاملة
  ══════════════════════════════════════════ */
  return (
    <>
      {showDeleteModal && (
        <ConfirmDeleteModal
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ونشي</h1>
              <p className="text-sm text-slate-500">{name}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="size-4" /> حذف
            </button>
            <Link
              to="/vendor/winch/edit"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="size-4" /> تعديل
            </Link>
            <Link
              to="/vendor/winch/requests"
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Radio className="size-4" /> طلبات قريبة
            </Link>
            <Link
              to="/vendor/winch/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <CalendarCheck className="size-4" /> مهامي
            </Link>
          </div>
        </div>

        {/* Location Update Card (New) */}
        <Card className="bg-indigo-600 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-32 bg-white/10 -skew-x-12 translate-x-16" />
          <div className="p-5 flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <MapPin className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">تحديث الموقع المباشر</h3>
                <p className="text-indigo-100 text-sm">حدّث موقعك الآن لعرض المسافة للعملاء بدقة.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!navigator.geolocation) return toast.error('المتصفح لا يدعم تحديد الموقع');
                const tId = toast.loading('جاري جلب الموقع...');
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    deleteMutation.mutateAsync = undefined; // local trick to reuse mutation or just call service
                    winchService.updateMyWinch({ latitude, longitude })
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['winch', 'me'] });
                        toast.success('تم تحديث الموقع بنجاح', { id: tId });
                      })
                      .catch(err => toast.error(err.message || 'فشل التحديث', { id: tId }));
                  },
                  (err) => toast.error('فشل جلب الموقع: ' + err.message, { id: tId }),
                  { enableHighAccuracy: true }
                );
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-indigo-600 hover:bg-slate-50 transition-all shadow-lg active:scale-95"
            >
              <Radio className="size-4 animate-pulse" /> تحديث الآن
            </button>
          </div>
        </Card>

        {/* Main card */}
        <Card className="overflow-hidden p-0">
          {/* Banner / Image */}
          <div className="h-40 w-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden relative">
            {imageUrl
              ? <img src={imageUrl} alt={name} className="h-full w-full object-cover opacity-80" />
              : <Truck className="size-16 text-white/20" />}
            {/* Status overlay */}
            <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
              {winch.isAvailable ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <Wifi className="size-3" /> متاح
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <WifiOff className="size-3" /> غير متاح
                </span>
              )}
              {winch.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <ShieldCheck className="size-3" /> موثّق
                </span>
              )}
              {!winch.isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  موقوف
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-indigo-50 p-4 text-center">
                <Route className="mx-auto mb-1 size-5 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-700">{winch.totalTrips ?? 0}</div>
                <div className="text-xs text-indigo-500 mt-0.5">رحلة</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <Star className="mx-auto mb-1 size-5 text-amber-500 fill-amber-400" />
                <div className="text-2xl font-bold text-amber-700">
                  {Number(winch.averageRating || 0).toFixed(1)}
                </div>
                <div className="text-xs text-amber-500 mt-0.5">متوسط التقييم</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Star className="mx-auto mb-1 size-5 text-slate-400" />
                <div className="text-2xl font-bold text-slate-700">{winch.totalReviews ?? 0}</div>
                <div className="text-xs text-slate-400 mt-0.5">إجمالي التقييمات</div>
              </div>
            </div>

            {/* Pricing */}
            {(winch.basePrice != null || winch.pricePerKm != null || winch.minPrice != null) && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Banknote className="size-4" /> التسعير
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {winch.basePrice != null && (
                    <div>
                      <p className="text-xs text-emerald-600">السعر الأساسي</p>
                      <p className="text-lg font-bold text-emerald-800">
                        {winch.basePrice}{' '}
                        <span className="text-xs font-normal">{currency}</span>
                      </p>
                    </div>
                  )}
                  {winch.pricePerKm != null && (
                    <div>
                      <p className="text-xs text-emerald-600">سعر الكيلومتر</p>
                      <p className="text-lg font-bold text-emerald-800">
                        {winch.pricePerKm}{' '}
                        <span className="text-xs font-normal">{currency}/كم</span>
                      </p>
                    </div>
                  )}
                  {winch.minPrice != null && (
                    <div>
                      <p className="text-xs text-emerald-600">الحد الأدنى</p>
                      <p className="text-lg font-bold text-emerald-800">
                        {winch.minPrice}{' '}
                        <span className="text-xs font-normal">{currency}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4">
              <InfoRow label="رقم اللوحة"   value={winch.plateNumber}                icon={Truck}   />
              <InfoRow label="موديل السيارة" value={winch.vehicleModel}              icon={Truck}   />
              <InfoRow label="سنة الصنع"     value={winch.year}                      icon={Truck}   />
              <InfoRow label="طاقة السحب"    value={winch.capacity ? `${winch.capacity} طن` : null} icon={Weight} />
              <InfoRow label="المدينة"       value={winch.city}                      icon={MapPin}  />
              {winch.latitude != null && winch.longitude != null && (
                <InfoRow
                  label="الإحداثيات"
                  value={`${Number(winch.latitude).toFixed(5)}, ${Number(winch.longitude).toFixed(5)}`}
                  icon={MapPin}
                />
              )}
            </div>

            {winch.description && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-1.5">وصف</p>
                <p className="text-sm text-slate-700 leading-relaxed">{winch.description}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
