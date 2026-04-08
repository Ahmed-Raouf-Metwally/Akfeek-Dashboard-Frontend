import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Wrench, Plus, Trash2, Pencil, Check, X, Car, User, Phone, Mail, MapPin, ImagePlus, Upload } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import mobileWorkshopTypeService from '../services/mobileWorkshopTypeService';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';
import VendorDocuments from '../components/VendorDocuments';
import { UPLOADS_BASE_URL } from '../config/env';

// eslint-disable-next-line react-refresh/only-export-components
export const SERVICE_TYPES = [
  { value: 'OIL_CHANGE',  label: 'تغيير زيت' },
  { value: 'TIRE',        label: 'إطارات' },
  { value: 'BATTERY',     label: 'بطارية' },
  { value: 'BRAKE',       label: 'فرامل' },
  { value: 'AC',          label: 'تكييف' },
  { value: 'ELECTRICAL',  label: 'كهرباء' },
  { value: 'ENGINE',      label: 'محرك' },
  { value: 'SUSPENSION',  label: 'تعليق' },
  { value: 'DIAGNOSIS',   label: 'فحص وتشخيص' },
  { value: 'GENERAL',     label: 'صيانة عامة' },
  { value: 'CUSTOM',      label: 'أخرى' },
];

function mwImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

const EMPTY = {
  name: '', nameAr: '', description: '',
  workshopTypeId: '',
  vehicleType: '', vehicleModel: '', year: '', plateNumber: '',
  city: '', latitude: '', longitude: '', serviceRadius: '',
  basePrice: '', pricePerKm: '', hourlyRate: '', minPrice: '', currency: 'SAR',
  imageUrl: '', vehicleImageUrl: '',
  vendorId: '', isAvailable: true, isActive: true, isVerified: false,
};

// ── Inline Service Row (edit mode) ──────────────────────────────────────────
function ServiceRow({ svc, workshopId, typeServices = [], onSaved, onDeleted }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(!svc.id);
  const [form, setForm] = useState({
    workshopTypeServiceId: svc.workshopTypeServiceId ?? '',
    serviceType:       svc.serviceType       || 'GENERAL',
    name:              svc.name              || '',
    nameAr:            svc.nameAr            || '',
    description:       svc.description       || '',
    price:             svc.price             ?? '',
    currency:          svc.currency          || 'SAR',
    estimatedDuration: svc.estimatedDuration ?? '',
    isActive:          svc.isActive          ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, price: parseFloat(form.price), estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration) : null, workshopTypeServiceId: form.workshopTypeServiceId || null };
      return svc.id
        ? mobileWorkshopService.updateService(workshopId, svc.id, payload)
        : mobileWorkshopService.addService(workshopId, payload);
    },
    onSuccess: (saved) => { setEditing(false); onSaved(saved); queryClient.invalidateQueries({ queryKey: ['mobile-workshop', workshopId] }); },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => mobileWorkshopService.deleteService(workshopId, svc.id),
    onSuccess: () => { onDeleted(svc.id); queryClient.invalidateQueries({ queryKey: ['mobile-workshop', workshopId] }); },
    onError: (err) => toast.error(err?.message || 'فشل الحذف'),
  });

  const h = (e) => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };

  if (!editing) return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {SERVICE_TYPES.find(s => s.value === form.serviceType)?.label || form.serviceType}
          </span>
          {svc.workshopTypeService && (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700" title="مرتبط بنوع الورشة">
              {svc.workshopTypeService.nameAr || svc.workshopTypeService.name}
            </span>
          )}
          <span className="font-semibold text-slate-900">{form.name}</span>
          {form.nameAr && <span className="text-slate-500 text-sm">{form.nameAr}</span>}
          <span className={`rounded-full px-2 py-0.5 text-xs ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
            {form.isActive ? 'نشطة' : 'موقوفة'}
          </span>
        </div>
        {form.description && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{form.description}</p>}
        <div className="mt-1 flex flex-wrap gap-3 text-sm">
          <span className="font-bold text-emerald-700">{form.price} {form.currency}</span>
          {form.estimatedDuration && <span className="text-slate-400 text-xs">⏱ {form.estimatedDuration} دقيقة</span>}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button type="button" onClick={() => setEditing(true)} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50"><Pencil className="size-4" /></button>
        <button type="button" onClick={() => window.confirm('حذف الخدمة؟') && deleteMutation.mutate()} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
      {typeServices.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">ربط بخدمة من نوع الورشة (اختياري)</label>
          <select name="workshopTypeServiceId" value={form.workshopTypeServiceId} onChange={h}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <option value="">— بدون نوع —</option>
            {typeServices.map((ts) => (
              <option key={ts.id} value={ts.id}>{ts.nameAr || ts.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">نوع الخدمة</label>
          <select name="serviceType" value={form.serviceType} onChange={h}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            {SERVICE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">اسم الخدمة *</label>
          <input name="name" value={form.name} onChange={h} required placeholder="مثال: تغيير زيت وفلتر"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">الاسم بالعربي</label>
          <input name="nameAr" value={form.nameAr} onChange={h} dir="rtl" placeholder="اختياري"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">السعر (ر.س) *</label>
          <input name="price" type="number" value={form.price} onChange={h} required min="0" step="0.5" placeholder="مثال: 120"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">المدة (دقيقة)</label>
          <input name="estimatedDuration" type="number" value={form.estimatedDuration} onChange={h} min="5" step="5" placeholder="مثال: 45"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={h} className="size-4 rounded border-slate-300 text-indigo-600" />
            <span className="text-sm text-slate-700">الخدمة نشطة</span>
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">تفاصيل / وصف الخدمة</label>
        <textarea name="description" value={form.description} onChange={h} rows={2} placeholder="تفاصيل ما تشمله الخدمة..."
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
      </div>
      <div className="flex justify-end gap-2">
        {svc.id && <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"><X className="size-4" />إلغاء</button>}
        <button type="button" onClick={() => { if (!form.name || !form.price) return toast.error('الاسم والسعر مطلوبان'); saveMutation.mutate(); }}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
          <Check className="size-4" />{saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخدمة'}
        </button>
      </div>
    </div>
  );
}

// ── صف إضافة سعر لخدمة نوع (وضع التعديل — الخدمة غير مضافة بعد) ──
function TypeServicePriceRow({ typeService, workshopId, onAdded }) {
  const [price, setPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const addMutation = useMutation({
    mutationFn: () => mobileWorkshopService.addService(workshopId, {
      workshopTypeServiceId: typeService.id,
      name: typeService.name,
      nameAr: typeService.nameAr || null,
      description: typeService.description || null,
      serviceType: 'GENERAL',
      price: parseFloat(price),
      currency: 'SAR',
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
    }),
    onSuccess: () => { toast.success('تمت إضافة الخدمة'); onAdded(); setPrice(''); setEstimatedDuration(''); },
    onError: (err) => toast.error(err?.message || 'فشل'),
  });
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-3">
      <div className="min-w-[140px] font-medium text-slate-800">{typeService.nameAr || typeService.name}</div>
      <input type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="السعر (ر.س)" className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      <input type="number" min="0" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="المدة (دقيقة)" className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      <button type="button" onClick={() => { if (!price || Number(price) <= 0) return toast.error('أدخل السعر'); addMutation.mutate(); }} disabled={addMutation.isPending} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">إضافة</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateEditMobileWorkshopPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  // أسعار خدمات النوع (عند الإنشاء): { [typeServiceId]: { price: '', estimatedDuration: '' } }
  const [typeServicePrices, setTypeServicePrices] = useState({});
  const fileInputLogoRef = useRef(null);
  const fileInputVehicleRef = useRef(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ['mobile-workshop', id],
    queryFn: () => mobileWorkshopService.getById(id),
    enabled: isEdit,
  });

  const { data: workshopTypes = [] } = useQuery({
    queryKey: ['mobile-workshop-types'],
    queryFn: () => mobileWorkshopTypeService.getAll({ includeInactive: 'true' }),
    staleTime: 60_000,
  });

  const selectedType = workshopTypes.find((t) => t.id === form.workshopTypeId);
  const typeServicesList = selectedType?.typeServices ?? [];

  const { data: vendorsResult } = useQuery({
    queryKey: ['vendors', { vendorType: 'MOBILE_WORKSHOP', limit: 100 }],
    queryFn: () => vendorService.getVendors({ vendorType: 'MOBILE_WORKSHOP', limit: 100 }),
    staleTime: 60_000,
  });
  const mobileVendors = vendorsResult?.vendors ?? [];

  // Fetch selected vendor details to show vehicle info
  const { data: selectedVendor, isFetching: vendorFetching } = useQuery({
    queryKey: ['vendor-detail', selectedVendorId],
    queryFn: () => vendorService.getVendorById(selectedVendorId),
    enabled: Boolean(selectedVendorId),
    staleTime: 30_000,
  });

  // Existing services (edit mode)
  const savedServices = item?.services ?? [];

  // Sync selectedVendorId when form.vendorId is set (edit mode)
  useEffect(() => {
    // eslint-disable-next-line
    if (item?.vendorId) setSelectedVendorId(item.vendorId);
  }, [item?.vendorId]);

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line
      setForm({
        name: item.name || '', nameAr: item.nameAr || '', description: item.description || '',
        workshopTypeId: item.workshopTypeId || '',
        vehicleType: item.vehicleType || '', vehicleModel: item.vehicleModel || '',
        year: item.year ?? '', plateNumber: item.plateNumber || '',
        city: item.city || '', latitude: item.latitude ?? '', longitude: item.longitude ?? '',
        serviceRadius: item.serviceRadius ?? '',
        basePrice: item.basePrice ?? '', pricePerKm: item.pricePerKm ?? '',
        hourlyRate: item.hourlyRate ?? '', minPrice: item.minPrice ?? '', currency: item.currency || 'SAR',
        imageUrl: item.imageUrl || '', vehicleImageUrl: item.vehicleImageUrl || '',
        vendorId: item.vendorId || '',
        isAvailable: item.isAvailable ?? true, isActive: item.isActive ?? true, isVerified: item.isVerified ?? false,
      });
    }
  }, [item]);

  const uploadImageMutation = useMutation({
    mutationFn: ({ file, type }) => mobileWorkshopService.uploadImage(id, file, type),
    onSuccess: (result) => {
      setForm((p) => ({ ...p, [result.field]: result.imageUrl }));
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop', id] });
      toast.success('تم رفع الصورة');
    },
    onError: (err) => toast.error(err?.message || 'فشل رفع الصورة'),
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? mobileWorkshopService.update(id, data) : mobileWorkshopService.create(data),
    onSuccess: async (saved) => {
      if (!isEdit) {
        // خدمات نوع الورشة — أضف كل خدمة لها سعر
        const typeServicesListForSubmit = workshopTypes.find((t) => t.id === form.workshopTypeId)?.typeServices ?? [];
        for (const ts of typeServicesListForSubmit) {
          const p = typeServicePrices[ts.id];
          if (p && p.price != null && p.price !== '' && Number(p.price) > 0) {
            await mobileWorkshopService.addService(saved.id, {
              workshopTypeServiceId: ts.id,
              name: ts.name,
              nameAr: ts.nameAr || null,
              description: ts.description || null,
              serviceType: 'GENERAL',
              price: Number(p.price),
              currency: 'SAR',
              estimatedDuration: p.estimatedDuration ? parseInt(p.estimatedDuration, 10) : null,
            }).catch((err) => toast.error(err?.message || 'فشل إضافة خدمة'));
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['mobile-workshops'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['mobile-workshop', id] });
      toast.success(isEdit ? 'تم التحديث' : 'تم الإضافة');
      navigate(`/mobile-workshops/${saved.id}`);
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'حدث خطأ'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'vendorId') setSelectedVendorId(value);
    if (name === 'workshopTypeId') setTypeServicePrices({});
  };

  const setTypeServicePrice = (typeServiceId, field, value) => {
    setTypeServicePrices((prev) => ({
      ...prev,
      [typeServiceId]: { ...(prev[typeServiceId] || {}), [field]: value },
    }));
  };

  // Auto-fill form when vendor is selected and has a mobile workshop registered
  useEffect(() => {
    if (!selectedVendor) return;
    const mw = selectedVendor.mobileWorkshop;
    // eslint-disable-next-line
    setForm(p => ({
      ...p,
      vendorId: selectedVendor.id,
      ...(mw ? {
        name:            mw.name            || p.name,
        nameAr:          mw.nameAr          || p.nameAr,
        description:     mw.description     || p.description,
        vehicleType:     mw.vehicleType     || p.vehicleType,
        vehicleModel:    mw.vehicleModel    || p.vehicleModel,
        year:            mw.year            ?? p.year,
        plateNumber:     mw.plateNumber     || p.plateNumber,
        city:            mw.city            || p.city,
        serviceRadius:   mw.serviceRadius   ?? p.serviceRadius,
        basePrice:       mw.basePrice       ?? p.basePrice,
        pricePerKm:      mw.pricePerKm      ?? p.pricePerKm,
        hourlyRate:      mw.hourlyRate      ?? p.hourlyRate,
        minPrice:        mw.minPrice        ?? p.minPrice,
        imageUrl:        mw.imageUrl        || p.imageUrl,
        vehicleImageUrl: mw.vehicleImageUrl || p.vehicleImageUrl,
      } : {}),
    }));
  }, [selectedVendor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      workshopTypeId: form.workshopTypeId || null,
      year: form.year ? parseInt(form.year) : null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      serviceRadius: form.serviceRadius ? parseFloat(form.serviceRadius) : null,
      basePrice: form.basePrice ? parseFloat(form.basePrice) : null,
      pricePerKm: form.pricePerKm ? parseFloat(form.pricePerKm) : null,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
      minPrice: form.minPrice ? parseFloat(form.minPrice) : null,
      vendorId: form.vendorId || null,
    });
  };

  if (isEdit && isLoading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/mobile-workshops" className="rounded-lg p-2 hover:bg-slate-100"><ArrowLeft className="size-5 text-slate-500" /></Link>
        <div className="flex items-center gap-2">
          <Wrench className="size-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'تعديل الورشة المتنقلة' : 'إضافة ورشة متنقلة'}</h1>
            <p className="text-slate-500">ربط ورشة متنقلة بفيندور من نوع "ورشة متنقلة"</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Step 1: Select Vendor first ─────────────────────────────────── */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <h3 className="font-semibold text-slate-800">اختر الفيندور</h3>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">فيندور "ورشة متنقلة"</label>
            <select name="vendorId" value={form.vendorId} onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">-- اختر فيندور --</option>
              {mobileVendors.map(v => (
                <option key={v.id} value={v.id}>{v.businessName}{v.businessNameAr ? ` / ${v.businessNameAr}` : ''}</option>
              ))}
            </select>
            {mobileVendors.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">لا يوجد فيندورز من نوع "ورشة متنقلة" — <Link to="/vendors/new" className="underline">أضف فيندور جديد</Link></p>
            )}
          </div>

          {/* Loading */}
          {vendorFetching && (
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-600">
              <span className="size-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              جاري تحميل بيانات الفيندور...
            </div>
          )}

          {/* Vendor card */}
          {selectedVendor && !vendorFetching && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-indigo-100">
                {selectedVendor.logo ? (
                  <img src={selectedVendor.logo} alt="" className="size-12 rounded-xl object-cover ring-2 ring-white shadow" />
                ) : (
                  <div className="size-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <User className="size-6 text-indigo-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{selectedVendor.businessName}</p>
                  {selectedVendor.businessNameAr && <p className="text-sm text-slate-500 truncate">{selectedVendor.businessNameAr}</p>}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">ورشة متنقلة</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${selectedVendor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {selectedVendor.status === 'ACTIVE' ? 'نشط' : selectedVendor.status}
                    </span>
                  </div>
                </div>
                <Link to={`/vendors/${selectedVendor.id}`} target="_blank"
                  className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100">
                  عرض الملف
                </Link>
              </div>

              {/* Contact row */}
              <div className="flex flex-wrap gap-0 divide-x divide-x-reverse divide-indigo-100 border-b border-indigo-100 text-sm">
                {selectedVendor.user?.phone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-slate-600">
                    <Phone className="size-4 text-indigo-400 shrink-0" />
                    <span>{selectedVendor.user.phone}</span>
                  </div>
                )}
                {selectedVendor.user?.email && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-slate-600">
                    <Mail className="size-4 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{selectedVendor.user.email}</span>
                  </div>
                )}
                {selectedVendor.city && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-slate-600">
                    <MapPin className="size-4 text-indigo-400 shrink-0" />
                    <span>{selectedVendor.city}</span>
                  </div>
                )}
              </div>

              {/* Vehicle details — auto-filled notice */}
              {selectedVendor.mobileWorkshop ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Car className="size-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-700">المركبة المسجّلة</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">تم تعبئة البيانات تلقائياً ↓</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      { label: 'نوع المركبة',   value: selectedVendor.mobileWorkshop.vehicleType },
                      { label: 'الموديل',        value: selectedVendor.mobileWorkshop.vehicleModel },
                      { label: 'سنة الصنع',     value: selectedVendor.mobileWorkshop.year },
                      { label: 'رقم اللوحة',    value: selectedVendor.mobileWorkshop.plateNumber },
                      { label: 'المدينة',        value: selectedVendor.mobileWorkshop.city },
                      { label: 'سعر الزيارة',   value: selectedVendor.mobileWorkshop.basePrice ? `${selectedVendor.mobileWorkshop.basePrice} ر.س` : null },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedVendor.mobileWorkshop.vehicleImageUrl && (
                    <img src={mwImageSrc(selectedVendor.mobileWorkshop.vehicleImageUrl) || selectedVendor.mobileWorkshop.vehicleImageUrl} alt="vehicle"
                      className="h-28 w-full rounded-xl object-cover border border-emerald-100" />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-sm text-amber-700">
                  <Car className="size-4 shrink-0" />
                  هذا الفيندور ليس لديه ورشة متنقلة مرتبطة — أكمل البيانات أدناه يدوياً.
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Step 2: Workshop details ─────────────────────────────────────── */}
        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
            <h3 className="font-semibold text-slate-800">البيانات الأساسية</h3>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">نوع الورشة (من كاتالوج الأدمن)</label>
            <select name="workshopTypeId" value={form.workshopTypeId} onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">-- اختر نوع الورشة --</option>
              {workshopTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.nameAr || t.name}{!t.isActive ? ' (موقوف)' : ''}</option>
              ))}
            </select>
            {workshopTypes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                لا توجد أنواع ورش — <Link to="/mobile-workshop-types" className="underline">أضف أنواع الورش المتنقلة من هنا</Link>
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم *" name="name" value={form.name} onChange={handleChange} required />
            <Input label="الاسم بالعربي" name="nameAr" value={form.nameAr} onChange={handleChange} dir="rtl" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">وصف الورشة</label>
            <textarea name="description" rows={2} value={form.description} onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
        </Card>

        {/* Vehicle */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
            <h3 className="font-semibold text-slate-800">بيانات المركبة</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="نوع المركبة" name="vehicleType" value={form.vehicleType} onChange={handleChange} placeholder="مثال: Van, Pickup" />
            <Input label="موديل المركبة" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} placeholder="مثال: Ford Transit" />
            <Input label="سنة الصنع" name="year" type="number" value={form.year} onChange={handleChange} min="1990" max="2030" />
            <Input label="رقم اللوحة" name="plateNumber" value={form.plateNumber} onChange={handleChange} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* صورة الفني / الشعار — رفع ملف */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">صورة الفني / الشعار</label>
              {isEdit ? (
                <div className="space-y-2">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {form.imageUrl ? (
                      <img src={mwImageSrc(form.imageUrl) || form.imageUrl} alt="شعار/فني" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImagePlus className="size-10" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputLogoRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImageMutation.mutate({ file, type: 'logo' });
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputLogoRef.current?.click()}
                    disabled={uploadImageMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <Upload className="size-4" /> {uploadImageMutation.isPending ? 'جاري الرفع...' : 'رفع صورة'}
                  </button>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  بعد حفظ الورشة يمكنك رفع صورة الفني/الشعار من صفحة التعديل.
                </p>
              )}
            </div>
            {/* صورة المركبة — رفع ملف */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">صورة المركبة</label>
              {isEdit ? (
                <div className="space-y-2">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {form.vehicleImageUrl ? (
                      <img src={mwImageSrc(form.vehicleImageUrl) || form.vehicleImageUrl} alt="المركبة" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Car className="size-10" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputVehicleRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImageMutation.mutate({ file, type: 'vehicle' });
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputVehicleRef.current?.click()}
                    disabled={uploadImageMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <Upload className="size-4" /> {uploadImageMutation.isPending ? 'جاري الرفع...' : 'رفع صورة'}
                  </button>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  بعد حفظ الورشة يمكنك رفع صورة المركبة من صفحة التعديل.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">4</span>
            <h3 className="font-semibold text-slate-800">التغطية الجغرافية</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Input label="المدينة" name="city" value={form.city} onChange={handleChange} />
            <Input label="نطاق الخدمة (كم)" name="serviceRadius" type="number" value={form.serviceRadius} onChange={handleChange} step="1" placeholder="30" />
            <Input label="خط العرض" name="latitude" type="number" value={form.latitude} onChange={handleChange} step="any" />
            <Input label="خط الطول" name="longitude" type="number" value={form.longitude} onChange={handleChange} step="any" />
          </div>
        </Card>

        {/* ── Services with Prices ───────────────────────────────────────── */}
        <Card className="p-6 space-y-4">
          <div className="border-b pb-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mr-2">5</span>
            <h3 className="font-semibold text-slate-800 inline">الخدمات والأسعار</h3>
            <p className="text-xs text-slate-400 mt-0.5">اختر نوع الورشة أولاً فتظهر خدمات النوع — أدخل السعر والمدة لكل خدمة</p>
          </div>

          {!form.workshopTypeId ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              اختر نوع الورشة من الخطوة 2 (البيانات الأساسية) لتظهر قائمة خدمات النوع وتحديد السعر لكل خدمة.
            </div>
          ) : typeServicesList.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              نوع الورشة المختار لا يحتوي على خدمات. أضف خدمات لهذا النوع من صفحة <Link to="/mobile-workshop-types" className="text-indigo-600 underline">أنواع الورش المتنقلة</Link> ثم حدد السعر هنا، أو أضف خدمات إضافية أدناه.
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">خدمات نوع &quot;{selectedType?.nameAr || selectedType?.name}&quot; — حدد السعر والمدة لكل خدمة</h4>
                <div className="space-y-3">
                  {typeServicesList.map((ts) => {
                    if (isEdit) {
                      const existingSvc = savedServices.find((s) => s.workshopTypeServiceId === ts.id);
                      if (existingSvc) {
                        return (
                          <ServiceRow
                            key={ts.id}
                            svc={existingSvc}
                            workshopId={id}
                            typeServices={typeServicesList}
                            onSaved={() => queryClient.invalidateQueries({ queryKey: ['mobile-workshop', id] })}
                            onDeleted={() => queryClient.invalidateQueries({ queryKey: ['mobile-workshop', id] })}
                          />
                        );
                      }
                      return (
                        <TypeServicePriceRow
                          key={ts.id}
                          typeService={ts}
                          workshopId={id}
                          onAdded={() => queryClient.invalidateQueries({ queryKey: ['mobile-workshop', id] })}
                        />
                      );
                    }
                    const p = typeServicePrices[ts.id] || {};
                    return (
                      <div key={ts.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="min-w-[140px] font-medium text-slate-800">{ts.nameAr || ts.name}</div>
                        {ts.description && <span className="text-xs text-slate-500 max-w-[200px] truncate">{ts.description}</span>}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">السعر (ر.س)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={p.price ?? ''}
                            onChange={(e) => setTypeServicePrice(ts.id, 'price', e.target.value)}
                            className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">المدة (دقيقة)</label>
                          <input
                            type="number"
                            min="0"
                            value={p.estimatedDuration ?? ''}
                            onChange={(e) => setTypeServicePrice(ts.id, 'estimatedDuration', e.target.value)}
                            className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                            placeholder="—"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Status */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">الحالة</h3>
          <div className="flex flex-wrap gap-6">
            {[{ name: 'isAvailable', label: 'متاحة للطلبات' }, { name: 'isActive', label: 'نشطة' }, { name: 'isVerified', label: 'موثّقة (Admin)' }].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange}
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <button type="submit" disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            <Save className="size-4" />
            {mutation.isPending ? 'جاري الحفظ...' : (isEdit ? 'حفظ التغييرات' : 'إضافة الورشة')}
          </button>
        </div>
      </form>

      {/* Documents tied to the linked vendor */}
      {form.vendorId ? (
        <VendorDocuments vendorId={form.vendorId} />
      ) : (
        <Card className="p-5 text-center text-sm text-slate-400">
          اختر الفيندور أولاً لتتمكن من رفع المستندات
        </Card>
      )}
    </div>
  );
}
