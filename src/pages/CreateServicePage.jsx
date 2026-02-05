import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image, Save } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const CATEGORIES = [
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CUSTOMIZATION', label: 'Customization' },
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

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
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
