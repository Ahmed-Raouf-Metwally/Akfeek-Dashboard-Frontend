import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Truck, Save } from 'lucide-react';
import { mobileCarServiceApi } from '../services/mobileCarService';
import { serviceService } from '../services/serviceService';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const CATEGORIES = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CUSTOMIZATION', label: 'Customization' },
];

export default function MobileCarSubServiceNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: 'MAINTENANCE',
    estimatedDuration: 45,
    imageUrl: '',
  });

  const { data: parent, isLoading: loadingParent } = useQuery({
    queryKey: ['mobileCarService'],
    queryFn: () => mobileCarServiceApi.getParentWithSubServices(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => serviceService.createService(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['mobileCarService'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(t('common.success') || 'تمت الإضافة');
      navigate(created?.id ? `/mobile-car-service/${created.id}` : '/mobile-car-service');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parent?.id) {
      toast.error('Parent service not found');
      return;
    }
    createMutation.mutate({
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      description: form.description.trim() || undefined,
      descriptionAr: form.descriptionAr.trim() || undefined,
      type: 'MOBILE_CAR_SERVICE',
      category: form.category,
      estimatedDuration: Number(form.estimatedDuration) || 45,
      imageUrl: form.imageUrl.trim() || undefined,
      parentServiceId: parent.id,
    });
  };

  if (loadingParent) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <Card className="p-8">
          <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
        </Card>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="space-y-6">
        <p className="text-slate-600">Mobile Car Service not set up. Add parent from Services first.</p>
        <Link to="/services" className="text-indigo-600 hover:text-indigo-500">Go to Services</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/mobile-car-service"
          className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {t('services.addSubService')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {parent.nameAr || parent.name}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100">
              <Truck className="size-5 text-indigo-600" />
            </div>
            <span className="font-medium text-slate-700">{parent.name}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('services.name')}
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Oil Change (Mobile)"
              required
            />
            <Input
              label={t('common.nameAr')}
              name="nameAr"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تغيير الزيت (متنقل)"
            />
          </div>
          <Input
            label={t('common.description')}
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description"
          />
          <Input
            label={t('common.description') + ' (AR)'}
            name="descriptionAr"
            value={form.descriptionAr}
            onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('services.category')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Input
              label={t('services.duration') + ' (min)'}
              type="number"
              min={1}
              name="estimatedDuration"
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
            />
          </div>
          <Input
            label={t('common.imageUrl')}
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? (t('common.saving') || 'جاري الحفظ…') : (t('common.create') || 'إنشاء')}
            </button>
            <Link
              to="/mobile-car-service"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
