import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Truck, Pencil, MapPin, ShieldCheck, Wifi, WifiOff,
  Weight, Star, Route, Calendar, Building2, Phone, Mail, Banknote,
} from 'lucide-react';
import winchService from '../services/winchService';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useDateFormat } from '../hooks/useDateFormat';
import { UPLOADS_BASE_URL } from '../config/env';

function winchImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

function InfoRow({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="size-4 text-slate-400" />}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

const VENDOR_TYPE_LABELS = {
  AUTO_PARTS:         'قطع غيار',
  COMPREHENSIVE_CARE: 'عناية شاملة',
  CERTIFIED_WORKSHOP: 'ورشة معتمدة',
  CAR_WASH:           'غسيل سيارات',
  MOBILE_WORKSHOP:    'ورشة متنقلة',
  TOWING_SERVICE:     'سحب وونش',
};

export default function WinchDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const { fmt } = useDateFormat();

  const { data: winch, isLoading } = useQuery({
    queryKey: ['winch', id],
    queryFn: () => winchService.getWinchById(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!winch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Truck className="size-12 text-slate-300" />
        <p className="mt-3 text-lg font-semibold text-slate-900">الوينش غير موجود</p>
        <Link to="/winches" className="mt-4 text-sm text-indigo-600 hover:underline">العودة للقائمة</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/winches" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{winch.name}</h1>
          <p className="text-slate-500 text-sm">{winch.nameAr || ''}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link
            to={`/winches/${winch.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="size-4" /> تعديل
          </Link>
        )}
      </div>

      {/* Main card */}
      <Card className="overflow-hidden p-0">
        {/* Banner / image */}
        <div className="h-40 w-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
          {winch.imageUrl ? (
            <img src={winchImageSrc(winch.imageUrl)} alt={winch.name} className="h-full w-full object-cover opacity-80" />
          ) : (
            <Truck className="size-16 text-white/30" />
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            {winch.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <Wifi className="size-3.5" /> متاح الآن
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                <WifiOff className="size-3.5" /> غير متاح
              </span>
            )}
            {winch.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <ShieldCheck className="size-3.5" /> موثّق
              </span>
            )}
            {!winch.isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                موقوف
              </span>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <Route className="mx-auto mb-1 size-5 text-indigo-600" />
              <div className="text-xl font-bold text-indigo-700">{winch.totalTrips}</div>
              <div className="text-xs text-indigo-600">رحلة</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <Star className="mx-auto mb-1 size-5 text-amber-500 fill-amber-400" />
              <div className="text-xl font-bold text-amber-700">{Number(winch.averageRating || 0).toFixed(1)}</div>
              <div className="text-xs text-amber-600">تقييم متوسط</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <Star className="mx-auto mb-1 size-5 text-slate-400" />
              <div className="text-xl font-bold text-slate-700">{winch.totalReviews}</div>
              <div className="text-xs text-slate-500">إجمالي التقييمات</div>
            </div>
          </div>

          {/* Pricing */}
          {(winch.basePrice || winch.pricePerKm || winch.minPrice) && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Banknote className="size-4" /> التسعير
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {winch.basePrice != null && (
                  <div>
                    <p className="text-xs text-emerald-600">السعر الأساسي</p>
                    <p className="text-lg font-bold text-emerald-800">{winch.basePrice} <span className="text-xs font-normal">{winch.currency || 'SAR'}</span></p>
                  </div>
                )}
                {winch.pricePerKm != null && (
                  <div>
                    <p className="text-xs text-emerald-600">سعر الكيلومتر</p>
                    <p className="text-lg font-bold text-emerald-800">{winch.pricePerKm} <span className="text-xs font-normal">{winch.currency || 'SAR'}/كم</span></p>
                  </div>
                )}
                {winch.minPrice != null && (
                  <div>
                    <p className="text-xs text-emerald-600">الحد الأدنى</p>
                    <p className="text-lg font-bold text-emerald-800">{winch.minPrice} <span className="text-xs font-normal">{winch.currency || 'SAR'}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <InfoRow label="رقم اللوحة"   value={winch.plateNumber}              icon={Truck}    />
            <InfoRow label="موديل السيارة" value={winch.vehicleModel}             icon={Truck}    />
            <InfoRow label="سنة الصنع"     value={winch.year}                     icon={Calendar} />
            <InfoRow label="طاقة السحب"    value={winch.capacity ? `${winch.capacity} طن` : null} icon={Weight} />
            <InfoRow label="المدينة"       value={winch.city}                     icon={MapPin}   />
            <InfoRow label="تاريخ الإضافة" value={fmt(winch.createdAt)}           icon={Calendar} />
          </div>

          {winch.description && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">وصف</p>
              <p className="text-sm text-slate-700">{winch.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Linked Vendor ─────────────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Building2 className="size-5 text-indigo-600" />
          الفيندور المرتبط
        </h2>

        {!winch.vendor ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
            <Building2 className="mx-auto size-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">هذا الوينش غير مرتبط بأي فيندور.</p>
            {user?.role === 'ADMIN' && (
              <Link to={`/winches/${winch.id}/edit`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                <Pencil className="size-3.5" /> ربط بفيندور
              </Link>
            )}
          </div>
        ) : (
          <Link to={`/vendors/${winch.vendor.id}`} className="group block">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40">
              {/* Logo */}
              <div className="size-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow">
                {winch.vendor.logo
                  ? <img src={winch.vendor.logo} alt="" className="h-full w-full object-cover" />
                  : <span className="text-xl font-bold text-white">
                      {winch.vendor.businessName?.charAt(0) || '?'}
                    </span>}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
                  {winch.vendor.businessName}
                </p>
                <p className="text-sm text-slate-500">{winch.vendor.businessNameAr || ''}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                    {VENDOR_TYPE_LABELS[winch.vendor.vendorType] || winch.vendor.vendorType}
                  </span>
                  {winch.vendor.user?.phone && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="size-3" />{winch.vendor.user.phone}
                    </span>
                  )}
                  {winch.vendor.user?.email && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Mail className="size-3" />{winch.vendor.user.email}
                    </span>
                  )}
                </div>
              </div>

              <ArrowLeft className="size-5 text-slate-300 group-hover:text-indigo-500 rotate-180 transition-colors" />
            </div>
          </Link>
        )}
      </Card>
    </div>
  );
}
