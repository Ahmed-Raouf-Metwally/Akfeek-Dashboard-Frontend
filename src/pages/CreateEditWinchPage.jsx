import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Truck, ImagePlus, Upload } from 'lucide-react';
import winchService from '../services/winchService';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';
import VendorDocuments from '../components/VendorDocuments';
import { UPLOADS_BASE_URL } from '../config/env';

const EMPTY = {
  name: '', nameAr: '', plateNumber: '', vehicleModel: '', year: '',
  capacity: '', description: '', city: '', latitude: '', longitude: '',
  basePrice: '', pricePerKm: '', minPrice: '', currency: 'SAR',
  vendorId: '', imageUrl: '', isAvailable: true, isActive: true, isVerified: false,
};

function winchImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

export default function CreateEditWinchPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const fileInputRef = useRef(null);

  const { data: winch, isLoading } = useQuery({
    queryKey: ['winch', id],
    queryFn: () => winchService.getWinchById(id),
    enabled: isEdit,
  });

  // Fetch TOWING_SERVICE vendors for linking
  const { data: towingVendorsResult } = useQuery({
    queryKey: ['vendors', { vendorType: 'TOWING_SERVICE', limit: 100 }],
    queryFn: () => vendorService.getVendors({ vendorType: 'TOWING_SERVICE', limit: 100 }),
    staleTime: 60_000,
  });
  const towingVendors = towingVendorsResult?.vendors ?? [];

  useEffect(() => {
    if (winch) {
      setForm({
        name:         winch.name         || '',
        nameAr:       winch.nameAr       || '',
        plateNumber:  winch.plateNumber  || '',
        vehicleModel: winch.vehicleModel || '',
        year:         winch.year         ?? '',
        capacity:     winch.capacity     ?? '',
        description:  winch.description  || '',
        city:         winch.city         || '',
        latitude:     winch.latitude     ?? '',
        longitude:    winch.longitude    ?? '',
        basePrice:    winch.basePrice    ?? '',
        pricePerKm:   winch.pricePerKm   ?? '',
        minPrice:     winch.minPrice     ?? '',
        currency:     winch.currency     || 'SAR',
        vendorId:     winch.vendorId     || '',
        imageUrl:     winch.imageUrl     || '',
        isAvailable:  winch.isAvailable  ?? true,
        isActive:     winch.isActive     ?? true,
        isVerified:   winch.isVerified   ?? false,
      });
    }
  }, [winch]);

  const uploadImageMutation = useMutation({
    mutationFn: (file) => winchService.uploadImage(id, file),
    onSuccess: (imageUrl) => {
      setForm((p) => ({ ...p, imageUrl }));
      queryClient.invalidateQueries({ queryKey: ['winch', id] });
      toast.success('تم رفع الصورة');
    },
    onError: (err) => toast.error(err?.message || 'فشل رفع الصورة'),
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? winchService.updateWinch(id, data) : winchService.createWinch(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['winches'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['winch', id] });
      toast.success(isEdit ? 'تم تحديث الوينش' : 'تم إضافة الوينش');
      navigate(`/winches/${saved.id}`);
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'حدث خطأ'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      year:       form.year       ? parseInt(form.year)          : null,
      capacity:   form.capacity   ? parseFloat(form.capacity)    : null,
      latitude:   form.latitude   ? parseFloat(form.latitude)    : null,
      longitude:  form.longitude  ? parseFloat(form.longitude)   : null,
      basePrice:  form.basePrice  ? parseFloat(form.basePrice)   : null,
      pricePerKm: form.pricePerKm ? parseFloat(form.pricePerKm)  : null,
      minPrice:   form.minPrice   ? parseFloat(form.minPrice)    : null,
      vendorId:   form.vendorId   || null,
    });
  };

  if (isEdit && isLoading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/winches" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-2">
          <Truck className="size-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'تعديل الوينش' : 'إضافة وينش جديد'}</h1>
            <p className="text-slate-500">ربط سيارة سحب بفيندور من نوع "سحب وونش"</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2">{t('winch.vehicleData')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('common.nameEn')} name="name" value={form.name} onChange={handleChange} required />
            <Input label={t('common.nameAr')} name="nameAr" value={form.nameAr} onChange={handleChange} dir="rtl" />
            <Input label={t('winch.plateNumber')} name="plateNumber" value={form.plateNumber} onChange={handleChange} required placeholder={t('winch.plateNumberPlaceholder')} />
            <Input label={t('winch.vehicleModel')} name="vehicleModel" value={form.vehicleModel} onChange={handleChange} placeholder={t('winch.vehicleModelPlaceholder')} />
            <Input label={t('winch.year')} name="year" type="number" value={form.year} onChange={handleChange} placeholder={t('winch.yearPlaceholder')} min="1990" max="2030" />
            <Input label={t('winch.capacity')} name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder={t('winch.capacityPlaceholder')} step="0.1" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('winch.description')}</label>
            <textarea
              name="description" rows={3} value={form.description} onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </Card>

        {isEdit && (
          <Card className="p-6 space-y-5">
            <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
              <ImagePlus className="size-5 text-indigo-600" /> {t('winch.winchImage')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                {form.imageUrl ? (
                  <img src={winchImageSrc(form.imageUrl)} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <Truck className="size-12" />
                    <span className="text-sm">{t('winch.noImage')}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImageMutation.mutate(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Upload className="size-4" />
                  {uploadImageMutation.isPending ? t('winch.uploading') : (form.imageUrl ? t('winch.changeImage') : t('winch.uploadImage'))}
                </button>
                <p className="mt-2 text-xs text-slate-500">{t('winch.imageHint')}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2">{t('winch.location')}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={t('winch.city')} name="city" value={form.city} onChange={handleChange} />
            <Input label={t('winch.latitude')} name="latitude" type="number" value={form.latitude} onChange={handleChange} step="any" />
            <Input label={t('winch.longitude')} name="longitude" type="number" value={form.longitude} onChange={handleChange} step="any" />
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2">{t('winch.pricing')}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('winch.basePrice')}</label>
              <input
                type="number" name="basePrice" value={form.basePrice} onChange={handleChange}
                placeholder={t('winch.basePricePlaceholder')} min="0" step="0.5"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-400">{t('winch.basePriceHint')}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('winch.pricePerKm')}</label>
              <input
                type="number" name="pricePerKm" value={form.pricePerKm} onChange={handleChange}
                placeholder={t('winch.pricePerKmPlaceholder')} min="0" step="0.5"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-400">{t('winch.pricePerKmHint')}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('winch.minPrice')}</label>
              <input
                type="number" name="minPrice" value={form.minPrice} onChange={handleChange}
                placeholder={t('winch.minPricePlaceholder')} min="0" step="0.5"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-400">{t('winch.minPriceHint')}</p>
            </div>
          </div>
          {(form.basePrice || form.pricePerKm) && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
              مثال: رحلة 10 كم = {((parseFloat(form.basePrice) || 0) + (parseFloat(form.pricePerKm) || 0) * 10).toFixed(1)} ر.س
              {form.minPrice && parseFloat(form.minPrice) > 0 && (parseFloat(form.basePrice || 0) + parseFloat(form.pricePerKm || 0) * 10) < parseFloat(form.minPrice)
                ? ` ← سيُطبَّق الحد الأدنى: ${parseFloat(form.minPrice).toFixed(1)} ر.س`
                : ''}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2">ربط الفيندور</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('winch.towingVendor')}</label>
            <select
              name="vendorId" value={form.vendorId} onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- بدون ربط --</option>
              {towingVendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.businessName} {v.businessNameAr ? `/ ${v.businessNameAr}` : ''}
                </option>
              ))}
            </select>
            {towingVendors.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                لا يوجد فيندورز من نوع "سحب وونش" — <Link to="/vendors/new" className="underline">أضف فيندور جديد</Link>
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">الحالة</h3>
          <div className="flex flex-wrap gap-6">
            {[
              { name: 'isAvailable', labelKey: 'winch.isAvailable' },
              { name: 'isActive',    labelKey: 'winch.isActive' },
              { name: 'isVerified',  labelKey: 'winch.isVerified' },
            ].map(({ name, labelKey }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange}
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">{t(labelKey)}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit" disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Save className="size-4" />
            {mutation.isPending ? 'جاري الحفظ...' : (isEdit ? 'حفظ التغييرات' : 'إضافة الوينش')}
          </button>
        </div>
      </form>

      {/* Documents — only after a vendor is linked */}
      {form.vendorId ? (
        <VendorDocuments vendorId={form.vendorId} />
      ) : (
        <Card className="p-5 text-center text-sm text-slate-400">
          اربط الوينش بفيندور أولاً لتتمكن من رفع المستندات
        </Card>
      )}
    </div>
  );
}
