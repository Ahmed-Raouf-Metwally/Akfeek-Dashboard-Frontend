import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Truck, Upload, ImagePlus, MapPin, Banknote,
  Settings2, PlusCircle,
} from 'lucide-react';
import winchService from '../services/winchService';
import { Card } from '../components/ui/Card';
import { UPLOADS_BASE_URL } from '../config/env';

const EMPTY = {
  name: '', nameAr: '', plateNumber: '', vehicleModel: '', year: '',
  capacity: '', description: '', city: '', latitude: '', longitude: '',
  basePrice: '', pricePerKm: '', minPrice: '', currency: 'SAR',
  isAvailable: true,
};

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm ' +
  'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white';

export default function VendorWinchEditPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const fileRef  = useRef(null);
  const [form, setForm] = useState(EMPTY);

  /* ── جيب بيانات الونش الحالي (لو موجود) ─── */
  const { data: winch, isLoading } = useQuery({
    queryKey: ['winch', 'me'],
    queryFn:  () => winchService.getMyWinch(),
    retry:    (_, err) => err?.response?.status !== 404 && err?.response?.status !== 403,
  });

  const isEdit = Boolean(winch);   // موجود = تعديل، مش موجود = إنشاء

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
        isAvailable:  winch.isAvailable  ?? true,
      });
    }
  }, [winch]);

  /* ── رفع صورة (فقط في وضع التعديل) ─── */
  const imgMutation = useMutation({
    mutationFn: (file) => winchService.uploadMyWinchImage(file),
    onSuccess: (imageUrl) => {
      qc.setQueryData(['winch', 'me'], (old) => old ? { ...old, imageUrl } : old);
      qc.invalidateQueries({ queryKey: ['winch', 'me'] });
      toast.success('تم رفع الصورة');
    },
    onError: (err) => toast.error(err?.message || 'فشل رفع الصورة'),
  });

  /* ── حفظ (إنشاء أو تعديل) ─── */
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? winchService.updateMyWinch(data) : winchService.createMyWinch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['winch', 'me'] });
      toast.success(isEdit ? 'تم تحديث بيانات الونش' : 'تم إضافة الونش بنجاح');
      navigate('/vendor/winch');
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || err?.message || 'حدث خطأ'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      year:       form.year       ? parseInt(form.year)         : null,
      capacity:   form.capacity   ? parseFloat(form.capacity)   : null,
      latitude:   form.latitude   ? parseFloat(form.latitude)   : null,
      longitude:  form.longitude  ? parseFloat(form.longitude)  : null,
      basePrice:  form.basePrice  ? parseFloat(form.basePrice)  : null,
      pricePerKm: form.pricePerKm ? parseFloat(form.pricePerKm) : null,
      minPrice:   form.minPrice   ? parseFloat(form.minPrice)   : null,
    });
  };

  if (isLoading)
    return <div className="p-8 text-center text-slate-400 animate-pulse">جاري التحميل...</div>;

  const imageUrl = winch?.imageUrl ? imgSrc(winch.imageUrl) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/vendor/winch" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-2">
          {isEdit
            ? <Settings2 className="size-6 text-indigo-600" />
            : <PlusCircle className="size-6 text-indigo-600" />}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? 'تعديل بيانات الونش' : 'إضافة ونش جديد'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit ? winch.name : 'سيكون مرتبطاً بحسابك كفيندور سحب'}
            </p>
          </div>
        </div>
      </div>

      {/* صورة الونش — فقط في التعديل */}
      {isEdit && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
            <ImagePlus className="size-5 text-indigo-600" /> صورة الونش
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-52 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
              {imageUrl
                ? <img src={imageUrl} alt={winch.name} className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Truck className="size-10" />
                    <span className="text-xs">لا توجد صورة</span>
                  </div>}
            </div>
            <div>
              <input
                ref={fileRef} type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) imgMutation.mutate(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={imgMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
              >
                <Upload className="size-4" />
                {imgMutation.isPending ? 'جاري الرفع...' : (imageUrl ? 'تغيير الصورة' : 'رفع صورة')}
              </button>
              <p className="mt-2 text-xs text-slate-500">JPEG، PNG أو WebP — الحد الأقصى 5 MB</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* بيانات السيارة */}
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2">بيانات السيارة</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم (إنجليزي)">
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="e.g. Eagle Towing" className={inputCls} />
            </Field>
            <Field label="الاسم (عربي)">
              <input name="nameAr" value={form.nameAr} onChange={handleChange}
                dir="rtl" placeholder="مثال: نسر للسحب" className={inputCls} />
            </Field>
            <Field label="رقم اللوحة *">
              <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required
                placeholder="مثال: ABC 1234" className={inputCls} />
            </Field>
            <Field label="موديل السيارة">
              <input name="vehicleModel" value={form.vehicleModel} onChange={handleChange}
                placeholder="مثال: Toyota Hilux" className={inputCls} />
            </Field>
            <Field label="سنة الصنع">
              <input name="year" type="number" value={form.year} onChange={handleChange}
                min="1990" max="2030" className={inputCls} />
            </Field>
            <Field label="طاقة السحب (طن)">
              <input name="capacity" type="number" value={form.capacity} onChange={handleChange}
                step="0.1" min="0" className={inputCls} />
            </Field>
          </div>
          <Field label="وصف">
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              className={inputCls} />
          </Field>
        </Card>

        {/* الموقع */}
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
            <MapPin className="size-5 text-indigo-600" /> الموقع
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-600">
              ⚠️ تحديد الإحداثيات ضروري لاستقبال طلبات السحب القريبة منك.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return toast.error('المتصفح لا يدعم تحديد الموقع');
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setForm(p => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                    toast.success('تم جلب الموقع بنجاح');
                  },
                  (err) => toast.error('فشل جلب الموقع: ' + err.message),
                  { enableHighAccuracy: true }
                );
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              جلب موقعي الحالي
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="المدينة">
              <input name="city" value={form.city} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="خط العرض (Latitude)">
              <input name="latitude" type="number" value={form.latitude} onChange={handleChange}
                step="any" className={inputCls} />
            </Field>
            <Field label="خط الطول (Longitude)">
              <input name="longitude" type="number" value={form.longitude} onChange={handleChange}
                step="any" className={inputCls} />
            </Field>
          </div>
        </Card>

        {/* التسعير */}
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Banknote className="size-5 text-indigo-600" /> التسعير
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="السعر الأساسي" hint="رسوم ثابتة لكل رحلة">
              <input name="basePrice" type="number" value={form.basePrice} onChange={handleChange}
                min="0" step="0.5" className={inputCls} />
            </Field>
            <Field label="سعر الكيلومتر" hint="يُضاف على الأساسي">
              <input name="pricePerKm" type="number" value={form.pricePerKm} onChange={handleChange}
                min="0" step="0.5" className={inputCls} />
            </Field>
            <Field label="الحد الأدنى للسعر">
              <input name="minPrice" type="number" value={form.minPrice} onChange={handleChange}
                min="0" step="0.5" className={inputCls} />
            </Field>
          </div>
          {(form.basePrice || form.pricePerKm) && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
              مثال: رحلة 10 كم ={' '}
              <strong>
                {((parseFloat(form.basePrice) || 0) + (parseFloat(form.pricePerKm) || 0) * 10).toFixed(1)}
              </strong>{' '}
              {form.currency || 'SAR'}
            </div>
          )}
        </Card>

        {/* الحالة */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">الحالة</h3>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox" name="isAvailable"
              checked={form.isAvailable} onChange={handleChange}
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">متاح لاستقبال طلبات السحب الآن</span>
          </label>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit" disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            <Save className="size-4" />
            {saveMutation.isPending
              ? 'جاري الحفظ...'
              : isEdit ? 'حفظ التغييرات' : 'إضافة الونش'}
          </button>
        </div>
      </form>
    </div>
  );
}
