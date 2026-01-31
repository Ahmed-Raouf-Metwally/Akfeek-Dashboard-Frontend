import React from 'react';
import { Link } from 'react-router-dom';

export default function VendorBadge({ vendor, isArabic = false }) {
  if (!vendor) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
        </svg>
        {isArabic ? 'المنصة' : 'Platform'}
      </span>
    );
  }

  const name = isArabic && vendor.businessNameAr ? vendor.businessNameAr : vendor.businessName;

  return (
    <Link 
      to={`/vendors/${vendor.id}`} 
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
    >
      {vendor.logo ? (
        <img src={vendor.logo} alt={name} className="w-4 h-4 rounded-full object-cover" />
      ) : (
        <div className="w-4 h-4 rounded-full bg-indigo-200 flex items-center justify-center text-[8px] font-bold text-indigo-700">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-xs font-medium truncate max-w-[100px]">{name}</span>
    </Link>
  );
}
