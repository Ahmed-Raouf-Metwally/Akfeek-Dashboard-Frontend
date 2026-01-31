import React from 'react';
import { Link } from 'react-router-dom';
import VendorBadge from './VendorBadge';
import ApprovalStatusBadge from './ApprovalStatusBadge';

export default function AutoPartCard({ part, isArabic = false }) {
  const name = isArabic && part.nameAr ? part.nameAr : part.name;
  const price = parseFloat(part.price).toLocaleString();
  const currency = isArabic ? 'ر.س' : 'SAR';
  
  // Get primary image
  const primaryImage = part.images && part.images.length > 0 
    ? part.images.find(img => img.isPrimary) || part.images[0]
    : null;

  return (
    <Link 
      to={`/auto-parts/${part.id}`} 
      className="group block border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {primaryImage ? (
          <img 
            src={primaryImage.url} 
            alt={primaryImage.altText || name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {!part.isApproved && (
             <ApprovalStatusBadge status="PENDING_APPROVAL" isArabic={isArabic} />
          )}
          {part.isFeatured && (
             <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
               {isArabic ? 'مميز' : 'Featured'}
             </span>
          )}
        </div>
      </div>
      
      <div className="p-3">
        <div className="mb-2">
          <VendorBadge vendor={part.vendor} isArabic={isArabic} />
        </div>
        
        <h3 className="font-semibold text-slate-800 line-clamp-2 min-h-[2.5rem]" title={name}>
          {name}
        </h3>
        
        <div className="mt-2 flex items-baseline justify-between">
          <div className="font-bold text-indigo-600">
            {price} <span className="text-xs font-medium text-slate-500">{currency}</span>
          </div>
          <div className="text-xs text-slate-500">
            {part.stockQuantity > 0 ? (
               <span className="text-green-600 font-medium">
                 {isArabic ? `${part.stockQuantity} متوفر` : `${part.stockQuantity} in stock`}
               </span>
            ) : (
               <span className="text-red-500 font-medium">
                 {isArabic ? 'نفد المخزون' : 'Out of Stock'}
               </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
