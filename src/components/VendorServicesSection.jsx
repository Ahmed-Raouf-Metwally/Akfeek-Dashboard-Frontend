import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { serviceService } from '../services/serviceService';
import Modal from './ui/Modal';
import { Card } from './ui/Card';
import { API_BASE_URL } from '../config/env';

const VEHICLE_TYPES = [
  { value: 'SEDAN', labelEn: 'Sedan', labelAr: 'سيدان' },
  { value: 'HATCHBACK', labelEn: 'Hatchback', labelAr: 'هاتشباك' },
  { value: 'COUPE', labelEn: 'Coupe', labelAr: 'كوبيه' },
  { value: 'SMALL_SUV', labelEn: 'Small SUV', labelAr: 'دفع رباعي صغير' },
  { value: 'LARGE_SEDAN', labelEn: 'Large Sedan', labelAr: 'سيدان كبيرة' },
  { value: 'SUV', labelEn: 'SUV', labelAr: 'دفع رباعي' },
  { value: 'CROSSOVER', labelEn: 'Crossover', labelAr: 'كروس أوفر' },
  { value: 'TRUCK', labelEn: 'Truck', labelAr: 'شاحنة/بيك أب' },
  { value: 'VAN', labelEn: 'Van', labelAr: 'فان' },
  { value: 'BUS', labelEn: 'Bus', labelAr: 'باص' },
];

const DAY_NAMES = [
  { key: 0, en: 'Sun', ar: 'الأحد' },
  { key: 1, en: 'Mon', ar: 'الإثنين' },
  { key: 2, en: 'Tue', ar: 'الثلاثاء' },
  { key: 3, en: 'Wed', ar: 'الأربعاء' },
  { key: 4, en: 'Thu', ar: 'الخميس' },
  { key: 5, en: 'Fri', ar: 'الجمعة' },
  { key: 6, en: 'Sat', ar: 'السبت' },
];

function fullImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? url : '/' + url}`;
}

function ServiceForm({ service, onSubmit, onCancel, vendorType }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const fileInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [form, setForm] = useState({
    name: service?.name || '',
    nameAr: service?.nameAr || '',
    description: service?.description || '',
    descriptionAr: service?.descriptionAr || '',
    estimatedDuration: service?.estimatedDuration || 60,
    imageUrl: service?.imageUrl || '',
    isActive: service?.isActive ?? true,
    pricing: (service?.pricing || []).map(p => ({
      vehicleType: p.vehicleType,
      basePrice: p.basePrice ?? 0,
      discountedPrice: p.discountedPrice ?? '',
    })),
    workingDays: service?.workingHours 
      ? DAY_NAMES.map(d => {
          const wh = (service.workingHours || []).find(w => Number(w.dayOfWeek) === d.key);
          return wh
            ? { dayOfWeek: d.key, enabled: true, start: wh.start || '09:00', end: wh.end || '17:00' }
            : { dayOfWeek: d.key, enabled: false, start: '09:00', end: '17:00' };
        })
      : DAY_NAMES.map(d => ({ dayOfWeek: d.key, enabled: false, start: '09:00', end: '17:00' })),
    slotDurationMinutes: service?.slotDurationMinutes || 60,
  });

  const handleImageChange = async (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error(isAr ? 'يجب إدخال اسم الخدمة' : 'Service name is required');
      return;
    }
    onSubmit(form);
  };

  const buildWorkingHours = (workingDays) =>
    (workingDays || [])
      .filter((d) => d.enabled && d.start && d.end)
      .map((d) => ({ dayOfWeek: d.dayOfWeek, start: d.start, end: d.end }));

  const setWorkingDay = (index, patch) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-700 dark:text-slate-200">
          <span className="mb-1 block font-semibold">{isAr ? 'الاسم' : 'Name'} (EN) *</span>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          <span className="mb-1 block font-semibold">{isAr ? 'الاسم' : 'Name'} (AR)</span>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
        </label>
      </div>

      <label className="text-sm text-slate-700 dark:text-slate-200">
        <span className="mb-1 block font-semibold">{isAr ? 'الوصف' : 'Description'} (EN)</span>
        <textarea
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label className="text-sm text-slate-700 dark:text-slate-200">
        <span className="mb-1 block font-semibold">{isAr ? 'الوصف' : 'Description'} (AR)</span>
        <textarea
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
          rows={2}
          value={form.descriptionAr}
          onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
        />
      </label>

      <label className="text-sm text-slate-700 dark:text-slate-200">
        <span className="mb-1 block font-semibold">{isAr ? 'المدة المقدرة (دقيقة)' : 'Duration (min)'}</span>
        <input
          type="number"
          min="1"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
          value={form.estimatedDuration}
          onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) })}
        />
      </label>

      {/* Image Upload */}
      <label className="text-sm text-slate-700 dark:text-slate-200">
        <span className="mb-1 block font-semibold">{isAr ? 'صورة الخدمة' : 'Service Image'}</span>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="size-4" />
            {imageUploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختر صورة' : 'Choose image')}
          </button>
          {form.imageUrl && (
            <>
              <img src={fullImageUrl(form.imageUrl)} alt="" className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="text-sm text-red-600 hover:text-red-700">
                {isAr ? 'إزالة' : 'Remove'}
              </button>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">{isAr ? 'JPG أو PNG أو WebP، حد أقصى 5 ميجا' : 'JPG, PNG or WebP, max 5MB'}</p>
      </label>

      {/* Pricing */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{isAr ? 'الأسعار حسب نوع المركبة (SAR)' : 'Pricing by vehicle type (SAR)'}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-2 pr-4 text-left font-medium text-slate-600 dark:text-slate-400">{isAr ? 'نوع المركبة' : 'Vehicle type'}</th>
                <th className="pb-2 pr-4 text-left font-medium text-slate-600 dark:text-slate-400">{isAr ? 'السعر الأساسي' : 'Base price'}</th>
                <th className="pb-2 pr-4 text-left font-medium text-slate-600 dark:text-slate-400">{isAr ? 'السعر بعد الخصم' : 'Discount'}</th>
                <th className="pb-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {form.pricing.map((row, index) => {
                const vt = VEHICLE_TYPES.find(vt => vt.value === row.vehicleType);
                return (
                  <tr key={`${row.vehicleType}-${index}`} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-4">{isAr && vt ? vt.labelAr : vt?.labelEn || row.vehicleType}</td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.basePrice === '' ? '' : row.basePrice}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            pricing: f.pricing.map((r, i) => (i === index ? { ...r, basePrice: e.target.value === '' ? '' : Number(e.target.value) || 0 } : r)),
                          }));
                        }}
                        className="w-20 rounded border border-slate-300 px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.discountedPrice === '' ? '' : row.discountedPrice}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            pricing: f.pricing.map((r, i) => (i === index ? { ...r, discountedPrice: e.target.value === '' ? '' : Number(e.target.value) || 0 } : r)),
                          }));
                        }}
                        className="w-20 rounded border border-slate-300 px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, pricing: f.pricing.filter((_, i) => i !== index) }))}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setForm((f) => ({
                  ...f,
                  pricing: [...f.pricing, { vehicleType: e.target.value, basePrice: 0, discountedPrice: '' }],
                }));
              }
            }}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">{isAr ? 'اختر نوع المركبة' : 'Select vehicle type'}</option>
            {VEHICLE_TYPES.filter(vt => !form.pricing.map(p => p.vehicleType).includes(vt.value)).map(vt => (
              <option key={vt.value} value={vt.value}>{isAr ? vt.labelAr : vt.labelEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Working Hours */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{isAr ? 'مواعيد العمل' : 'Working Hours'}</h4>
        <label className="mb-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="mb-1 block font-semibold">{isAr ? 'مدة الموعد (دقيقة)' : 'Slot duration (min)'}</span>
          <input
            type="number"
            min="15"
            value={form.slotDurationMinutes ?? 60}
            onChange={(e) => setForm((f) => ({ ...f, slotDurationMinutes: parseInt(e.target.value) }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
          />
        </label>
        <div className="space-y-2">
          {DAY_NAMES.map((day, index) => {
            const d = form.workingDays?.[index] ?? { dayOfWeek: day.key, enabled: false, start: '09:00', end: '17:00' };
            return (
              <div key={day.key} className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
                <label className="flex w-24 shrink-0 items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={!!d.enabled}
                    onChange={(e) => setWorkingDay(index, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{isAr ? day.ar : day.en}</span>
                </label>
                <input
                  type="time"
                  value={d.start || '09:00'}
                  onChange={(e) => setWorkingDay(index, { start: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  disabled={!d.enabled}
                />
                <span className="text-slate-400">–</span>
                <input
                  type="time"
                  value={d.end || '17:00'}
                  onChange={(e) => setWorkingDay(index, { end: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  disabled={!d.enabled}
                />
              </div>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="rounded border-slate-300 dark:border-slate-700"
        />
        <span>{isAr ? 'فعال/نشط' : 'Active'}</span>
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {isAr ? 'حفظ' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function VendorServicesSection({ vendorId, vendorType }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: () => vendorService.getVendorServices(vendorId),
    enabled: !!vendorId,
  });

  const addServiceMutation = useMutation({
    mutationFn: (payload) => vendorService.addVendorService(vendorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', vendorId] });
      setShowModal(false);
      toast.success(isAr ? 'تم إضافة الخدمة بنجاح' : 'Service added successfully');
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل إضافة الخدمة' : 'Failed to add service')),
  });

  const updateServiceMutation = useMutation({
    mutationFn: (payload) => vendorService.updateVendorService(vendorId, editingService.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', vendorId] });
      setEditingService(null);
      setShowModal(false);
      toast.success(isAr ? 'تم تحديث الخدمة بنجاح' : 'Service updated successfully');
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل تحديث الخدمة' : 'Failed to update service')),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId) => vendorService.deleteVendorService(vendorId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', vendorId] });
      toast.success(isAr ? 'تم حذف الخدمة بنجاح' : 'Service deleted successfully');
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل حذف الخدمة' : 'Failed to delete service')),
  });

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = (service) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const handleSubmit = (form) => {
    // Transform workingDays to workingHours for API
    const workingHours = (form.workingDays || [])
      .filter((d) => d.enabled && d.start && d.end)
      .map((d) => ({ dayOfWeek: d.dayOfWeek, start: d.start, end: d.end }));
    
    const payload = {
      name: form.name,
      nameAr: form.nameAr,
      description: form.description,
      descriptionAr: form.descriptionAr,
      estimatedDuration: form.estimatedDuration,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
      pricing: form.pricing || [],
      workingHours: workingHours,
      slotDurationMinutes: form.slotDurationMinutes,
    };

    if (editingService) {
      updateServiceMutation.mutate(payload);
    } else {
      addServiceMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center text-slate-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
          {isAr ? 'الخدمات' : 'Services'}
        </h4>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          {isAr ? 'إضافة خدمة' : 'Add Service'}
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isAr ? 'لا توجد خدمات حالياً' : 'No services yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                    {isAr && service.nameAr ? service.nameAr : service.name}
                  </h5>
                  {service.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {isAr && service.descriptionAr ? service.descriptionAr : service.description}
                    </p>
                  )}
                </div>
                <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  service.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {service.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  {isAr ? 'المدة: ' : 'Duration: '}{service.estimatedDuration || 0} {isAr ? 'دقيقة' : 'min'}
                </span>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  onClick={() => handleEdit(service)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-900/30"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          title={editingService ? (isAr ? 'تعديل الخدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}
        >
          <ServiceForm
            service={editingService}
            vendorType={vendorType}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowModal(false);
              setEditingService(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
