import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { defaultWorkingHoursByDay, buildWorkingHoursPayload } from '../utils/workshopFormShared';
import WorkshopFormFields from '../components/workshops/WorkshopFormFields';
import ImageUploader from '../components/workshops/ImageUploader';
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
    services: '["Engine Repair", "Oil Change"]',
    workingHoursByDay: defaultWorkingHoursByDay(),
  };
}

export default function VendorWorkshopEditPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const [form, setForm] = useState(emptyForm());

  const { data: workshop, isLoading, isError, error } = useQuery({
    queryKey: ['workshop', 'me'],
    queryFn: () => workshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  const isCreateMode = isError && error?.response?.status === 404;

  useEffect(() => {
    if (workshop) {
      const wh = workshop.workingHours && typeof workshop.workingHours === 'object' ? workshop.workingHours : {};
      const workingHoursByDay = defaultWorkingHoursByDay();
      Object.keys(workingHoursByDay).forEach((key) => {
        const h = wh[key];
        if (h && h.closed) {
          workingHoursByDay[key] = { closed: true, open: '', close: '' };
        } else if (h && (h.open || h.close)) {
          workingHoursByDay[key] = { closed: false, open: h.open || '09:00', close: h.close || '18:00' };
        }
      });
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
        services: typeof workshop.services === 'string' ? workshop.services : JSON.stringify(workshop.services || []),
        workingHoursByDay,
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

  const createMutation = useMutation({
    mutationFn: (payload) => workshopService.createMyWorkshop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop', 'me'] });
      toast.success(isAr ? 'تم إنشاء الورشة بنجاح. ستظهر بعد التحقق من الإدارة.' : 'Workshop created. It will appear after admin verification.');
      navigate('/vendor/workshop');
    },
    onError: (err) => {
      toast.error(err?.message || (isAr ? 'فشل الإنشاء' : 'Create failed'));
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
      workingHours: buildWorkingHoursPayload(form.workingHoursByDay || defaultWorkingHoursByDay()),
    };
    if (isCreateMode) createMutation.mutate(payload);
    else updateMutation.mutate(payload);
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

  if (isLoading && !isCreateMode) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (isError && !isCreateMode) {
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

  const pending = isCreateMode ? createMutation.isPending : updateMutation.isPending;

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
          <h1 className="text-xl font-semibold text-slate-900">
            {isCreateMode ? (isAr ? 'إضافة ورشتي' : 'Add my workshop') : (isAr ? 'تعديل الورشة' : 'Edit Workshop')}
          </h1>
          <p className="text-sm text-slate-500">{workshop ? (workshop.nameAr || workshop.name) : (isAr ? 'أدخل بيانات الورشة' : 'Enter workshop details')}</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WorkshopFormFields
            form={form}
            setForm={setForm}
            requireLocationUrl={isCreateMode}
            showAdminFields={false}
          />
          <div className="flex w-full gap-3 pt-2 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isCreateMode ? (isAr ? 'إنشاء الورشة' : 'Create workshop') : (isAr ? 'حفظ التعديلات' : 'Save changes')}
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

      {workshop && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('workshops.logoAndImages', 'الشعار والصور')}</h3>
          <div className="space-y-8">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{t('workshops.logo', 'الشعار')}</p>
              <ImageUploader
                useProfileMe
                currentLogo={workshop.logo}
                type="logo"
                onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['workshop', 'me'] })}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{t('workshops.images', 'صور الورشة')}</p>
              <ImageUploader
                useProfileMe
                currentImages={Array.isArray(workshop.images) ? workshop.images : (workshop.images ? [workshop.images] : [])}
                type="images"
                onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['workshop', 'me'] })}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
