import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image, Save, PlusCircle, Trash2 } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { vendorService } from '../services/vendorService';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const DAY_NAMES = [
  { key: 0, en: 'Sun', ar: 'الأحد' },
  { key: 1, en: 'Mon', ar: 'الإثنين' },
  { key: 2, en: 'Tue', ar: 'الثلاثاء' },
  { key: 3, en: 'Wed', ar: 'الأربعاء' },
  { key: 4, en: 'Thu', ar: 'الخميس' },
  { key: 5, en: 'Fri', ar: 'الجمعة' },
  { key: 6, en: 'Sat', ar: 'السبت' },
];

const defaultWorkingDays = () =>
  DAY_NAMES.map((d) => ({ dayOfWeek: d.key, enabled: false, start: '09:00', end: '17:00' }));

const CATEGORIES = [
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CUSTOMIZATION', label: 'Customization' },
  { value: 'COMPREHENSIVE_CARE', label: 'Comprehensive Care' },
];

const TYPES = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'CATALOG', label: 'Catalog' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'MOBILE_CAR_SERVICE', label: 'Mobile Car Service' },
];

const emptyForm = () => ({
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  type: 'FIXED',
  category: 'CLEANING',
  estimatedDuration: 30,
  imageUrl: '',
  icon: '',
  parentServiceId: '',
  vendorId: '',
  slotDurationMinutes: 60,
  workingDays: defaultWorkingDays(),
  pricing: [],
});

function isValidUrl(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

const buildWorkingHours = (workingDays) =>
  (workingDays || [])
    .filter((d) => d.enabled && d.start && d.end)
    .map((d) => ({ dayOfWeek: d.dayOfWeek, start: d.start, end: d.end }));

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const preselectedParentId = searchParams.get('parentId') || '';
  const [form, setForm] = useState(() => ({
    ...emptyForm(),
    ...(preselectedParentId && { type: 'MOBILE_CAR_SERVICE', parentServiceId: preselectedParentId }),
  }));
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const { data: allServices = [] } = useQuery({
    queryKey: ['services', { type: 'MOBILE_CAR_SERVICE' }],
    queryFn: () => serviceService.getServices({ type: 'MOBILE_CAR_SERVICE' }),
    enabled: form.type === 'MOBILE_CAR_SERVICE',
  });
  const parentServices = allServices.filter((s) => !s.parentServiceId);

  const { data: vendorsList = [] } = useQuery({
    queryKey: ['vendors-list'],
    queryFn: () => vendorService.getVendors({ status: 'ACTIVE' }),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => serviceService.createService(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created');
      navigate(created?.id ? `/services/${created.id}` : '/services');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create service'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      description: form.description.trim() || undefined,
      descriptionAr: form.descriptionAr.trim() || undefined,
      type: form.type,
      category: form.category,
      estimatedDuration: Number(form.estimatedDuration) || 30,
      imageUrl: form.imageUrl.trim() || undefined,
      icon: form.icon.trim() || undefined,
      parentServiceId: form.type === 'MOBILE_CAR_SERVICE' && form.parentServiceId ? form.parentServiceId : undefined,
      vendorId: form.vendorId?.trim() || undefined,
      workingHours: buildWorkingHours(form.workingDays),
      slotDurationMinutes: form.slotDurationMinutes != null ? Number(form.slotDurationMinutes) : 60,
      pricing: (form.pricing || []).map((p) => ({
        vehicleType: p.vehicleType,
        basePrice: Number(p.basePrice) || 0,
        discountedPrice: p.discountedPrice !== '' && p.discountedPrice != null ? Number(p.discountedPrice) : null,
      })),
    };
    createMutation.mutate(payload);
  };

  const imageUrl = (form.imageUrl || '').trim();
  const showPreview = isValidUrl(imageUrl);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/services"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
            aria-label="Back to services"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Create service</h1>
            <p className="text-sm text-slate-500">Add a new service with name, description, and image.</p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl p-6">
        <h2 className="mb-6 text-base font-semibold text-slate-900">Service details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Oil Change"
              required
            />
            <Input
              label="Name (Arabic)"
              name="nameAr"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تغيير الزيت"
            />
          </div>
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of the service"
          />
          <Input
            label="Description (Arabic)"
            name="descriptionAr"
            value={form.descriptionAr}
            onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
            placeholder="وصف الخدمة"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('services.type')}</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, parentServiceId: e.target.value === 'MOBILE_CAR_SERVICE' ? f.parentServiceId : '' }))}
              >
                {TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(`services.types.${opt.value}`) || opt.label}</option>
                ))}
              </select>
            </div>
            {form.type === 'MOBILE_CAR_SERVICE' && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">{t('services.parentService')}</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={form.parentServiceId}
                  onChange={(e) => setForm((f) => ({ ...f, parentServiceId: e.target.value }))}
                >
                  <option value="">{t('services.thisIsParent')}</option>
                  {parentServices.map((s) => (
                    <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">{t('services.parentServiceHint')}</p>
              </div>
            )}
            <div className={form.type === 'MOBILE_CAR_SERVICE' ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('services.vendor') || 'Vendor (الخدمة تابعة لـ)'}</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={form.vendorId}
                onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
              >
                <option value="">— {t('services.noVendor') || 'No vendor'}</option>
                {vendorsList.map((v) => (
                  <option key={v.id} value={v.id}>{v.businessNameAr || v.businessName}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">{t('services.vendorHint') || 'For Comprehensive Care, assign the vendor that offers this service.'}</p>
            </div>
          </div>
          <Input
            label="Estimated duration (minutes)"
            name="estimatedDuration"
            type="number"
            min={1}
            value={form.estimatedDuration}
            onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
          />

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">{isAr ? 'مواعيد العمل' : 'Working hours'}</h3>
            <p className="mb-3 text-xs text-slate-500">{isAr ? 'حدد أيام وأوقات استقبال الحجوزات.' : 'Set days and times when this service is available for booking.'}</p>
            <Input
              label={isAr ? 'مدة الموعد (دقيقة)' : 'Slot duration (min)'}
              type="number"
              min={15}
              value={form.slotDurationMinutes ?? 60}
              onChange={(e) => setForm((f) => ({ ...f, slotDurationMinutes: e.target.value }))}
            />
            <div className="mt-3 space-y-2">
              {(form.workingDays || defaultWorkingDays()).map((d, index) => {
                const day = DAY_NAMES[index];
                return (
                  <div key={day?.key ?? index} className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white p-2">
                    <label className="flex w-24 shrink-0 items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={!!d.enabled}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            workingDays: (f.workingDays || defaultWorkingDays()).map((w, i) => (i === index ? { ...w, enabled: e.target.checked } : w)),
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{isAr ? day?.ar : day?.en}</span>
                    </label>
                    <input
                      type="time"
                      value={d.start || '09:00'}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          workingDays: (f.workingDays || defaultWorkingDays()).map((w, i) => (i === index ? { ...w, start: e.target.value } : w)),
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                      disabled={!d.enabled}
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="time"
                      value={d.end || '17:00'}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          workingDays: (f.workingDays || defaultWorkingDays()).map((w, i) => (i === index ? { ...w, end: e.target.value } : w)),
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                      disabled={!d.enabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">{isAr ? 'الأسعار حسب نوع المركبة (ر.س)' : 'Pricing by vehicle type (SAR)'}</h3>
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
                  {(form.pricing || []).map((row, index) => (
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
                            setForm((f) => ({
                              ...f,
                              pricing: (f.pricing || []).map((r, i) => (i === index ? { ...r, basePrice: v === '' ? '' : Number(v) || 0 } : r)),
                            }));
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
                            setForm((f) => ({
                              ...f,
                              pricing: (f.pricing || []).map((r, i) => (i === index ? { ...r, discountedPrice: v === '' ? '' : Number(v) || 0 } : r)),
                            }));
                          }}
                          className="w-24 rounded border border-slate-300 px-2 py-1.5 text-slate-900"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, pricing: (f.pricing || []).filter((_, i) => i !== index) }))}
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
                value={form._newVehicleName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, _newVehicleName: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const name = (form._newVehicleName || '').trim();
                    if (!name) {
                      toast.error(isAr ? 'اكتب اسم نوع المركبة أولاً' : 'Enter vehicle type name first');
                      return;
                    }
                    const used = (form.pricing || []).map((p) => (p.vehicleType || '').trim().toLowerCase());
                    if (used.includes(name.toLowerCase())) {
                      toast.error(isAr ? 'نوع المركبة مضاف مسبقاً' : 'This vehicle type is already added');
                      return;
                    }
                    setForm((f) => ({ ...f, pricing: [...(f.pricing || []), { vehicleType: name, basePrice: 0, discountedPrice: '' }], _newVehicleName: '' }));
                  }
                }}
                placeholder={isAr ? 'اسم نوع المركبة (مثلاً: سيدان، دفع رباعي)' : 'Vehicle type name (e.g. Sedan, SUV)'}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => {
                  const name = (form._newVehicleName || '').trim();
                  if (!name) {
                    toast.error(isAr ? 'اكتب اسم نوع المركبة أولاً' : 'Enter vehicle type name first');
                    return;
                  }
                  const used = (form.pricing || []).map((p) => (p.vehicleType || '').trim().toLowerCase());
                  if (used.includes(name.toLowerCase())) {
                    toast.error(isAr ? 'نوع المركبة مضاف مسبقاً' : 'This vehicle type is already added');
                    return;
                  }
                  setForm((f) => ({ ...f, pricing: [...(f.pricing || []), { vehicleType: name, basePrice: 0, discountedPrice: '' }], _newVehicleName: '' }));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <PlusCircle className="h-4 w-4" />
                {isAr ? 'إضافة' : 'Add'}
              </button>
            </div>
            {(form.pricing || []).length === 0 && (
              <p className="mt-2 text-sm text-slate-500">{isAr ? 'اكتب اسم نوع المركبة ثم انقر «إضافة».' : 'Type the vehicle type name and click «Add».'}</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Image className="size-4 text-slate-500" /> Service image
            </h3>
            <p className="mb-4 text-sm text-slate-500">Enter a URL to an image. You can use any publicly accessible image link.</p>
            <Input
              label="Image URL"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => {
                setForm((f) => ({ ...f, imageUrl: e.target.value }));
                setImagePreviewError(false);
              }}
              placeholder="https://example.com/service-image.jpg"
            />
            {showPreview && (
              <div className="mt-4">
                <span className="mb-2 block text-sm font-medium text-slate-700">Preview</span>
                <div className="flex min-h-[120px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {imagePreviewError ? (
                    <p className="text-sm text-slate-500">Could not load image</p>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Service preview"
                      className="max-h-48 w-full object-cover"
                      onError={() => setImagePreviewError(true)}
                      onLoad={() => setImagePreviewError(false)}
                    />
                  )}
                </div>
              </div>
            )}
            <div className="mt-4">
              <Input
                label="Icon URL (optional)"
                name="icon"
                type="url"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="https://example.com/icon.svg"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? 'Creating…' : 'Create service'}
            </button>
            <Link to="/services" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
