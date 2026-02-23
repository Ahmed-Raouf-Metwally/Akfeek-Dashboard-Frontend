import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, CalendarCheck, Car, Clock, CheckCircle2,
    XCircle, User, Phone, Loader2, Droplets,
} from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

// حالات الحجز مع ألوانها
const STATUS_CONFIG = {
    PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    CONFIRMED: { label: 'مؤكد', labelEn: 'Confirmed', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    IN_PROGRESS: { label: 'جارٍ التنفيذ', labelEn: 'In Progress', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    COMPLETED: { label: 'مكتمل', labelEn: 'Completed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    CANCELLED: { label: 'ملغى', labelEn: 'Cancelled', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    REJECTED: { label: 'مرفوض', labelEn: 'Rejected', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const STATUS_ALL = 'ALL';

export default function VendorCarWashBookingsPage() {
    const { t, i18n } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAr = i18n.language === 'ar';
    const [statusFilter, setStatusFilter] = useState(STATUS_ALL);

    // تحقق من أن المستخدم فيندور غسيل
    if (user?.role !== 'VENDOR' || user?.vendorType !== 'CAR_WASH') {
        return (
            <div className="space-y-6">
                <Card className="p-8 text-center">
                    <Droplets className="mx-auto size-12 text-slate-300" />
                    <p className="mt-4 text-slate-600">
                        {isAr
                            ? 'هذه الصفحة متاحة لفيندور خدمة الغسيل فقط.'
                            : 'This page is only available for car wash vendor accounts.'}
                    </p>
                </Card>
            </div>
        );
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vendor-carwash-bookings', statusFilter],
        queryFn: () =>
            vendorService.getMyComprehensiveCareBookings({
                status: statusFilter !== STATUS_ALL ? statusFilter : undefined,
            }),
        staleTime: 30_000,
    });

    const bookings = data?.list ?? [];
    const pagination = data?.pagination ?? { total: 0 };

    const statusOptions = [STATUS_ALL, 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/vendor/comprehensive-care/services"
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        aria-label={isAr ? 'الخدمات' : 'Services'}
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <Droplets className="size-5 text-cyan-500" />
                            {isAr ? 'حجوزات خدمة الغسيل' : 'Car Wash Bookings'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isAr ? `إجمالي ${pagination.total} حجز` : `Total ${pagination.total} bookings`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = statusFilter === s;
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${isActive
                                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700'
                                }`}
                        >
                            {s === STATUS_ALL
                                ? (isAr ? 'الكل' : 'All')
                                : isAr ? cfg?.label : cfg?.labelEn}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-5">
                            <Skeleton className="h-5 w-40 mb-3" />
                            <Skeleton className="h-4 w-full" />
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <Card className="p-8 text-center">
                    <XCircle className="mx-auto size-10 text-rose-400" />
                    <p className="mt-3 text-slate-600">{error?.message || (isAr ? 'فشل تحميل الحجوزات' : 'Failed to load bookings')}</p>
                </Card>
            ) : bookings.length === 0 ? (
                <Card className="p-12 text-center">
                    <CalendarCheck className="mx-auto size-14 text-slate-200" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        {isAr ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {isAr
                            ? 'ستظهر هنا حجوزات خدمة الغسيل الخاصة بك'
                            : 'Your car wash bookings will appear here'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => {
                        const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
                        const scheduledDate = booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                            })
                            : null;
                        const customerName = booking.customer?.profile
                            ? `${booking.customer.profile.firstName} ${booking.customer.profile.lastName}`
                            : booking.customer?.email || '—';
                        const vehicleInfo = booking.vehicle
                            ? `${booking.vehicle.vehicleModel?.brand?.name ?? ''} ${booking.vehicle.vehicleModel?.name ?? ''} • ${booking.vehicle.plateNumber}`
                            : '—';

                        return (
                            <Card key={booking.id} className="p-4 transition-shadow hover:shadow-md">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    {/* Left — Booking Info */}
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-slate-400">
                                                {booking.bookingNumber}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
                                            >
                                                {isAr ? cfg.label : cfg.labelEn}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1.5">
                                                <User className="size-3.5 shrink-0 text-slate-400" />
                                                {customerName}
                                            </span>
                                            {booking.customer?.phone && (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="size-3.5 shrink-0 text-slate-400" />
                                                    {booking.customer.phone}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <Car className="size-3.5 shrink-0 text-slate-400" />
                                                {vehicleInfo}
                                            </span>
                                        </div>

                                        {/* Services */}
                                        {booking.services?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {booking.services.map((bs) => (
                                                    <span
                                                        key={bs.service?.id ?? bs.id}
                                                        className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-100"
                                                    >
                                                        {isAr ? bs.service?.nameAr || bs.service?.name : bs.service?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right — Date & Price */}
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        {scheduledDate && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                <Clock className="size-3.5" />
                                                {scheduledDate}
                                                {booking.scheduledTime && ` – ${booking.scheduledTime}`}
                                            </span>
                                        )}
                                        <span className="text-sm font-bold text-slate-900">
                                            {Number(booking.totalPrice).toFixed(2)} SAR
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
