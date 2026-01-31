import React from 'react';
import { Link } from 'react-router-dom';
import ApprovalStatusBadge from './ApprovalStatusBadge';

export default function VendorCard({ vendor, isArabic = false }) {
  const name = isArabic && vendor.businessNameAr ? vendor.businessNameAr : vendor.businessName;
  const description = isArabic && vendor.descriptionAr ? vendor.descriptionAr : vendor.description;

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
            {vendor.logo ? (
              <img src={vendor.logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                {name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{name}</h3>
            <div className="text-sm text-slate-500 line-clamp-1">
              {vendor.user?.email}
            </div>
          </div>
        </div>
        <ApprovalStatusBadge status={vendor.status} isArabic={isArabic} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-50 p-2 rounded text-center">
          <span className="block text-slate-500 text-xs">{isArabic ? 'قطع' : 'Parts'}</span>
          <span className="font-semibold text-slate-800">{vendor._count?.parts || 0}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded text-center">
          <span className="block text-slate-500 text-xs">{isArabic ? 'المبيعات' : 'Sales'}</span>
          <span className="font-semibold text-slate-800">{vendor.totalSales || 0}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link 
          to={`/vendors/${vendor.id}`} 
          className="flex-1 text-center px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          {isArabic ? 'التفاصيل' : 'Details'}
        </Link>
      </div>
    </div>
  );
}
