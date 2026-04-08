import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Truck, MapPin, CalendarCheck, Wrench,
  Trash2, Pencil, PlusCircle, Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

/* ── مودال تأكيد الحذف ─────────── */
function ConfirmDeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="size-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">حذف الورشة</h3>
            <p className="text-sm text-slate-500">لا يمكن التراجع عن هذا الإجراء.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 rounded-lg bg-slate-50 p-3">
          هل أنت متأكد من حذف الورشة المتنقلة؟ لن تتمكن من تقديم عروض على طلبات الصيانة بعد الحذف.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
            {loading ? 'جاري الحذف...' : 'نعم، احذف الورشة'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorMobileWorkshopPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const user     = useAuthStore((s) => s.user);
  const isAr     = i18n.language === 'ar';
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: workshop, isLoading, isError, error } = useQuery({
    queryKey: ['mobile-workshop', 'me'],
    queryFn: () => mobileWorkshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const deleteMutation = useMutation({
    mutationFn: () => mobileWorkshopService.deleteMyWorkshop(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] });
      toast.success(isAr ? 'تم حذف الورشة بنجاح' : 'Workshop deleted');
      setShowDeleteModal(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || err?.message || 'فشل الحذف');
      setShowDeleteModal(false);
    },
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'MOBILE_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
           <Wrench className="mx-auto size-12 text-slate-300 mb-4" />
           <p className="text-slate-600 font-medium">
             {isAr ? 'هذه الصفحة متاحة لمورد الورش المتنقلة فقط.' : 'This page is only available for mobile workshop vendors.'}
           </p>
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

  const noWorkshop = (isError && error?.response?.status === 404) || (!workshop);

  if (noWorkshop) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="size-5 text-slate-500" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{isAr ? 'ورشتي المتنقلة' : 'My Workshop'}</h1>
        </div>

        <Card className="p-12 text-center flex flex-col items-center gap-6 border-2 border-dashed border-indigo-100">
          <div className="size-20 rounded-full bg-indigo-50 flex items-center justify-center">
            <Truck className="size-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isAr ? 'لم تقم بإضافة ورشة بعد' : 'No Workshop Registered'}</h2>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">
              قم بإضافة بيانات ورشتك المتنقلة لتبدأ في استقبال طلبات الصيانة من العملاء القريبين منك.
            </p>
          </div>
          <Link
            to="/vendor/mobile-workshop/edit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-bold text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <PlusCircle className="size-5" /> {isAr ? 'إضافة ورشة الآن' : 'Add Workshop'}
          </Link>
        </Card>
      </div>
    );
  }

  const services = Array.isArray(workshop.services) ? workshop.services : [];

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isAr ? 'ورشتي المتنقلة' : 'My Mobile Workshop'}
              </h1>
              <p className="text-sm text-slate-500">{workshop.nameAr || workshop.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
               onClick={() => setShowDeleteModal(true)}
               className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="size-4" /> {isAr ? 'حذف' : 'Delete'}
            </button>
            <Link
              to="/vendor/mobile-workshop/edit"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="size-4" /> {isAr ? 'تعديل' : 'Edit'}
            </Link>
            <Link
              to="/vendor/mobile-workshop/requests"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-100"
            >
              <CalendarCheck className="size-4" /> {isAr ? 'طلبات ورشتي' : 'Requests'}
            </Link>
          </div>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-800 relative">
             <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                <Wrench className="size-32 rotate-12" />
             </div>
             <div className="absolute -bottom-6 left-6 ring-4 ring-white rounded-2xl overflow-hidden bg-slate-100 size-24 shadow-lg">
                {workshop.imageUrl ? (
                  <img src={workshop.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Truck className="size-10" /></div>
                )}
             </div>
          </div>

          <div className="pt-8 p-6 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{(isAr ? workshop.nameAr : workshop.name) || workshop.name}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{(isAr ? workshop.descriptionAr : workshop.description) || workshop.description || (isAr ? 'لا يوجد وصف' : 'No description')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isAr ? 'المدينة' : 'City'}</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1"><MapPin className="size-3.5 text-indigo-500" /> {workshop.city || '—'}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isAr ? 'رقم اللوحة' : 'Plate'}</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1"><Truck className="size-3.5 text-indigo-500" /> {workshop.plateNumber || '—'}</p>
                 </div>
              </div>

              {services.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Wrench className="size-4 text-indigo-600" /> {isAr ? 'الخدمات المتوفرة' : 'Services'}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {services.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors bg-white">
                        <span className="text-sm font-medium text-slate-700">{s.nameAr || s.name}</span>
                        <span className="text-xs font-bold text-indigo-600">{s.price} {s.currency || 'SAR'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
               {/* Availability Card */}
               <div className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 text-center ${workshop.isAvailable ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`size-12 rounded-full flex items-center justify-center ${workshop.isAvailable ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-300 text-white'}`}>
                    <Radio className="size-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{workshop.isAvailable ? (isAr ? 'متاح للطلبات' : 'Available') : (isAr ? 'غير متاح حالياً' : 'Offline')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{workshop.isAvailable ? (isAr ? 'أنت تستقبل طلبات من العملاء الآن' : 'Receiving requests now') : (isAr ? 'قم بتعديل الحالة لتستقبل طلبات' : 'Change status to go live')}</p>
                  </div>
               </div>

               {/* Stats (Mock for now or if available in API) */}
               <div className="bg-white rounded-2xl border border-slate-100 p-4 divide-y divide-slate-50">
                  <div className="pb-3 flex justify-between items-center">
                    <span className="text-sm text-slate-500">{isAr ? 'إجمالي الطلبات' : 'Total Jobs'}</span>
                    <span className="font-bold text-slate-900">{workshop.totalJobs || 0}</span>
                  </div>
                  <div className="pt-3 flex justify-between items-center">
                    <span className="text-sm text-slate-500">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
                    <div className="flex items-center gap-1">
                       <span className="font-bold text-slate-900">{Number(workshop.averageRating || 0).toFixed(1)}</span>
                       <span className="text-amber-400">★</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
