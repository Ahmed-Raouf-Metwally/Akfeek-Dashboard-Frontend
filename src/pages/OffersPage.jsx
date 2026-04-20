import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import serviceOfferService from '../services/serviceOfferService';
import { vendorService } from '../services/vendorService';
import serviceService from '../services/serviceService';

const TARGETS = [
  { id: 'SERVICE', ar: 'خدمات الفيندور (غسيل/عناية شاملة)', en: 'Vendor services (Car wash / Comprehensive)' },
  { id: 'CERTIFIED_WORKSHOP_SERVICE', ar: 'خدمات الورشة المعتمدة', en: 'Certified workshop services' },
  { id: 'MOBILE_WORKSHOP_SERVICE', ar: 'خدمات الورشة المتنقلة', en: 'Mobile workshop services' },
];

function toIsoEndOfDay(dateStr) {
  // dateStr = YYYY-MM-DD
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  return d.toISOString();
}

export default function OffersPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const qc = useQueryClient();

  const [targetType, setTargetType] = useState('SERVICE');
  const [vendorType, setVendorType] = useState('CAR_WASH');
  const [vendorId, setVendorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(5);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['admin-service-offers', vendorId, targetType],
    queryFn: () => serviceOfferService.list({ vendorId: vendorId || undefined, targetType }),
    staleTime: 15_000,
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors-for-offers', vendorType],
    queryFn: async () => {
      const res = await vendorService.getVendors({ page: 1, limit: 100, vendorType });
      return res?.vendors ?? res?.items ?? [];
    },
    staleTime: 30_000,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['offer-services', targetType, vendorId],
    enabled: Boolean(vendorId),
    queryFn: async () => {
      if (targetType === 'SERVICE') return await serviceService.getVendorServices(vendorId);
      if (targetType === 'CERTIFIED_WORKSHOP_SERVICE') {
        // certified workshop services are exposed via /workshops/:id/services; but we only have vendorId here.
        // backend-side selection is validated, so we allow selecting from dashboard services list for now.
        return await serviceService.getWorkshopServices();
      }
      if (targetType === 'MOBILE_WORKSHOP_SERVICE') {
        return await serviceService.getMobileWorkshopServices();
      }
      return [];
    },
    staleTime: 30_000,
  });

  const vendorOptions = useMemo(() => {
    return (vendors || []).map((v) => ({
      id: v.id,
      label: (isAr ? (v.businessNameAr || v.businessName) : (v.businessName || v.businessNameAr)) || v.id,
    }));
  }, [vendors, isAr]);

  const serviceOptions = useMemo(() => {
    return (services || []).map((s) => ({
      id: s.id,
      label: (isAr ? (s.nameAr || s.name) : (s.name || s.nameAr)) || s.id,
    }));
  }, [services, isAr]);

  const createMutation = useMutation({
    mutationFn: () =>
      serviceOfferService.create({
        vendorId,
        targetType,
        targetId: serviceId,
        discountPercent: Number(discountPercent),
        validUntil: toIsoEndOfDay(validUntil),
        title: null,
        titleAr: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-service-offers'] });
      toast.success(isAr ? 'تم إنشاء العرض' : 'Offer created');
    },
    onError: (e) => toast.error(e?.message || (isAr ? 'فشل إنشاء العرض' : 'Failed to create offer')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceOfferService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-service-offers'] });
      toast.success(isAr ? 'تم حذف العرض' : 'Offer deleted');
    },
    onError: (e) => toast.error(e?.message || (isAr ? 'فشل حذف العرض' : 'Failed to delete offer')),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'العروض' : 'Offers'}</h1>
        <p className="text-sm text-slate-500">
          {isAr ? 'أضف خصم بنسبة مئوية على خدمة محددة لفيندور معيّن' : 'Create a percent discount offer for a specific vendor service'}
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'نوع الهدف' : 'Target type'}</span>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={targetType}
              onChange={(e) => { setTargetType(e.target.value); setServiceId(''); }}
            >
              {TARGETS.map((x) => (
                <option key={x.id} value={x.id}>{isAr ? x.ar : x.en}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'نوع الفيندور' : 'Vendor type'}</span>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={vendorType}
              onChange={(e) => { setVendorType(e.target.value); setVendorId(''); setServiceId(''); }}
            >
              <option value="CAR_WASH">{isAr ? 'غسيل' : 'Car Wash'}</option>
              <option value="COMPREHENSIVE_CARE">{isAr ? 'عناية شاملة' : 'Comprehensive Care'}</option>
              <option value="CERTIFIED_WORKSHOP">{isAr ? 'ورشة معتمدة' : 'Certified Workshop'}</option>
              <option value="MOBILE_WORKSHOP">{isAr ? 'ورشة متنقلة' : 'Mobile Workshop'}</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'الفيندور' : 'Vendor'}</span>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={vendorId}
              onChange={(e) => { setVendorId(e.target.value); setServiceId(''); }}
              disabled={vendorsLoading}
            >
              <option value="">{vendorsLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر فيندور' : 'Select vendor')}</option>
              {vendorOptions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'الخدمة' : 'Service'}</span>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={!vendorId || servicesLoading}
            >
              <option value="">{servicesLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر خدمة' : 'Select service')}</option>
              {serviceOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'الخصم %' : 'Discount %'}</span>
            <input
              type="number"
              min={1}
              max={100}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'صالح حتى' : 'Valid until'}</span>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </label>

          <div className="md:col-span-2 flex items-end justify-end">
            <button
              type="button"
              disabled={!vendorId || !serviceId || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {createMutation.isPending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'إضافة عرض' : 'Add offer')}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {offersLoading ? (
          <div className="p-6"><Skeleton className="h-24 w-full" /></div>
        ) : (offers?.length ?? 0) === 0 ? (
          <div className="p-8 text-center text-slate-500">{isAr ? 'لا توجد عروض' : 'No offers yet'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الفيندور' : 'Vendor'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'الخصم' : 'Discount'}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-500">{isAr ? 'ينتهي' : 'Ends'}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-500">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {offers.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">{(isAr ? (o.vendor?.businessNameAr || o.vendor?.businessName) : (o.vendor?.businessName || o.vendor?.businessNameAr)) || o.vendorId}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{o.targetType}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{o.discountPercent}%</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{o.validUntil ? new Date(o.validUntil).toISOString().slice(0,10) : '—'}</td>
                    <td className="px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(o.id)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                      >
                        {isAr ? 'حذف' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

