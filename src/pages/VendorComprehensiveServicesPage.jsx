import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Wrench, Plus, Pencil, Trash2, CalendarCheck, Upload, Eye, PlusCircle } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';
import { API_BASE_URL } from '../config/env';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const defaultPricing = () => [];

function fullImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? url : '/' + url}`;
}

export default function VendorComprehensiveServicesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const vendorType = user?.vendorType;
  const isCarWash = vendorType === 'CAR_WASH';
  const categoryFromVendor = isCarWash ? 'CLEANING' : 'COMPREHENSIVE_CARE';
  const [adminServiceType, setAdminServiceType] = useState('COMPREHENSIVE_CARE');
  const category = isAdmin ? adminServiceType : categoryFromVendor;
  const isAr = i18n.language === 'ar';
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputRefEdit = useRef(null);
  const defaultWorkingDays = () =>
    [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      dayOfWeek,
      enabled: dayOfWeek >= 0 && dayOfWeek <= 4,
      start: '09:00',
      end: '17:00',
    }));

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    estimatedDuration: 150,
    imageUrl: '',
    slotDurationMinutes: 60,
    workingDays: defaultWorkingDays(),
    pricing: defaultPricing(),
  });

  const { data: services = [], isLoading, isError, error } = useQuery({
    queryKey: ['services', { category, vendorId: isAdmin ? undefined : 'me' }],
    queryFn: () => serviceService.getServices(isAdmin ? { category } : { category, vendorId: 'me' }),
    staleTime: 60_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const buildWorkingHours = (workingDays) =>
    (workingDays || [])
      .filter((d) => d.enabled && d.start && d.end)
      .map((d) => ({ dayOfWeek: d.dayOfWeek, start: d.start, end: d.end }));

  const createMutation = useMutation({
    mutationFn: (payload) => {
      const { workingDays, pricing, ...rest } = payload;
      return serviceService.createService({
        ...rest,
        category,
        type: 'FIXED',
        workingHours: buildWorkingHours(workingDays),
        slotDurationMinutes: payload.slotDurationMinutes ?? 60,
        pricing: (pricing || []).map((p) => ({
          vehicleType: p.vehicleType,
          basePrice: Number(p.basePrice) || 0,
          discountedPrice: p.discountedPrice !== '' && p.discountedPrice != null ? Number(p.discountedPrice) : null,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(isAr ? 'تم إضافة الخدمة' : 'Service added');
      setShowAdd(false);
      setForm({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        estimatedDuration: 150,
        imageUrl: '',
        slotDurationMinutes: 60,
        workingDays: defaultWorkingDays(),
        pricing: defaultPricing(),
      });
      fileInputRef.current && (fileInputRef.current.value = '');
    },
    onError: (e) => toast.error(e?.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => {
      const { workingDays, pricing, ...rest } = payload;
      return serviceService.updateService(id, {
        ...rest,
        workingHours: buildWorkingHours(workingDays),
        slotDurationMinutes: payload.slotDurationMinutes ?? undefined,
        pricing: (pricing || []).map((p) => ({
          vehicleType: p.vehicleType,
          basePrice: Number(p.basePrice) || 0,
          discountedPrice: p.discountedPrice !== '' && p.discountedPrice != null ? Number(p.discountedPrice) : null,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(isAr ? 'تم التحديث' : 'Updated');
      setEditingId(null);
    },
    onError: (e) => toast.error(e?.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(isAr ? 'تم حذف الخدمة' : 'Service removed');
    },
    onError: (e) => toast.error(e?.message),
  });

  const DAY_NAMES = [
    { key: 0, en: 'Sun', ar: 'الأحد' },
    { key: 1, en: 'Mon', ar: 'الإثنين' },
    { key: 2, en: 'Tue', ar: 'الثلاثاء' },
    { key: 3, en: 'Wed', ar: 'الأربعاء' },
    { key: 4, en: 'Thu', ar: 'الخميس' },
    { key: 5, en: 'Fri', ar: 'الجمعة' },
    { key: 6, en: 'Sat', ar: 'السبت' },
  ];

  const openEdit = (s) => {
    setEditingId(s.id);
    const hours = Array.isArray(s.workingHours) ? s.workingHours : [];
    const workingDays = DAY_NAMES.map(({ key }) => {
      const h = hours.find((x) => Number(x.dayOfWeek) === key);
      return h
        ? { dayOfWeek: key, enabled: true, start: h.start || '09:00', end: h.end || '17:00' }
        : { dayOfWeek: key, enabled: false, start: '09:00', end: '17:00' };
    });
    const existingPricing = Array.isArray(s.pricing) ? s.pricing : [];
    const pricing = existingPricing.map((p) => ({
      vehicleType: p.vehicleType,
      basePrice: p.basePrice != null ? Number(p.basePrice) : 0,
      discountedPrice: p.discountedPrice != null ? Number(p.discountedPrice) : '',
    }));
    setForm({
      name: s.name ?? '',
      nameAr: s.nameAr ?? '',
      description: s.description ?? '',
      descriptionAr: s.descriptionAr ?? '',
      estimatedDuration: s.estimatedDuration ?? 150,
      imageUrl: s.imageUrl ?? '',
      slotDurationMinutes: s.slotDurationMinutes ?? 60,
      workingDays,
      pricing,
    });
    if (fileInputRefEdit.current) fileInputRefEdit.current.value = '';
  };

  const handleImageChange = async (e, isEdit = false) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(isAr ? 'اختر ملف صورة (JPG, PNG, WebP)' : 'Please select an image file (JPG, PNG, WebP)');
      return;
    }
    setImageUploading(true);
    try {
      const url = await serviceService.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success(isAr ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (err) {
      toast.error(err?.message || (isAr ? 'فشل رفع الصورة' : 'Upload failed'));
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
      </div>
    );
  }

  const allowedVendor = vendorType === 'COMPREHENSIVE_CARE' || vendorType === 'CAR_WASH';
  if (user?.role === 'VENDOR' && !allowedVendor) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور العناية الشاملة أو خدمة الغسيل فقط.' : 'This page is only available for comprehensive care or car wash vendor accounts.'}</p>
        </Card>
      </div>
    );
  }
  if (isError && error?.response?.status === 403 && !isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور العناية الشاملة أو خدمة الغسيل فقط.' : 'This page is only available for comprehensive care or car wash vendor accounts.'}</p>
        </Card>
      </div>
    );
  }

  const pageTitle = isAdmin
    ? (isAr ? 'الخدمات' : 'Services')
    : isCarWash
      ? (isAr ? 'خدمات الغسيل' : 'Car wash services')
      : (isAr ? 'خدمات العناية الشاملة' : 'My Comprehensive Care Services');
  const pageSubtitle = isAdmin
    ? (isAr ? 'اختر نوع الخدمة لعرضها' : 'Select service type to view')
    : isCarWash
      ? (isAr ? 'أضف وعدّل خدمات الغسيل الخاصة بك' : 'Add and edit your car wash services')
      : (isAr ? 'أضف وعدّل الخدمات الخاصة بك' : 'Add and edit your services');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <select
              value={adminServiceType}
              onChange={(e) => setAdminServiceType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="COMPREHENSIVE_CARE">{isAr ? 'العناية الشاملة' : 'Comprehensive Care'}</option>
              <option value="CLEANING">{isAr ? 'خدمة الغسيل' : 'Car Wash'}</option>
            </select>
          )}
          {!isAdmin && (
            <Link
              to="/vendor/comprehensive-care/bookings"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarCheck className="size-4" />
              {isAr ? 'مواعيد الحجوزات' : 'Appointments'}
            </Link>
          )}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="size-4" />
              {isAr ? 'إضافة خدمة' : 'Add service'}
            </button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {services.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {isAr ? (isCarWash ? 'لا توجد خدمات غسيل بعد. أضف خدمة.' : 'لا توجد خدمات بعد. أضف خدمة.') : (isCarWash ? 'No car wash services yet. Add a service.' : 'No services yet. Add a service.')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {services.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-slate-900">{s.nameAr || s.name}</p>
                  <p className="text-sm text-slate-500">{s.descriptionAr || s.description || '—'}</p>
                  {s.estimatedDuration && <span className="text-xs text-slate-400">{s.estimatedDuration} min</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/services/${s.id}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 transition-colors hover:bg-indigo-100"
                    title={isAr ? (isCarWash ? 'عرض تفاصيل خدمة الغسيل' : 'عرض تفاصيل العناية الشاملة') : (isCarWash ? 'View car wash details' : 'View comprehensive care details')}
                    aria-label={isAr ? 'عرض التفاصيل' : 'View details'}
                  >
                    <Eye className="size-5" />
                  </Link>
                  {!isAdmin && (
                    <>
                      <button type="button" onClick={() => openEdit(s)} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50" title={isAr ? 'تعديل' : 'Edit'}>
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => window.confirm(isAr ? 'حذف الخدمة؟' : 'Delete service?') && deleteMutation.mutate(s.id)} className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50" title={isAr ? 'حذف' : 'Delete'}>
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={isAr ? 'إضافة خدمة' : 'Add service'}>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
          <Input label={isAr ? 'الاسم' : 'Name'} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label={isAr ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} />
          <Input label={isAr ? 'الوصف' : 'Description'} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label={isAr ? 'الوصف (عربي)' : 'Description (Arabic)'} value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} />
          <Input label={isAr ? 'المدة (دقيقة)' : 'Duration (min)'} type="number" value={form.estimatedDuration} onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{isAr ? 'صورة الخدمة' : 'Service image'}</label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleImageChange(e, false)} />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                <Upload className="size-4" /> {imageUploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختر صورة' : 'Choose image')}
              </button>
              {form.imageUrl && (
                <>
                  <img src={fullImageUrl(form.imageUrl)} alt="" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="text-sm text-red-600 hover:text-red-700">{isAr ? 'إزالة' : 'Remove'}</button>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{isAr ? 'JPG أو PNG أو WebP، حد أقصى 5 ميجا' : 'JPG, PNG or WebP, max 5MB'}</p>
          </div>
          <PricingByVehicleForm form={form} setForm={setForm} isAr={isAr} />
          <AppointmentForm form={form} setForm={setForm} isAr={isAr} dayNames={DAY_NAMES} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{createMutation.isPending ? '...' : (isAr ? 'إضافة' : 'Add')}</button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editingId} onClose={() => setEditingId(null)} title={isAr ? 'تعديل الخدمة' : 'Edit service'}>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, ...form }); }} className="space-y-4">
          <Input label={isAr ? 'الاسم' : 'Name'} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label={isAr ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} />
          <Input label={isAr ? 'الوصف' : 'Description'} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label={isAr ? 'الوصف (عربي)' : 'Description (Arabic)'} value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} />
          <Input label={isAr ? 'المدة (دقيقة)' : 'Duration (min)'} type="number" value={form.estimatedDuration} onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{isAr ? 'صورة الخدمة' : 'Service image'}</label>
            <input ref={fileInputRefEdit} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleImageChange(e, true)} />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => fileInputRefEdit.current?.click()} disabled={imageUploading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                <Upload className="size-4" /> {imageUploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختر صورة' : 'Choose image')}
              </button>
              {form.imageUrl && (
                <>
                  <img src={fullImageUrl(form.imageUrl)} alt="" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="text-sm text-red-600 hover:text-red-700">{isAr ? 'إزالة' : 'Remove'}</button>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{isAr ? 'JPG أو PNG أو WebP، حد أقصى 5 ميجا' : 'JPG, PNG or WebP, max 5MB'}</p>
          </div>
          <PricingByVehicleForm form={form} setForm={setForm} isAr={isAr} />
          <AppointmentForm form={form} setForm={setForm} isAr={isAr} dayNames={DAY_NAMES} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{updateMutation.isPending ? '...' : (isAr ? 'حفظ' : 'Save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PricingByVehicleForm({ form, setForm, isAr }) {
  const [newVehicleName, setNewVehicleName] = useState('');
  const setPricingRow = (index, field, value) => {
    setForm((f) => ({
      ...f,
      pricing: (f.pricing || []).map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };
  const removePricingRow = (index) => {
    setForm((f) => ({
      ...f,
      pricing: (f.pricing || []).filter((_, i) => i !== index),
    }));
  };
  const addPricingRow = (vehicleType) => {
    if (!vehicleType) return;
    setForm((f) => ({
      ...f,
      pricing: [...(f.pricing || []), { vehicleType, basePrice: 0, discountedPrice: '' }],
    }));
  };
  const handleAddByText = () => {
    const name = newVehicleName.trim();
    if (!name) {
      toast.error(isAr ? 'اكتب اسم نوع المركبة أولاً' : 'Enter vehicle type name first');
      return;
    }
    const used = (form.pricing || []).map((p) => (p.vehicleType || '').trim().toLowerCase());
    if (used.includes(name.toLowerCase())) {
      toast.error(isAr ? 'نوع المركبة مضاف مسبقاً' : 'This vehicle type is already added');
      return;
    }
    addPricingRow(name);
    setNewVehicleName('');
  };
  const pricing = form.pricing || defaultPricing();
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        {isAr ? 'الأسعار حسب نوع المركبة (SAR)' : 'Pricing by vehicle type (SAR)'}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-2 pr-4 font-medium text-slate-600">{isAr ? 'نوع المركبة' : 'Vehicle type'}</th>
              <th className="pb-2 pr-4 font-medium text-slate-600">{isAr ? 'السعر الأساسي (ر.س)' : 'Base price (SAR)'}</th>
              <th className="pb-2 pr-4 font-medium text-slate-600">{isAr ? 'السعر بعد الخصم (ر.س)' : 'Discounted price (SAR)'}</th>
              <th className="pb-2 w-10 font-medium text-slate-600" />
            </tr>
          </thead>
          <tbody>
            {pricing.map((row, index) => (
              <tr key={`${row.vehicleType}-${index}`} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-800">{row.vehicleType ?? '—'}</td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.basePrice === '' ? '' : row.basePrice}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPricingRow(index, 'basePrice', v === '' ? '' : (Number(v) || 0));
                    }}
                    className="w-24 rounded border border-slate-300 px-2 py-1.5 text-slate-900"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.discountedPrice === '' ? '' : row.discountedPrice}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPricingRow(index, 'discountedPrice', v === '' ? '' : (Number(v) || 0));
                    }}
                    className="w-24 rounded border border-slate-300 px-2 py-1.5 text-slate-900"
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removePricingRow(index)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title={isAr ? 'حذف' : 'Remove'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={newVehicleName}
          onChange={(e) => setNewVehicleName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddByText())}
          placeholder={isAr ? 'اسم نوع المركبة (مثلاً: سيدان، دفع رباعي)' : 'Vehicle type name (e.g. Sedan, SUV)'}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 min-w-[200px]"
        />
        <button
          type="button"
          onClick={handleAddByText}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <PlusCircle className="h-4 w-4" />
          {isAr ? 'إضافة' : 'Add'}
        </button>
      </div>
      {pricing.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">{isAr ? 'لم تضف أي أسعار بعد. اكتب اسم نوع المركبة ثم انقر «إضافة».' : 'No pricing yet. Type the vehicle type name and click «Add».'}</p>
      )}
    </div>
  );
}

function AppointmentForm({ form, setForm, isAr, dayNames }) {
  const setWorkingDay = (index, patch) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{isAr ? 'مواعيد العمل (Appointment)' : 'Appointment (مواعيد العمل)'}</h3>
      <p className="mb-3 text-xs text-slate-500">{isAr ? 'حدد أوقات استقبال الحجوزات حتى لا يحجز عميلان في نفس الوقت.' : 'Set when this service is available so customers don’t double-book.'}</p>
      <Input
        label={isAr ? 'مدة الموعد (دقيقة)' : 'Slot duration (min)'}
        type="number"
        min={15}
        value={form.slotDurationMinutes ?? 60}
        onChange={(e) => setForm((f) => ({ ...f, slotDurationMinutes: e.target.value }))}
      />
      <div className="mt-3 space-y-2">
        {dayNames.map((day, index) => {
          const d = form.workingDays?.[index] ?? { dayOfWeek: day.key, enabled: false, start: '09:00', end: '17:00' };
          return (
            <div key={day.key} className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white p-2">
              <label className="flex w-24 shrink-0 items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={!!d.enabled}
                  onChange={(e) => setWorkingDay(index, { enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">{isAr ? day.ar : day.en}</span>
              </label>
              <input
                type="time"
                value={d.start || '09:00'}
                onChange={(e) => setWorkingDay(index, { start: e.target.value })}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                disabled={!d.enabled}
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                value={d.end || '17:00'}
                onChange={(e) => setWorkingDay(index, { end: e.target.value })}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                disabled={!d.enabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
