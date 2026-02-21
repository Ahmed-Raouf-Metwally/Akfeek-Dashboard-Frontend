import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, MapPin, Phone, Mail, CalendarCheck, Pencil } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function VendorWorkshopPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const { data: workshop, isLoading, isError, error } = useQuery({
    queryKey: ['workshop', 'me'],
    queryFn: () => workshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'CERTIFIED_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الورش المعتمدة فقط.' : 'This page is only available for certified workshop vendors.'}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-40 w-full" /></Card>
      </div>
    );
  }

  if (isError || !workshop) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرئيسية' : 'Dashboard'}
        </Link>
        <Card className="p-8 text-center">
          <Building2 className="mx-auto size-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{isAr ? 'الورشة' : 'My Workshop'}</h2>
          <p className="mt-2 text-slate-600">
            {is404
              ? (isAr ? 'لا توجد ورشة مرتبطة بحسابك. يمكنك إضافة ورشتك من هنا.' : 'No workshop linked to your account. You can add your workshop below.')
              : (error?.message || (isAr ? 'فشل تحميل البيانات' : 'Failed to load'))}
          </p>
          {is404 && (
            <Link
              to="/vendor/workshop/edit"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Building2 className="size-4" /> {isAr ? 'إضافة ورشتي' : 'Add my workshop'}
            </Link>
          )}
        </Card>
      </div>
    );
  }

  const services = typeof workshop.services === 'string'
    ? (() => {
        try {
          const p = JSON.parse(workshop.services);
          return Array.isArray(p) ? p : [workshop.services];
        } catch {
          return workshop.services.split(',').map((s) => s.trim()).filter(Boolean);
        }
      })()
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرئيسية' : 'Dashboard'}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'الورشة' : 'My Workshop'}</h1>
            <p className="text-sm text-slate-500">{workshop.nameAr || workshop.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/workshops/${workshop.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="size-4" /> {isAr ? 'عرض التفاصيل' : 'View details'}
          </Link>
          <Link
            to={`/vendor/workshop/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Pencil className="size-4" /> {isAr ? 'تعديل' : 'Edit'}
          </Link>
          <Link
            to="/vendor/workshop/bookings"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <CalendarCheck className="size-4" /> {isAr ? 'حجوزات الورشة' : 'Bookings'}
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">{isAr ? 'المعلومات' : 'Info'}</h3>
            <p className="font-medium text-slate-900">{workshop.nameAr || workshop.name}</p>
            {workshop.descriptionAr || workshop.description ? (
              <p className="mt-1 text-sm text-slate-600">{workshop.descriptionAr || workshop.description}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            {workshop.address && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="size-4 shrink-0 text-slate-400" /> {workshop.addressAr || workshop.address}, {workshop.cityAr || workshop.city}
              </p>
            )}
            {workshop.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Phone className="size-4 shrink-0 text-slate-400" /> {workshop.phone}
              </p>
            )}
            {workshop.email && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="size-4 shrink-0 text-slate-400" /> {workshop.email}
              </p>
            )}
          </div>
        </div>
        {services.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">{isAr ? 'الخدمات' : 'Services'}</h3>
            <p className="text-sm text-slate-700">{services.join(' • ')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
