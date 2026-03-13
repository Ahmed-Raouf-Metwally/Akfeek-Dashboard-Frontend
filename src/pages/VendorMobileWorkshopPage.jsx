import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Truck, MapPin, CalendarCheck, Wrench } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function VendorMobileWorkshopPage() {
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const { data: workshop, isLoading, isError, error } = useQuery({
    queryKey: ['mobile-workshop', 'me'],
    queryFn: () => mobileWorkshopService.getMyWorkshop(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'MOBILE_WORKSHOP') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة متاحة لمورد الورش المتنقلة فقط.' : 'This page is only available for mobile workshop vendors.'}
          </p>
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
    return (
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرئيسية' : 'Dashboard'}
        </Link>
        <Card className="p-8 text-center">
          <Truck className="mx-auto size-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {isAr ? 'ورشتي المتنقلة' : 'My Mobile Workshop'}
          </h2>
          <p className="mt-2 text-slate-600">
            {error?.message || (isAr ? 'فشل تحميل البيانات' : 'Failed to load')}
          </p>
        </Card>
      </div>
    );
  }

  const services = Array.isArray(workshop.services) ? workshop.services : [];

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
            <h1 className="text-xl font-semibold text-slate-900">
              {isAr ? 'ورشتي المتنقلة' : 'My Mobile Workshop'}
            </h1>
            <p className="text-sm text-slate-500">{workshop.nameAr || workshop.name}</p>
          </div>
        </div>
        <Link
          to="/vendor/mobile-workshop/requests"
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <CalendarCheck className="size-4" /> {isAr ? 'طلبات ورشتي' : 'Requests'}
        </Link>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">
              {isAr ? 'المعلومات' : 'Info'}
            </h3>
            <p className="font-medium text-slate-900">{workshop.nameAr || workshop.name}</p>
            {(workshop.descriptionAr || workshop.description) && (
              <p className="mt-1 text-sm text-slate-600">{workshop.descriptionAr || workshop.description}</p>
            )}
            {workshop.city && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="size-4 shrink-0 text-slate-400" /> {workshop.city}
              </p>
            )}
          </div>
          <div>
            {workshop.workshopType && (
              <p className="text-sm text-slate-600">
                {isAr ? 'النوع: ' : 'Type: '}
                {workshop.workshopType.nameAr || workshop.workshopType.name}
              </p>
            )}
            {workshop.plateNumber && (
              <p className="mt-1 text-sm text-slate-600">
                {isAr ? 'لوحة المركبة: ' : 'Plate: '}{workshop.plateNumber}
              </p>
            )}
            {workshop.isAvailable != null && (
              <p className="mt-1 text-sm">
                <span className={workshop.isAvailable ? 'text-green-600' : 'text-amber-600'}>
                  {workshop.isAvailable ? (isAr ? 'متاح للطلبات' : 'Available') : (isAr ? 'غير متاح' : 'Unavailable')}
                </span>
              </p>
            )}
          </div>
        </div>
        {services.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
              <Wrench className="size-4" /> {isAr ? 'الخدمات' : 'Services'}
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {services.map((s) => (
                <li key={s.id}>
                  {s.nameAr || s.name}
                  {s.price != null && ` — ${s.price} ${s.currency || 'SAR'}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
