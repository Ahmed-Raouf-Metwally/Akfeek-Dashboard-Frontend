import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CalendarCheck, Clock, Radio, ClipboardCheck,
  PackageSearch, FileText, Star, Wrench, User, Car,
  MapPin, MessageSquare, ChevronRight, CheckCircle2,
  XCircle, AlertCircle, Loader2, Receipt, Building2,
} from 'lucide-react';
import api from '../services/api';
import { bookingService } from '../services/bookingService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useDateFormat } from '../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../constants/currency';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:              { label: 'قيد الانتظار',        color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  CONFIRMED:            { label: 'مؤكد',                color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  BROADCASTING:         { label: 'جارٍ البث',           color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  OFFERS_RECEIVED:      { label: 'عروض مستلمة',        color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  TECHNICIAN_ASSIGNED:  { label: 'فني مخصص',           color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-500' },
  IN_PROGRESS:          { label: 'جارٍ التنفيذ',        color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  INSPECTING:           { label: 'قيد الفحص',           color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  QUOTE_PENDING:        { label: 'في انتظار التسعير',   color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  QUOTE_APPROVED:       { label: 'تم قبول السعر',       color: 'bg-teal-100 text-teal-700 border-teal-200',       dot: 'bg-teal-500' },
  QUOTE_REJECTED:       { label: 'تم رفض السعر',        color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  PARTS_NEEDED:         { label: 'قطع غيار مطلوبة',    color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  PARTS_ORDERED:        { label: 'تم طلب القطع',        color: 'bg-sky-100 text-sky-700 border-sky-200',          dot: 'bg-sky-500' },
  PARTS_DELIVERED:      { label: 'تم تسليم القطع',      color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  COMPLETED:            { label: 'مكتمل',               color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  READY_FOR_DELIVERY:   { label: 'جاهز للتسليم',        color: 'bg-lime-100 text-lime-700 border-lime-200',       dot: 'bg-lime-500' },
  IN_TRANSIT_DELIVERY:  { label: 'في الطريق',           color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-500' },
  DELIVERED:            { label: 'تم التسليم',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED:            { label: 'ملغى',                color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  REJECTED:             { label: 'مرفوض',               color: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  NO_SHOW:              { label: 'لم يحضر',             color: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
};

function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  const px = size === 'lg' ? 'px-4 py-1.5 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.color} ${px}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, className = '' }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className={`flex items-start gap-3 border-b border-slate-100 py-3 last:border-0 ${className}`}>
      <span className="w-36 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="flex-1 text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function PriceRow({ label, value, highlight = false }) {
  if (value == null) return null;
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'border-t border-slate-200 mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold text-slate-900 text-base' : 'font-medium text-slate-700'}`}>
        {Number(value).toFixed(2)} {CURRENCY_SYMBOL}
      </span>
    </div>
  );
}

// Admin status transition options
const ADMIN_STATUS_TRANSITIONS = {
  PENDING:             ['CONFIRMED', 'CANCELLED', 'REJECTED'],
  CONFIRMED:           ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS:         ['COMPLETED', 'PARTS_NEEDED'],
  PARTS_NEEDED:        ['PARTS_ORDERED', 'IN_PROGRESS'],
  PARTS_ORDERED:       ['PARTS_DELIVERED'],
  PARTS_DELIVERED:     ['IN_PROGRESS'],
  COMPLETED:           ['DELIVERED'],
  READY_FOR_DELIVERY:  ['DELIVERED'],
};

export default function BookingDetailPage() {
  const { fmt, fmtDT } = useDateFormat();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [changingStatus, setChangingStatus] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ newStatus, reason }) =>
      api.patch(`/bookings/${id}/status`, { status: newStatus, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('تم تحديث الحالة');
      setChangingStatus(false);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'فشل تحديث الحالة'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <TableSkeleton rows={2} cols={2} />
        <Card className="p-6"><TableSkeleton rows={8} cols={3} /></Card>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto size-12 text-slate-300 mb-4" />
          <p className="mb-4 text-slate-600">لم يُعثر على الحجز أو فشل تحميله.</p>
          <Link to="/bookings" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            العودة للحجوزات
          </Link>
        </Card>
      </div>
    );
  }

  const customerName = booking.customer?.profile
    ? [booking.customer.profile.firstName, booking.customer.profile.lastName].filter(Boolean).join(' ')
    : booking.customer?.email || booking.customer?.phone || '—';

  const vehicleLabel = booking.vehicle
    ? [
        booking.vehicle.vehicleModel?.brand?.name,
        booking.vehicle.vehicleModel?.name,
        booking.vehicle.vehicleModel?.year,
      ].filter(Boolean).join(' ')
    : null;

  const nextStatuses = ADMIN_STATUS_TRANSITIONS[booking.status] ?? [];
  const canChangeStatus = isAdmin && nextStatuses.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="size-5" />
        </button>
        <Link to="/bookings" className="text-slate-500 hover:text-indigo-600">الحجوزات</Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="font-medium text-slate-900">{booking.bookingNumber ?? booking.id}</span>
      </div>

      {/* ── Hero Card ── */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 pt-6 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <CalendarCheck className="size-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">حجز رقم</p>
                <h1 className="text-2xl font-bold text-white">{booking.bookingNumber ?? booking.id}</h1>
                <p className="mt-0.5 text-sm text-indigo-100">{customerName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={booking.status} size="lg" />
              {(() => {
                const total = Number(booking.subtotal ?? 0) + Number(booking.laborFee ?? 0) + Number(booking.deliveryFee ?? 0) + Number(booking.partsTotal ?? 0) - Number(booking.discount ?? 0);
                if (total === 0 && booking.totalPrice == null) return null;
                return (
                  <span className="text-2xl font-bold text-white">
                    {total.toFixed(2)} <span className="text-base font-normal text-indigo-200">{CURRENCY_SYMBOL}</span>
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">تاريخ الموعد</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{fmt(booking.scheduledDate) ?? '—'}</p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">الوقت</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{booking.scheduledTime ?? '—'}</p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">تاريخ الإنشاء</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{fmtDT(booking.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* ── Admin Status Change ── */}
      {canChangeStatus && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">تغيير الحالة (Admin):</span>
            {nextStatuses.map(s => {
              const cfg = STATUS_CONFIG[s] ?? {};
              return (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate({ newStatus: s })}
                  disabled={statusMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50 ${cfg.color}`}
                >
                  {statusMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {cfg.label ?? s}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Customer & Vehicle ── */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <User className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">العميل والمركبة</h2>
          </div>
          <div>
            <InfoRow label="اسم العميل" value={customerName} />
            <InfoRow label="البريد الإلكتروني" value={booking.customer?.email} />
            <InfoRow label="رقم الهاتف" value={booking.customer?.phone} />
            {vehicleLabel && <InfoRow label="المركبة" value={vehicleLabel} />}
            {booking.vehicle?.plateNumber && <InfoRow label="رقم اللوحة" value={booking.vehicle.plateNumber} />}
            {booking.technician && (
              <>
                <div className="my-2 border-t border-dashed border-slate-100" />
                <InfoRow
                  label="الفني المخصص"
                  value={
                    booking.technician.profile
                      ? [booking.technician.profile.firstName, booking.technician.profile.lastName].filter(Boolean).join(' ')
                      : booking.technician.email || '—'
                  }
                />
                <InfoRow label="بريد الفني" value={booking.technician.email} />
              </>
            )}
          </div>
        </Card>

        {/* ── Pricing breakdown ── */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <Receipt className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">تفاصيل التسعير</h2>
          </div>
          <div>
            <PriceRow label="المجموع الجزئي" value={booking.subtotal} />
            {booking.laborFee > 0 && <PriceRow label="أجر العمالة" value={booking.laborFee} />}
            {booking.deliveryFee > 0 && <PriceRow label="رسوم التوصيل / الفلاتبد" value={booking.deliveryFee} />}
            {booking.partsTotal > 0 && <PriceRow label="قطع الغيار" value={booking.partsTotal} />}
            {booking.discount > 0 && <PriceRow label="خصم" value={-booking.discount} />}
            <PriceRow
              label="الإجمالي"
              value={
                Number(booking.subtotal ?? 0) +
                Number(booking.laborFee ?? 0) +
                Number(booking.deliveryFee ?? 0) +
                Number(booking.partsTotal ?? 0) -
                Number(booking.discount ?? 0)
              }
              highlight
            />
            {booking.metadata?.commissionPercent != null && (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                نسبة العمولة: {booking.metadata.commissionPercent}% ·
                منصة: {Number(booking.metadata.platformCommission ?? 0).toFixed(2)} {CURRENCY_SYMBOL} ·
                فيندور: {Number(booking.metadata.vendorEarnings ?? 0).toFixed(2)} {CURRENCY_SYMBOL}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Services ── */}
      {booking.services?.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <Wrench className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">الخدمات المحجوزة</h2>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {booking.services.length} خدمة
            </span>
          </div>
          <div className="space-y-2">
            {booking.services.map((bs) => (
              <div key={bs.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{bs.service?.name ?? bs.serviceId}</p>
                  {bs.service?.nameAr && <p className="text-xs text-slate-400">{bs.service.nameAr}</p>}
                  <p className="mt-0.5 text-xs text-slate-500">
                    {bs.quantity} × {Number(bs.unitPrice).toFixed(2)} {CURRENCY_SYMBOL}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800">{Number(bs.totalPrice).toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Workshop & Address ── */}
      {(booking.workshop || booking.address) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {booking.workshop && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <Building2 className="size-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-800">الورشة</h2>
              </div>
              <InfoRow label="الاسم" value={booking.workshop.nameAr ?? booking.workshop.name} />
              <InfoRow label="المدينة" value={booking.workshop.city} />
              <InfoRow label="الهاتف" value={booking.workshop.phone} />
              <InfoRow label="طريقة التوصيل" value={booking.deliveryMethod} />
            </Card>
          )}
          {booking.address && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <MapPin className="size-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-800">عنوان الخدمة</h2>
              </div>
              <InfoRow label="الحي" value={booking.address.label ?? booking.address.labelAr} />
              <InfoRow label="الشارع" value={booking.address.street} />
              <InfoRow label="المدينة" value={booking.address.city} />
            </Card>
          )}
        </div>
      )}

      {/* ── Notes ── */}
      {booking.notes && (
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">ملاحظات</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{booking.notes}</p>
        </Card>
      )}

      {/* ── Status History ── */}
      {booking.statusHistory?.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <Clock className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">سجل الحالات</h2>
          </div>
          <div className="space-y-0">
            {booking.statusHistory.map((h, idx) => {
              const cfg = STATUS_CONFIG[h.toStatus] ?? {};
              return (
                <div key={h.id} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${idx === 0 ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                      <span className={`size-2.5 rounded-full ${cfg.dot ?? 'bg-slate-400'}`} />
                    </div>
                    {idx < booking.statusHistory.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-100 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {h.fromStatus ? `${STATUS_CONFIG[h.fromStatus]?.label ?? h.fromStatus} ← ` : ''}
                        {STATUS_CONFIG[h.toStatus]?.label ?? h.toStatus}
                      </span>
                      <span className="text-xs text-slate-400">{fmtDT(h.timestamp)}</span>
                    </div>
                    {h.reason && <p className="mt-0.5 text-xs text-slate-500">{h.reason}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Related entities ── */}
      {(booking.jobBroadcast || booking.inspectionReport || booking.supplyRequests?.length > 0 || booking.invoice || booking.rating) && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <FileText className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">الكيانات المرتبطة</h2>
          </div>
          <div className="space-y-2">

            {booking.invoice && (
              <Link
                to={`/invoices/${booking.invoice.id}`}
                className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">فاتورة — {booking.invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">
                      {booking.invoice.status} · {booking.invoice.totalAmount ? `${Number(booking.invoice.totalAmount).toFixed(2)} ${CURRENCY_SYMBOL}` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-400" />
              </Link>
            )}

            {booking.jobBroadcast && (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100">
                    <Radio className="size-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">بث الوظيفة</p>
                    <p className="text-xs text-slate-500">
                      {booking.jobBroadcast.status} · {fmt(booking.jobBroadcast.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.inspectionReport && (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100">
                    <ClipboardCheck className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">تقرير الفحص</p>
                    <p className="text-xs text-slate-500">
                      {booking.inspectionReport.status} · حالة: {booking.inspectionReport.overallCondition ?? '—'}
                      {booking.inspectionReport.estimatedCost ? ` · ${Number(booking.inspectionReport.estimatedCost).toFixed(2)} ${CURRENCY_SYMBOL}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.supplyRequests?.map((sr) => (
              <div key={sr.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100">
                    <PackageSearch className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">طلب توريد — {sr.requestNumber}</p>
                    <p className="text-xs text-slate-500">
                      {sr.status} {sr.totalCost ? `· ${Number(sr.totalCost).toFixed(2)} ${CURRENCY_SYMBOL}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {booking.rating && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">تقييم العميل</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`size-3.5 ${s <= booking.rating.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-700">{booking.rating.score}/5</span>
                    </div>
                    {booking.rating.review && <p className="mt-1 text-xs text-slate-600">{booking.rating.review}</p>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </Card>
      )}

      {/* ── Auto parts ── */}
      {booking.bookingAutoParts?.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <PackageSearch className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">قطع الغيار المستخدمة</h2>
          </div>
          <div className="space-y-2">
            {booking.bookingAutoParts.map((bp) => (
              <div key={bp.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{bp.autoPart?.name}</p>
                  <p className="text-xs text-slate-400">SKU: {bp.autoPart?.sku}</p>
                </div>
                <span className="text-sm font-bold text-slate-800">{Number(bp.autoPart?.price ?? 0).toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 pb-6">
        <Link to="/bookings" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          العودة للقائمة
        </Link>
      </div>
    </div>
  );
}
