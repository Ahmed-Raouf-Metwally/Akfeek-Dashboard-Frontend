import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, ShoppingBag, Star, Percent, ExternalLink } from 'lucide-react';
import ApprovalStatusBadge from './ApprovalStatusBadge';

const VENDOR_TYPE_LABELS = {
  AUTO_PARTS:         { ar: 'قطع غيار',        en: 'Auto Parts',       color: 'bg-blue-100 text-blue-700' },
  COMPREHENSIVE_CARE: { ar: 'عناية شاملة',     en: 'Comp. Care',       color: 'bg-purple-100 text-purple-700' },
  CERTIFIED_WORKSHOP: { ar: 'ورشة معتمدة',     en: 'Workshop',         color: 'bg-amber-100 text-amber-700' },
  CAR_WASH:           { ar: 'غسيل سيارات',     en: 'Car Wash',         color: 'bg-cyan-100 text-cyan-700' },
  MOBILE_WORKSHOP:    { ar: 'ورشة متنقلة',     en: 'Mobile Workshop',  color: 'bg-green-100 text-green-700' },
  TOWING_SERVICE:     { ar: 'سحب وونش',        en: 'Towing / Winch',   color: 'bg-red-100 text-red-700' },
};

const BANNER_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-indigo-600',
];

function getBannerColor(id = '') {
  const idx = id.charCodeAt(0) % BANNER_COLORS.length;
  return BANNER_COLORS[idx];
}

export default function VendorCard({ vendor, isArabic = false }) {
  const name = isArabic && vendor.businessNameAr ? vendor.businessNameAr : vendor.businessName;
  const typeInfo = VENDOR_TYPE_LABELS[vendor.vendorType];
  const bannerGradient = getBannerColor(vendor.id);

  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">

      {/* Banner */}
      <div className={`relative h-20 bg-gradient-to-br ${bannerGradient}`}>
        {vendor.banner && (
          <img src={vendor.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Status badge top-right */}
        <div className="absolute top-2 right-2">
          <ApprovalStatusBadge status={vendor.status} isArabic={isArabic} />
        </div>
        {/* Commission badge top-left */}
        {vendor.commissionPercent != null && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-0.5 text-xs text-white">
            <Percent className="size-3" />
            {Number(vendor.commissionPercent).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="px-4 -mt-7 flex items-end justify-between relative z-10">
        <div className="size-14 rounded-xl border-2 border-white bg-white shadow-md overflow-hidden shrink-0 relative z-10">
          {vendor.logo ? (
            <img src={vendor.logo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${bannerGradient} text-white font-bold text-xl`}>
              {name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        {typeInfo && (
          <span className={`mb-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeInfo.color}`}>
            {isArabic ? typeInfo.ar : typeInfo.en}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-2 pb-3 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {vendor.user?.email || vendor.contactEmail || '—'}
          </p>
        </div>

        {/* Location */}
        {(vendor.city || vendor.country) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{[vendor.city, vendor.country].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Rating */}
        {vendor.averageRating > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{Number(vendor.averageRating).toFixed(1)}</span>
            <span className="text-slate-400">({vendor.totalReviews || 0})</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5 text-center">
            <Package className="mx-auto mb-1 size-4 text-indigo-400" />
            <p className="text-sm font-bold text-slate-800">{vendor._count?.parts ?? 0}</p>
            <p className="text-xs text-slate-400">{isArabic ? 'قطع' : 'Parts'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 text-center">
            <ShoppingBag className="mx-auto mb-1 size-4 text-emerald-400" />
            <p className="text-sm font-bold text-slate-800">{vendor.totalSales ?? 0}</p>
            <p className="text-xs text-slate-400">{isArabic ? 'مبيعات' : 'Sales'}</p>
          </div>
        </div>

        {/* Action */}
        <Link
          to={`/vendors/${vendor.id}`}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          <ExternalLink className="size-3.5" />
          {isArabic ? 'التفاصيل' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}
