import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Trash2, Tag, Truck, Box, Pencil } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { useAuthStore } from '../store/authStore';
import { useConfirm } from '../hooks/useConfirm';
import { Card } from '../components/ui/Card';
import VendorBadge from '../components/marketplace/VendorBadge';

export default function AutoPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const isVendor = user?.role === 'VENDOR';
  const canEditOrDelete = isAdmin || isVendor;
  const queryClient = useQueryClient();
  const [openConfirm, ConfirmModal] = useConfirm();
  const [activeImage, setActiveImage] = useState(0);

  const { data: part, isLoading } = useQuery({
    queryKey: ['auto-part', id],
    queryFn: () => autoPartService.getAutoPartById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => autoPartService.deleteAutoPart(part.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-parts'] });
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success('Part deleted');
      navigate('/auto-parts');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete part'),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading part details...</div>;
  if (!part) return <div className="p-8 text-center text-red-500">Part not found</div>;

  const images = part.images && part.images.length > 0 ? part.images : [{ url: null }];

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex items-center gap-4">
        <Link to="/auto-parts" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{part.name}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
             <span className="font-mono">{part.sku}</span>
             <span>•</span>
             <span>{part.category?.name}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
           {canEditOrDelete && (
             <>
               <Link
                 to={`/auto-parts/${part.id}/edit`}
                 className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
               >
                 <Pencil className="size-4" /> {t('common.edit', 'Edit')}
               </Link>
               <button
                 onClick={async () => {
                   const ok = await openConfirm({ title: t('common.delete') || 'Delete Part', message: t('autoParts.deleteMessage', 'Delete this part? This cannot be undone.'), variant: 'danger' });
                   if (ok) deleteMutation.mutate();
                 }}
                 className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
               >
                 <Trash2 className="size-4" /> {t('common.delete', 'Delete')}
               </button>
             </>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Images */}
        <div className="space-y-4">
           <Card className="overflow-hidden p-0">
             <div className="aspect-square bg-slate-100 flex items-center justify-center">
               {images[activeImage].url ? (
                  <img src={images[activeImage].url} alt={part.name} className="h-full w-full object-contain" />
               ) : (
                  <div className="text-slate-400 font-bold text-2xl">No Image</div>
               )}
             </div>
           </Card>
           {images.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2">
               {images.map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setActiveImage(idx)}
                   className={`size-20 flex-shrink-0 rounded-lg border-2 overflow-hidden ${activeImage === idx ? 'border-indigo-600' : 'border-transparent'}`}
                 >
                   <img src={img.url} className="h-full w-full object-cover" />
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
           <Card className="p-6">
             <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">{parseFloat(part.price).toLocaleString()} SAR</h2>
                  {part.compareAtPrice && (
                    <span className="text-sm text-slate-400 line-through">{parseFloat(part.compareAtPrice).toLocaleString()} SAR</span>
                  )}
               </div>
             </div>

             <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Tag className="size-4" /> Brand
                   </div>
                   <span className="font-medium text-slate-900">{part.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Box className="size-4" /> Stock
                   </div>
                   <span className={`font-medium ${part.stockQuantity > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                     {part.stockQuantity} units
                   </span>
                </div>
                <div className="flex justify-between">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Truck className="size-4" /> Weight
                   </div>
                   <span className="font-medium text-slate-900">{part.weight ? `${part.weight} kg` : 'N/A'}</span>
                </div>
             </div>

             <div className="mt-8">
               <h3 className="mb-2 font-semibold text-slate-900">Vendor</h3>
               <div className="rounded-lg bg-slate-50 p-4">
                 <div className="flex items-center justify-between">
                   <VendorBadge vendor={part.vendor} />
                   {part.vendorId && <Link to={`/vendors/${part.vendorId}`} className="text-sm text-indigo-600 hover:underline">View Profile</Link>}
                 </div>
               </div>
             </div>
           </Card>

           <Card className="p-6">
              <h3 className="mb-4 font-semibold text-slate-900">Description</h3>
              <div className="prose-sm text-slate-600">
                <p>{part.description}</p>
                {part.descriptionAr && (
                  <div className="mt-4 border-t border-slate-100 pt-4 text-right" dir="rtl">
                    <p>{part.descriptionAr}</p>
                  </div>
                )}
              </div>
           </Card>

           {part.compatibility && part.compatibility.length > 0 && (
              <Card className="p-6">
                 <h3 className="mb-4 font-semibold text-slate-900">Vehicle Compatibility</h3>
                 <ul className="space-y-2">
                   {part.compatibility.map((comp, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>{comp.vehicleModel?.brand?.name} {comp.vehicleModel?.name}</span>
                        {comp.notes && <span className="text-slate-400 text-xs">({comp.notes})</span>}
                      </li>
                   ))}
                 </ul>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
