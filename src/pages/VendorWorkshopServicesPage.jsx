import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Pencil, Trash2, Wrench, Save, X } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';
import toast from 'react-hot-toast';

// أنواع الخدمات للورشة المعتمدة (مع الأسعار)
const WORKSHOP_SERVICE_TYPES = [
  { value: 'GENERAL', label: 'صيانة عامة' },
  { value: 'OIL_CHANGE', label: 'تغيير زيت' },
  { value: 'BRAKE', label: 'فرامل' },
  { value: 'TIRE', label: 'إطارات' },
  { value: 'BATTERY', label: 'بطارية' },
  { value: 'AC', label: 'تكييف' },
  { value: 'ELECTRICAL', label: 'كهرباء' },
  { value: 'ENGINE_REPAIR', label: 'إصلاح محرك' },
  { value: 'SUSPENSION', label: 'تعليق' },
  { value: 'BODY_REPAIR', label: 'سمكرة' },
  { value: 'PAINTING', label: 'دهان' },
  { value: 'DIAGNOSIS', label: 'فحص وتشخيص' },
  { value: 'TRANSMISSION', label: 'ناقل حركة' },
  { value: 'CUSTOM', label: 'أخرى' },
];

const emptyForm = () => ({
  serviceType: 'GENERAL',
  name: '',
  nameAr: '',
  description: '',
  price: '',
  estimatedDuration: '',
  isActive: true,
});

export default function VendorWorkshopServicesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const [showModal, setShowModal] = useState(false);
  const [editingSvc, setEditingSvc] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const { data: workshop, isLoading: workshopLoading } = useQuery({
    queryKey: ['workshop', 'me'],
    queryFn: () => workshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['workshop', 'me', 'services'],
    queryFn: () => workshopService.getMyWorkshopServices(),
    enabled: !!workshop,
  });

  const addMutation = useMutation({
    mutationFn: (payload) => workshopService.addMyWorkshopService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop', 'me', 'services'] });
      toast.success(isAr ? 'تمت إضافة الخدمة' : 'Service added');
      setShowModal(false);
      setForm(emptyForm());
      setEditingSvc(null);
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل الإضافة' : 'Add failed')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ svcId, payload }) => workshopService.updateMyWorkshopService(svcId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop', 'me', 'services'] });
      toast.success(isAr ? 'تم تحديث الخدمة' : 'Service updated');
      setShowModal(false);
      setForm(emptyForm());
      setEditingSvc(null);
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل التحديث' : 'Update failed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (svcId) => workshopService.deleteMyWorkshopService(svcId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop', 'me', 'services'] });
      toast.success(isAr ? 'تم حذف الخدمة' : 'Service deleted');
    },
    onError: (err) => toast.error(err?.message || (isAr ? 'فشل الحذف' : 'Delete failed')),
  });

  const openAdd = () => {
    setEditingSvc(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingSvc(svc);
    setForm({
      serviceType: svc.serviceType || 'GENERAL',
      name: svc.name || '',
      nameAr: svc.nameAr || '',
      description: svc.description || '',
      price: String(svc.price ?? ''),
      estimatedDuration: svc.estimatedDuration != null ? String(svc.estimatedDuration) : '',
      isActive: svc.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error(isAr ? 'اسم الخدمة مطلوب' : 'Service name required');
    const priceNum = parseFloat(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) return toast.error(isAr ? 'السعر مطلوب (رقم صحيح)' : 'Valid price required');
    const payload = {
      serviceType: form.serviceType,
      name: form.name.trim(),
      nameAr: form.nameAr?.trim() || undefined,
      description: form.description?.trim() || undefined,
      price: priceNum,
      currency: 'SAR',
      estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration, 10) : undefined,
      isActive: form.isActive,
    };
    if (editingSvc) updateMutation.mutate({ svcId: editingSvc.id, payload });
    else addMutation.mutate(payload);
  };

  const handleDelete = (svc) => {
    if (!window.confirm(isAr ? `حذف الخدمة "${svc.nameAr || svc.name}"؟` : `Delete "${svc.name}"?`)) return;
    deleteMutation.mutate(svc.id);
  };

  const pending = addMutation.isPending || updateMutation.isPending;

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'CERTIFIED_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الورش المعتمدة فقط.' : 'This page is only available for certified workshop vendors.'}</p>
        </Card>
      </div>
    );
  }

  if (workshopLoading && !workshop) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'لا توجد ورشة مرتبطة بحسابك.' : 'No workshop linked to your account.'}</p>
          <Link to="/vendor/workshop" className="mt-3 inline-block text-indigo-600 hover:underline">{isAr ? 'الرجوع' : 'Back'}</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/workshop"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرجوع للورشة' : 'Back to workshop'}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'إدارة الخدمات' : 'Manage Services'}</h1>
            <p className="text-sm text-slate-500">{workshop?.nameAr || workshop?.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="size-4" />
          {isAr ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </button>
      </div>

      <Card className="overflow-hidden p-0 border-none shadow-sm shadow-slate-200/60 bg-white">
        {servicesLoading ? (
          <div className="p-8"><Skeleton className="h-32 w-full" /></div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <Wrench className="size-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{isAr ? 'لا توجد خدمات مضافة' : 'No services added yet'}</h3>
            <p className="mt-1 text-slate-500 max-w-xs">{isAr ? 'أضف الخدمات التي تقدمها ورشتك مع السعر والمدة ليتمكن العملاء من الحجز.' : 'Add services with price and duration so customers can book.'}</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-6 flex items-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="size-4" />
              {isAr ? 'إضافة أول خدمة' : 'Add first service'}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {services.map((svc) => (
              <li key={svc.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Wrench className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-800 block truncate">{svc.nameAr || svc.name}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {WORKSHOP_SERVICE_TYPES.find((s) => s.value === svc.serviceType)?.label || svc.serviceType}
                      </span>
                      <span className="font-semibold text-emerald-600">{svc.price} {svc.currency || 'ر.س'}</span>
                      {svc.estimatedDuration != null && <span>⏱ {svc.estimatedDuration} {isAr ? 'د' : 'min'}</span>}
                      {!svc.isActive && <span className="text-amber-600">{isAr ? 'موقوفة' : 'Inactive'}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => openEdit(svc)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title={isAr ? 'تعديل' : 'Edit'}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(svc)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" title={isAr ? 'حذف' : 'Delete'}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 self-start">
          <Wrench className="size-5 text-indigo-600" />
        </div>
        <div className="text-sm text-indigo-900 leading-relaxed">
          <p className="font-bold mb-1">{isAr ? 'نصيحة:' : 'Tip:'}</p>
          {isAr
            ? 'أضف كل خدمة مع السعر (ر.س) والمدة (دقيقة) ووصف واضح حتى يختار العملاء المناسبين.'
            : 'Add each service with price (SAR), duration (min) and a clear description for customers.'}
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingSvc(null); setForm(emptyForm()); }}
        title={editingSvc ? (isAr ? 'تعديل الخدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'نوع الخدمة' : 'Service Type'}</label>
            <select
              value={form.serviceType}
              onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {WORKSHOP_SERVICE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Input
            label={`${t('common.nameEn')} *`}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={isAr ? 'مثال: تغيير زيت وفلتر' : 'e.g. Oil and filter change'}
            required
          />
          <Input
            label={t('common.nameAr')}
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            placeholder={isAr ? 'اختياري' : 'Optional'}
            dir="rtl"
          />
          <Input
            label={isAr ? 'السعر (ر.س) *' : 'Price (SAR) *'}
            type="number"
            min="0"
            step="0.5"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder={isAr ? 'مثال: 200' : 'e.g. 200'}
            required
          />
          <Input
            label={isAr ? 'المدة (دقيقة)' : 'Duration (min)'}
            type="number"
            min="5"
            step="5"
            value={form.estimatedDuration}
            onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
            placeholder={isAr ? 'مثال: 60' : 'e.g. 60'}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.descriptionEn')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder={isAr ? 'ما الذي تشمله هذه الخدمة...' : 'What does this service include...'}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{isAr ? 'الخدمة نشطة' : 'Service active'}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? <Skeleton className="size-4 rounded-full" /> : <Save className="size-4" />}
              {isAr ? 'حفظ الخدمة' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
