import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Input from '../components/Input';
import toast from 'react-hot-toast';

function emptyForm() {
  return {
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    address: '',
    addressAr: '',
    city: '',
    cityAr: '',
    locationUrl: '',
    phone: '',
    email: '',
    services: '[]',
  };
}

export default function VendorWorkshopEditPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const [form, setForm] = useState(emptyForm());

  const { data: workshop, isLoading, isError } = useQuery({
    queryKey: ['workshop', 'me'],
    queryFn: () => workshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  useEffect(() => {
    if (workshop) {
      setForm({
        name: workshop.name ?? '',
        nameAr: workshop.nameAr ?? '',
        description: workshop.description ?? '',
        descriptionAr: workshop.descriptionAr ?? '',
        address: workshop.address ?? '',
        addressAr: workshop.addressAr ?? '',
        city: workshop.city ?? '',
        cityAr: workshop.cityAr ?? '',
        locationUrl: '',
        phone: workshop.phone ?? '',
        email: workshop.email ?? '',
        services: typeof workshop.services === 'string'
          ? workshop.services
          : JSON.stringify(workshop.services || []),
      });
    }
  }, [workshop]);

  const updateMutation = useMutation({
    mutationFn: (payload) => workshopService.updateMyWorkshop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop', 'me'] });
      toast.success(isAr ? 'تم تحديث الورشة بنجاح' : 'Workshop updated successfully');
      navigate('/vendor/workshop');
    },
    onError: (err) => {
      toast.error(err?.message || (isAr ? 'فشل التحديث' : 'Update failed'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      description: form.description.trim() || undefined,
      descriptionAr: form.descriptionAr.trim() || undefined,
      address: form.address.trim(),
      addressAr: form.addressAr.trim() || undefined,
      city: form.city.trim(),
      cityAr: form.cityAr.trim() || undefined,
      locationUrl: form.locationUrl.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      services: form.services.trim(),
    };
    updateMutation.mutate(payload);
  };

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'CERTIFIED_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الورش المعتمدة فقط.' : 'This page is only available for certified workshop vendors.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading || !workshop) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Link to="/vendor/workshop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرجوع للورشة' : 'Back to workshop'}
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'فشل تحميل الورشة' : 'Failed to load workshop'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/vendor/workshop"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          aria-label={isAr ? 'الرجوع للورشة' : 'Back to workshop'}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'تعديل الورشة' : 'Edit Workshop'}</h1>
          <p className="text-sm text-slate-500">{workshop.nameAr || workshop.name}</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label={t('workshops.name', 'Name')}
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Al-Salam Auto Center"
            required
          />
          <Input
            label={t('common.nameAr', 'Name (Arabic)')}
            name="nameAr"
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            placeholder="مركز السلام للسيارات"
          />
          <Input
            label={t('workshops.city', 'City')}
            name="city"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="Riyadh"
            required
          />
          <Input
            label={t('workshops.address', 'Address')}
            name="address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="King Fahd Road"
            required
          />
          <Input
            label={t('workshops.phone', 'Phone')}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+966112345000"
            required
          />
          <Input
            label={t('workshops.email', 'Email')}
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="info@workshop.sa"
          />
          <Input
            label={t('workshops.locationUrl', 'Location URL')}
            name="locationUrl"
            value={form.locationUrl}
            onChange={(e) => setForm((f) => ({ ...f, locationUrl: e.target.value }))}
            placeholder={t('workshops.locationUrlPlaceholder', 'Google Maps link to update coordinates')}
          />
          <Input
            label={t('workshops.services', 'Services')}
            name="services"
            value={form.services}
            onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
            placeholder='["Engine Repair", "Oil Change"]'
            required
            className="sm:col-span-2"
          />
          <Input
            label={t('common.description', 'Description')}
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description"
            className="sm:col-span-2"
          />
          <Input
            label={t('common.descriptionAr', 'Description (Arabic)')}
            name="descriptionAr"
            value={form.descriptionAr}
            onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
            placeholder="وصف مختصر"
            className="sm:col-span-2"
          />
          <div className="flex w-full gap-3 pt-2 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {updateMutation.isPending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save changes')}
            </button>
            <Link
              to="/vendor/workshop"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
