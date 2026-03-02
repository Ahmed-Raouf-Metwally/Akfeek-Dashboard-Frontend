import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Wrench, Pencil, MapPin, ShieldCheck, Wifi, WifiOff,
  Star, Calendar, Building2, Phone, Mail, Banknote, Clock, Plus,
} from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { SERVICE_TYPES } from './CreateEditMobileWorkshopPage';
import { Card } from '../components/ui/Card';
import { UPLOADS_BASE_URL } from '../config/env';

function mwImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}
import { useAuthStore } from '../store/authStore';
import { useDateFormat } from '../hooks/useDateFormat';

const SVC_LABEL = (type) => SERVICE_TYPES.find(s => s.value === type)?.label || type;

const VENDOR_TYPE_LABELS = {
  MOBILE_WORKSHOP: 'ورشة متنقلة', TOWING_SERVICE: 'سحب وونش',
  AUTO_PARTS: 'قطع غيار', CAR_WASH: 'غسيل سيارات',
  COMPREHENSIVE_CARE: 'عناية شاملة', CERTIFIED_WORKSHOP: 'ورشة معتمدة',
};

function Row({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">{Icon && <Icon className="size-4 text-slate-400" />}{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function MobileWorkshopDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const { fmt } = useDateFormat();

  const { data: item, isLoading } = useQuery({
    queryKey: ['mobile-workshop', id],
    queryFn: () => mobileWorkshopService.getById(id),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />)}
    </div>
  );

  if (!item) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Wrench className="size-12 text-slate-300" />
      <p className="mt-3 text-lg font-semibold">الورشة غير موجودة</p>
      <Link to="/mobile-workshops" className="mt-4 text-sm text-indigo-600 hover:underline">العودة للقائمة</Link>
    </div>
  );

  const services = item.services ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/mobile-workshops" className="rounded-lg p-2 hover:bg-slate-100"><ArrowLeft className="size-5 text-slate-500" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{item.name}</h1>
          <p className="text-slate-500 text-sm">{item.nameAr || ''}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to={`/mobile-workshops/${item.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Pencil className="size-4" /> تعديل
          </Link>
        )}
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden p-0">
        {/* Vehicle image banner */}
        <div className="h-40 w-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden relative">
          {item.vehicleImageUrl
            ? <img src={mwImageSrc(item.vehicleImageUrl) || item.vehicleImageUrl} alt="" className="h-full w-full object-cover opacity-70" />
            : <Wrench className="size-16 text-white/20" />}
          {item.imageUrl && (
            <div className="absolute bottom-3 left-4 size-14 rounded-xl border-2 border-white overflow-hidden bg-white shadow-lg">
              <img src={mwImageSrc(item.imageUrl) || item.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {item.isAvailable
              ? <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"><Wifi className="size-3.5" />متاحة الآن</span>
              : <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500"><WifiOff className="size-3.5" />غير متاحة</span>}
            {item.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"><ShieldCheck className="size-3.5" />موثّقة</span>
            )}
            {!item.isActive && <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">موقوفة</span>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <Wrench className="mx-auto mb-1 size-5 text-indigo-600" />
              <div className="text-xl font-bold text-indigo-700">{item.totalJobs}</div>
              <div className="text-xs text-indigo-600">مهمة</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <Star className="mx-auto mb-1 size-5 text-amber-500 fill-amber-400" />
              <div className="text-xl font-bold text-amber-700">{Number(item.averageRating || 0).toFixed(1)}</div>
              <div className="text-xs text-amber-600">تقييم متوسط</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <Star className="mx-auto mb-1 size-5 text-slate-400" />
              <div className="text-xl font-bold text-slate-700">{item.totalReviews}</div>
              <div className="text-xs text-slate-500">تقييمات</div>
            </div>
          </div>

          {/* Pricing */}
          {(item.basePrice || item.pricePerKm || item.hourlyRate || item.minPrice) && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800"><Banknote className="size-4" />التسعير</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                {item.basePrice != null && (
                  <div><p className="text-xs text-emerald-600">سعر الزيارة</p><p className="text-lg font-bold text-emerald-800">{item.basePrice} <span className="text-xs font-normal">{item.currency}</span></p></div>
                )}
                {item.pricePerKm != null && (
                  <div><p className="text-xs text-emerald-600">/ كيلومتر</p><p className="text-lg font-bold text-emerald-800">{item.pricePerKm} <span className="text-xs font-normal">{item.currency}</span></p></div>
                )}
                {item.hourlyRate != null && (
                  <div><p className="text-xs text-emerald-600">/ ساعة</p><p className="text-lg font-bold text-emerald-800">{item.hourlyRate} <span className="text-xs font-normal">{item.currency}</span></p></div>
                )}
                {item.minPrice != null && (
                  <div><p className="text-xs text-emerald-600">أدنى سعر</p><p className="text-lg font-bold text-emerald-800">{item.minPrice} <span className="text-xs font-normal">{item.currency}</span></p></div>
                )}
              </div>
            </div>
          )}

          {/* Services with prices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">الخدمات والأسعار</p>
              {user?.role === 'ADMIN' && (
                <Link to={`/mobile-workshops/${item.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                  <Plus className="size-3" /> إدارة الخدمات
                </Link>
              )}
            </div>
            {services.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                لا توجد خدمات مضافة بعد
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {services.map((svc) => (
                  <div key={svc.id} className={`flex items-start gap-3 p-3 ${!svc.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {SVC_LABEL(svc.serviceType)}
                        </span>
                        <span className="font-semibold text-slate-900">{svc.name}</span>
                        {svc.nameAr && <span className="text-sm text-slate-500">{svc.nameAr}</span>}
                        {!svc.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">موقوفة</span>}
                      </div>
                      {svc.description && <p className="mt-1 text-xs text-slate-500">{svc.description}</p>}
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="text-base font-bold text-emerald-700">{svc.price} {svc.currency}</span>
                        {svc.estimatedDuration && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="size-3" /> {svc.estimatedDuration} دقيقة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <Row label="نوع المركبة"    value={item.vehicleType}                             icon={Wrench}   />
            <Row label="موديل المركبة"  value={item.vehicleModel}                            icon={Wrench}   />
            <Row label="سنة الصنع"      value={item.year}                                    icon={Calendar} />
            <Row label="رقم اللوحة"     value={item.plateNumber}                             icon={Wrench}   />
            <Row label="المدينة"        value={item.city}                                    icon={MapPin}   />
            <Row label="نطاق الخدمة"   value={item.serviceRadius ? `${item.serviceRadius} كم` : null} icon={MapPin} />
            <Row label="تاريخ الإضافة"  value={fmt(item.createdAt)}                          icon={Calendar} />
          </div>

          {item.description && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400 mb-1">وصف</p>
              <p className="text-sm text-slate-700">{item.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Linked Vendor */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Building2 className="size-5 text-indigo-600" /> الفيندور المرتبط
        </h2>
        {!item.vendor ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
            <Building2 className="mx-auto size-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">هذه الورشة غير مرتبطة بأي فيندور.</p>
            {user?.role === 'ADMIN' && (
              <Link to={`/mobile-workshops/${item.id}/edit`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                <Pencil className="size-3.5" /> ربط بفيندور
              </Link>
            )}
          </div>
        ) : (
          <Link to={`/vendors/${item.vendor.id}`} className="group block">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
              <div className="size-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow">
                {item.vendor.logo
                  ? <img src={item.vendor.logo} alt="" className="h-full w-full object-cover" />
                  : <span className="text-xl font-bold text-white">{item.vendor.businessName?.charAt(0) || '?'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-indigo-700">{item.vendor.businessName}</p>
                <p className="text-sm text-slate-500">{item.vendor.businessNameAr || ''}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">{VENDOR_TYPE_LABELS[item.vendor.vendorType] || item.vendor.vendorType}</span>
                  {item.vendor.user?.phone && <span className="flex items-center gap-1 text-slate-500"><Phone className="size-3" />{item.vendor.user.phone}</span>}
                  {item.vendor.user?.email && <span className="flex items-center gap-1 text-slate-500"><Mail className="size-3" />{item.vendor.user.email}</span>}
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
