import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Truck, MapPin, CalendarCheck, Radio } from 'lucide-react';
import { winchService } from '../services/winchService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function VendorWinchPage() {
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';

  const { data: winch, isLoading, isError, error } = useQuery({
    queryKey: ['winch', 'me'],
    queryFn: () => winchService.getMyWinch(),
    retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
  });

  if (user?.role !== 'VENDOR' || user?.vendorType !== 'TOWING_SERVICE') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة متاحة لفيندور الونش (السطحه) فقط.' : 'This page is only for winch (towing) vendors.'}
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

  if (isError || !winch) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="size-4" /> {isAr ? 'الرئيسية' : 'Dashboard'}
        </Link>
        <Card className="p-8 text-center">
          <Truck className="mx-auto size-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{isAr ? 'الونش' : 'My Winch'}</h2>
          <p className="mt-2 text-slate-600">
            {is404
              ? (isAr ? 'لا يوجد ونش مرتبط بحسابك. تواصل مع الدعم لإضافة ونشك.' : 'No winch linked to your account. Contact support to add your winch.')
              : (error?.message || (isAr ? 'فشل تحميل البيانات' : 'Failed to load'))}
          </p>
        </Card>
      </div>
    );
  }

  const name = isAr ? (winch.nameAr || winch.name) : (winch.name || winch.nameAr);
  const currency = winch.currency || 'SAR';

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
            <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'صفحة الونش' : 'My Winch'}</h1>
            <p className="text-sm text-slate-500">{name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/vendor/winch/requests"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <Radio className="size-4" /> {isAr ? 'طلبات قريبة' : 'Nearby requests'}
          </Link>
          <Link
            to="/vendor/winch/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <CalendarCheck className="size-4" /> {isAr ? 'مهامي' : 'My jobs'}
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">{isAr ? 'معلومات الوينش' : 'Winch info'}</h3>
            <p className="font-medium text-slate-900">{name}</p>
            {winch.plateNumber && (
              <p className="mt-1 text-sm text-slate-600">{isAr ? 'لوحة: ' : 'Plate: '}{winch.plateNumber}</p>
            )}
            <div className="mt-2 flex gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${winch.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                {winch.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${winch.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                {winch.isAvailable ? (isAr ? 'متاح للطلبات' : 'Available') : (isAr ? 'غير متاح' : 'Unavailable')}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {(winch.city || (winch.latitude != null && winch.longitude != null)) && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="size-4 shrink-0 text-slate-400" />
                {winch.city || `${winch.latitude?.toFixed(4)}, ${winch.longitude?.toFixed(4)}`}
              </p>
            )}
            {(winch.basePrice != null || winch.pricePerKm != null) && (
              <p className="text-sm text-slate-700">
                {isAr ? 'السعر: ' : 'Price: '}
                {winch.basePrice != null && `${winch.basePrice} ${currency}`}
                {winch.basePrice != null && winch.pricePerKm != null && ' + '}
                {winch.pricePerKm != null && `${winch.pricePerKm} ${currency}/km`}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
