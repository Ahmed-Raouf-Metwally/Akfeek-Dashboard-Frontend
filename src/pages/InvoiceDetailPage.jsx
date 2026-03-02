import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock,
  User, CalendarCheck, ChevronRight, AlertCircle,
  CreditCard, BadgeCheck, Banknote, Loader2, Wallet, Star,
} from 'lucide-react';
import api from '../services/api';
import { invoiceService } from '../services/invoiceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useDateFormat } from '../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../constants/currency';

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:    { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700 border-amber-200',    icon: Clock,         dot: 'bg-amber-500' },
  ISSUED:     { label: 'صادرة',         color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: FileText,      dot: 'bg-blue-500' },
  PAID:       { label: 'مدفوعة',        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2,  dot: 'bg-emerald-500' },
  PARTIALLY_PAID: { label: 'مدفوعة جزئياً', color: 'bg-teal-100 text-teal-700 border-teal-200',  icon: CreditCard,    dot: 'bg-teal-500' },
  OVERDUE:    { label: 'متأخرة',        color: 'bg-red-100 text-red-700 border-red-200',           icon: AlertCircle,   dot: 'bg-red-500' },
  CANCELLED:  { label: 'ملغاة',         color: 'bg-rose-100 text-rose-700 border-rose-200',        icon: XCircle,       dot: 'bg-rose-500' },
  REFUNDED:   { label: 'مستردة',        color: 'bg-slate-100 text-slate-600 border-slate-200',     icon: Banknote,      dot: 'bg-slate-400' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  const Icon = cfg.icon ?? FileText;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.color}`}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-36 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="flex-1 text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function AmountRow({ label, value, sub = false, highlight = false, color = '' }) {
  if (value == null) return null;
  return (
    <div className={`flex items-center justify-between py-2.5 ${highlight ? 'border-t-2 border-slate-200 mt-2 pt-4' : sub ? '' : 'border-b border-slate-50'}`}>
      <span className={`${sub ? 'text-xs text-slate-400' : 'text-sm text-slate-600'} ${highlight ? 'font-bold text-slate-900 text-base' : ''}`}>
        {label}
      </span>
      <span className={`font-semibold ${highlight ? 'text-xl text-slate-900' : sub ? 'text-xs text-slate-500' : 'text-sm text-slate-800'} ${color}`}>
        {Number(value).toFixed(2)} {CURRENCY_SYMBOL}
      </span>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { fmt, fmtDT } = useDateFormat();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoiceById(id),
    enabled: !!id,
  });

  const [payMethod, setPayMethod] = useState('CASH');
  const markPaidMutation = useMutation({
    mutationFn: (body) => api.patch(`/invoices/${id}/mark-paid`, body || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('تم تحديد الفاتورة كمدفوعة');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.response?.data?.errorAr || 'فشل العملية'),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <TableSkeleton rows={2} cols={2} />
        <Card className="p-6"><TableSkeleton rows={8} cols={3} /></Card>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto size-12 text-slate-300 mb-4" />
          <p className="mb-4 text-slate-600">لم يُعثر على الفاتورة أو فشل تحميلها.</p>
          <Link to="/invoices" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            العودة للفواتير
          </Link>
        </Card>
      </div>
    );
  }

  const customerName = invoice.customer?.profile
    ? [invoice.customer.profile.firstName, invoice.customer.profile.lastName].filter(Boolean).join(' ')
    : invoice.customer?.email || invoice.customer?.phone || '—';

  const isPaid = invoice.status === 'PAID';
  const remaining = invoice.totalAmount != null && invoice.paidAmount != null
    ? Number(invoice.totalAmount) - Number(invoice.paidAmount)
    : null;

  const cfg = STATUS_CONFIG[invoice.status] ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="size-5" />
        </button>
        <Link to="/invoices" className="text-slate-500 hover:text-indigo-600">الفواتير</Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="font-medium text-slate-900">{invoice.invoiceNumber ?? invoice.id}</span>
      </div>

      {/* ── Hero ── */}
      <Card className="overflow-hidden p-0">
        <div className={`px-6 pt-6 pb-8 ${isPaid ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <FileText className="size-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">فاتورة رقم</p>
                <h1 className="text-2xl font-bold text-white">{invoice.invoiceNumber ?? invoice.id}</h1>
                <p className="mt-0.5 text-sm text-white/80">{customerName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={invoice.status} />
              <span className="text-3xl font-bold text-white">
                {invoice.totalAmount != null ? Number(invoice.totalAmount).toFixed(2) : '—'}
                <span className="text-base font-normal text-white/60"> {CURRENCY_SYMBOL}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">تاريخ الإصدار</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{fmt(invoice.issuedAt) ?? '—'}</p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">تاريخ الاستحقاق</p>
            <p className={`mt-0.5 text-sm font-semibold ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-slate-800'}`}>
              {fmt(invoice.dueDate) ?? '—'}
            </p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">تاريخ الدفع</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {invoice.paidAt ? fmtDT(invoice.paidAt) : '—'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Amount breakdown ── */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <Banknote className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">تفاصيل المبالغ</h2>
          </div>
          <div>
            <AmountRow label="إجمالي الفاتورة" value={invoice.totalAmount} />
            <AmountRow label="المبلغ المدفوع" value={invoice.paidAmount} color="text-emerald-600" />
            {remaining > 0.01 && (
              <AmountRow label="المتبقي" value={remaining} color="text-rose-600" />
            )}
            {isPaid && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                تم السداد بالكامل
              </div>
            )}
            {!isPaid && isAdmin && invoice.status !== 'CANCELLED' && (
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-slate-500">طريقة الدفع</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="CASH">نقدي (CASH)</option>
                  <option value="WALLET">من المحفظة (WALLET)</option>
                  <option value="CARD">بطاقة (CARD)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="MADA">مدى</option>
                </select>
                {payMethod === 'WALLET' && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    سيتم خصم المبلغ من محفظة العميل وإنشاء سجل دفع ومعاملة محفظة.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => markPaidMutation.mutate({ method: payMethod })}
                  disabled={markPaidMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {markPaidMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  تحديد كمدفوعة
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* ── Customer & Booking ── */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <User className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">العميل والحجز</h2>
          </div>
          <div>
            <InfoRow label="اسم العميل" value={customerName} />
            <InfoRow label="البريد الإلكتروني" value={invoice.customer?.email} />
            <InfoRow label="رقم الهاتف" value={invoice.customer?.phone} />
            {invoice.booking && (
              <>
                <div className="my-2 border-t border-dashed border-slate-100" />
                <div className="flex items-start gap-3 py-3">
                  <span className="w-36 shrink-0 text-sm text-slate-500">رقم الحجز</span>
                  <Link
                    to={`/bookings/${invoice.booking.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <CalendarCheck className="size-3.5" />
                    {invoice.booking.bookingNumber ?? invoice.booking.id}
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
                {invoice.booking.status && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-36 shrink-0 text-sm text-slate-500">حالة الحجز</span>
                    <span className="text-sm font-medium text-slate-700">{invoice.booking.status}</span>
                  </div>
                )}
                {invoice.booking.scheduledDate && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-36 shrink-0 text-sm text-slate-500">تاريخ الحجز</span>
                    <span className="text-sm font-medium text-slate-700">{fmt(invoice.booking.scheduledDate)}</span>
                  </div>
                )}
              </>
            )}
            <div className="mt-2 border-t border-dashed border-slate-100 pt-3">
              <InfoRow label="تاريخ الإنشاء" value={fmtDT(invoice.createdAt)} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Payment status visual ── */}
      {invoice.totalAmount != null && invoice.paidAmount != null && Number(invoice.totalAmount) > 0 && (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-800">تقدم السداد</h2>
            </div>
            <span className="text-sm font-bold text-slate-700">
              {Math.min(100, Math.round((Number(invoice.paidAmount) / Number(invoice.totalAmount)) * 100))}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(100, (Number(invoice.paidAmount) / Number(invoice.totalAmount)) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>مدفوع: {Number(invoice.paidAmount).toFixed(2)} {CURRENCY_SYMBOL}</span>
            <span>الإجمالي: {Number(invoice.totalAmount).toFixed(2)} {CURRENCY_SYMBOL}</span>
          </div>
        </Card>
      )}

      {/* ── سجلات الدفع وربط المحفظة والنقاط ── */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">سجلات الدفع والمحفظة والنقاط</h2>
          </div>
          <ul className="space-y-4">
            {invoice.payments.map((pay) => (
              <li key={pay.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-800">{pay.paymentNumber}</span>
                  <span className="text-sm text-slate-600">
                    {Number(pay.amount).toFixed(2)} {CURRENCY_SYMBOL} · {pay.method}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  {pay.walletTransaction && (
                    <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800">
                      <Wallet className="size-4 shrink-0" />
                      <span>تم الخصم من المحفظة</span>
                      <span className="font-mono text-xs opacity-80">{pay.walletTransaction.transactionNumber}</span>
                      <span className="text-xs">({fmt(pay.walletTransaction.createdAt)})</span>
                    </div>
                  )}
                  {pay.pointsTransaction && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <Star className="size-4 shrink-0" />
                      <span>النقاط المكتسبة: +{pay.pointsTransaction.amount} نقطة</span>
                      <span className="text-xs">({fmt(pay.pointsTransaction.createdAt)})</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 pb-6">
        <Link to="/invoices" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          العودة للقائمة
        </Link>
        {invoice.booking?.id && (
          <Link to={`/bookings/${invoice.booking.id}`} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            عرض الحجز
          </Link>
        )}
      </div>
    </div>
  );
}
