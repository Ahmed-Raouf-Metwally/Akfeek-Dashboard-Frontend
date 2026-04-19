import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const apiImg = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, Clock, Star, Plus, Pencil, Trash2, Check, X, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import ReviewsList from '../components/workshops/ReviewsList';
import VendorDocuments from '../components/VendorDocuments';

const WORKSHOP_SERVICE_TYPES = [
  { value: 'OIL_CHANGE',      label: 'تغيير زيت' },
  { value: 'ENGINE_REPAIR',   label: 'تصليح محرك' },
  { value: 'BRAKE',           label: 'فرامل' },
  { value: 'TIRE',            label: 'إطارات' },
  { value: 'AC',              label: 'تكييف' },
  { value: 'ELECTRICAL',      label: 'كهرباء' },
  { value: 'SUSPENSION',      label: 'تعليق وهيكل' },
  { value: 'BODY_REPAIR',     label: 'إصلاح هيكل' },
  { value: 'PAINTING',        label: 'دهان وتشطيب' },
  { value: 'DIAGNOSIS',       label: 'فحص وتشخيص' },
  { value: 'BATTERY',         label: 'بطارية' },
  { value: 'TRANSMISSION',    label: 'ناقل حركة' },
  { value: 'DETAILING',       label: 'تفصيل وتلميع' },
  { value: 'GLASS',           label: 'زجاج' },
  { value: 'GENERAL',         label: 'صيانة عامة' },
  { value: 'CUSTOM',          label: 'أخرى' },
];
const SVC_LABEL = (t) => WORKSHOP_SERVICE_TYPES.find(s => s.value === t)?.label || t;
const EMPTY_SVC = { serviceType: 'GENERAL', name: '', nameAr: '', description: '', price: '', currency: 'SAR', estimatedDuration: '' };

// ── Inline service row ──────────────────────────────────────────────────────
function ServiceRow({ svc, workshopId, onRefresh }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(!svc.id);
  const [form, setForm] = useState({
    serviceType:       svc.serviceType       || 'GENERAL',
    name:              svc.name              || '',
    nameAr:            svc.nameAr            || '',
    description:       svc.description       || '',
    price:             svc.price             ?? '',
    currency:          svc.currency          || 'SAR',
    estimatedDuration: svc.estimatedDuration ?? '',
    isActive:          svc.isActive          ?? true,
  });

  const save = useMutation({
    mutationFn: () => svc.id
      ? workshopService.updateWorkshopService(workshopId, svc.id, { ...form, price: parseFloat(form.price), estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration) : null })
      : workshopService.addWorkshopService(workshopId, { ...form, price: parseFloat(form.price), estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration) : null }),
    onSuccess: () => { setEditing(false); qc.invalidateQueries({ queryKey: ['workshop-services', workshopId] }); onRefresh?.(); },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'خطأ'),
  });

  const del = useMutation({
    mutationFn: () => workshopService.deleteWorkshopService(workshopId, svc.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshop-services', workshopId] }); onRefresh?.(); },
    onError: (err) => toast.error(err?.message || 'فشل الحذف'),
  });

  const h = (e) => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };

  if (!editing) return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{SVC_LABEL(form.serviceType)}</span>
          <span className="font-semibold text-slate-900">{form.name}</span>
          {form.nameAr && <span className="text-sm text-slate-500">{form.nameAr}</span>}
          {!form.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">موقوفة</span>}
        </div>
        {form.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{form.description}</p>}
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-base font-bold text-emerald-700">{form.price} {form.currency}</span>
          {form.estimatedDuration && <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="size-3" />{form.estimatedDuration} دقيقة</span>}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button type="button" onClick={() => setEditing(true)} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50"><Pencil className="size-4" /></button>
        <button type="button" onClick={() => window.confirm('حذف الخدمة؟') && del.mutate()} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">نوع الخدمة</label>
          <select name="serviceType" value={form.serviceType} onChange={h}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            {WORKSHOP_SERVICE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
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
          <input name="price" type="number" value={form.price} onChange={h} required min="0" step="0.5" placeholder="مثال: 200"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">المدة (دقيقة)</label>
          <input name="estimatedDuration" type="number" value={form.estimatedDuration} onChange={h} min="5" step="5" placeholder="مثال: 60"
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
        <textarea name="description" value={form.description} onChange={h} rows={2} placeholder="ما الذي تشمله هذه الخدمة..."
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
      </div>
      <div className="flex justify-end gap-2">
        {svc.id && <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"><X className="size-4" />إلغاء</button>}
        <button type="button" onClick={() => { if (!form.name || !form.price) return toast.error('الاسم والسعر مطلوبان'); save.mutate(); }}
          disabled={save.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
          <Check className="size-4" />{save.isPending ? 'جاري الحفظ...' : 'حفظ الخدمة'}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [addingService, setAddingService] = useState(false);

  const { data: workshop, isLoading, isError } = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => workshopService.getWorkshopById(id),
    enabled: !!id,
  });

  const { data: workshopServices = [], refetch: refetchServices } = useQuery({
    queryKey: ['workshop-services', id],
    queryFn: () => workshopService.getWorkshopServices(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24">
          <TableSkeleton rows={2} cols={2} />
        </div>
        <Card className="p-6">
          <TableSkeleton rows={6} cols={3} />
        </Card>
      </div>
    );
  }

  if (isError || !workshop) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">{t('workshops.notFound', 'Workshop not found or failed to load.')}</p>
          <Link to="/workshops" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            {t('workshops.backToList', 'Back to Workshops')}
          </Link>
        </Card>
      </div>
    );
  }

  const workingHours = workshop.workingHours || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" /> {t('common.back', 'Back')}
        </button>
        <Link to="/workshops" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {t('workshops.allWorkshops', 'All Workshops')}
        </Link>
      </div>

      {/* Workshop Header with Logo and Images */}
      <Card className="overflow-hidden p-6">
        <div className="flex flex-col gap-6">
          {/* Logo and Basic Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Logo */}
            {workshop.logo && (
              <div className="shrink-0">
                <img
                  src={apiImg(workshop.logo)}
                  alt={workshop.name}
                  className="h-24 w-24 rounded-lg object-cover border-2 border-slate-200"
                />
              </div>
            )}
            
            {/* Workshop Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{workshop.name}</h1>
                {workshop.isVerified && (
                  <CheckCircle className="size-6 text-green-600" title={t('workshops.verified')} />
                )}
              </div>
              {workshop.nameAr && <p className="mt-1 text-sm text-slate-500">{workshop.nameAr}</p>}
              
              {/* Rating Display */}
              {workshop.averageRating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.floor(workshop.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {workshop.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({workshop.totalReviews || 0} {t('workshops.reviews', 'reviews')})
                  </span>
                </div>
              )}
              
              {workshop.description && (
                <p className="mt-3 text-sm text-slate-600">{workshop.description}</p>
              )}
              {workshop.descriptionAr && (
                <p className="mt-1 text-sm text-slate-500">{workshop.descriptionAr}</p>
              )}
            </div>
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {workshop.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckCircle className="size-3" />
                  {t('workshops.verified')}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                  {t('workshops.unverified')}
                </span>
              )}
              {workshop.isActive ? (
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {t('common.active')}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  {t('common.inactive')}
                </span>
              )}
            </div>
          </div>

          {/* Workshop Images Gallery */}
          {workshop.images && workshop.images.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {t('workshops.images.gallery', 'Gallery')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {workshop.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={apiImg(imageUrl)}
                      alt={`${workshop.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact & Location */}
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.contactLocation', 'Contact & Location')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{workshop.address}</p>
                {workshop.addressAr && <p className="text-sm text-slate-500">{workshop.addressAr}</p>}
                <p className="mt-1 text-sm text-slate-600">
                  {workshop.city}{workshop.cityAr && ` (${workshop.cityAr})`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {workshop.latitude}, {workshop.longitude}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-slate-400" />
              <a href={`tel:${workshop.phone}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                {workshop.phone}
              </a>
            </div>
            {workshop.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-slate-400" />
                <a href={`mailto:${workshop.email}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                  {workshop.email}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.statistics', 'Statistics')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Star className="size-5" />
                <span className="text-2xl font-bold">{workshop.averageRating || 0}</span>
              </div>
              <p className="mt-1 text-xs text-amber-600">{t('workshops.averageRating', 'Average Rating')}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="size-5" />
                <span className="text-2xl font-bold">{workshop.totalBookings || 0}</span>
              </div>
              <p className="mt-1 text-xs text-blue-600">{t('workshops.totalBookings', 'Total Bookings')}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 col-span-2">
              <p className="text-sm font-medium text-purple-900">
                {workshop.totalReviews || 0} {t('workshops.reviews', 'Reviews')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Services with Prices */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Wrench className="size-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">الخدمات والأسعار</h2>
              <p className="text-xs text-slate-400">قائمة الخدمات المقدّمة في الورشة</p>
            </div>
          </div>
          {isAdmin && !addingService && (
            <button onClick={() => setAddingService(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
              <Plus className="size-4" /> إضافة خدمة
            </button>
          )}
        </div>

        <div className="space-y-3">
          {workshopServices.length === 0 && !addingService && (
            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
              <Wrench className="mx-auto size-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">لا توجد خدمات مضافة بعد</p>
              {isAdmin && (
                <button onClick={() => setAddingService(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                  <Plus className="size-4" /> أضف أول خدمة
                </button>
              )}
            </div>
          )}

          {workshopServices.map(svc => (
            <ServiceRow key={svc.id} svc={svc} workshopId={id} onRefresh={refetchServices} />
          ))}

          {addingService && (
            <ServiceRow
              svc={EMPTY_SVC}
              workshopId={id}
              onRefresh={() => { refetchServices(); setAddingService(false); }}
            />
          )}
        </div>
      </Card>

      {/* Working Hours */}
      {Object.keys(workingHours).length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.workingHours', 'Working Hours')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium capitalize text-slate-700">{day}</span>
                <span className="text-sm text-slate-600">
                  {hours.open} - {hours.close}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Details */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">{t('common.details', 'Details')}</h2>
        <div className="space-y-0">
          <DetailRow label={t('workshops.name')} value={workshop.name} />
          <DetailRow label={t('common.nameAr')} value={workshop.nameAr} />
          <DetailRow label={t('common.description')} value={workshop.description} />
          <DetailRow label={t('common.descriptionAr')} value={workshop.descriptionAr} />
          <DetailRow label={t('workshops.city')} value={workshop.city} />
          <DetailRow label={t('workshops.address')} value={workshop.address} />
          <DetailRow label={t('workshops.phone')} value={workshop.phone} />
          <DetailRow label={t('workshops.email')} value={workshop.email} />
          <DetailRow label={t('workshops.verified')} value={workshop.isVerified ? t('common.yes') : t('common.no')} />
          <DetailRow label={t('common.status')} value={workshop.isActive ? t('common.active') : t('common.inactive')} />
        </div>
      </Card>

      {/* Documents — only for Admin */}
      {isAdmin && workshop.vendorId && (
        <VendorDocuments vendorId={workshop.vendorId} />
      )}

      {/* Customer Reviews */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {t('workshops.reviews.title', 'Customer Reviews')}
        </h2>
        <ReviewsList workshopId={id} isAdmin={false} />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/workshops" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          {t('workshops.backToList', 'Back to list')}
        </Link>
      </div>
    </div>
  );
}
