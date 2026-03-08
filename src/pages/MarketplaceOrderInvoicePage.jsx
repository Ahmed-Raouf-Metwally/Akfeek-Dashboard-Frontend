import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, CheckCircle2, Clock,
  User, ChevronRight, Printer, Banknote, Package,
} from 'lucide-react';
import { marketplaceOrderService } from '../services/marketplaceOrderService';
import { TableSkeleton } from '../components/ui/Skeleton';
import TaxInvoiceView from '../components/invoice/TaxInvoiceView';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../constants/currency';
import { useTranslation } from 'react-i18next';

function StatusBadge({ status, label }) {
  const isPaid = status === 'PAID';
  const cfg = isPaid
    ? { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
    : { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.color}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
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

/**
 * Build an invoice-shaped object from marketplace order for TaxInvoiceView.
 * @param {object} order - Marketplace order
 * @param {string} [baseUrl] - Optional base URL for invoice link (e.g. origin + path to this invoice page)
 */
function orderToInvoiceLike(order, baseUrl = '') {
  const items = order?.items ?? order?.orderItems ?? [];
  const lineItems = items.map((item) => {
    const name = item.autoPart?.nameAr || item.autoPart?.name || '—';
    const totalPrice = Number(item.totalPrice ?? item.quantity * item.unitPrice ?? 0);
    return {
      description: name,
      descriptionAr: item.autoPart?.nameAr || name,
      quantity: item.quantity ?? 1,
      totalPrice,
    };
  });
  const firstVendor = items[0]?.vendor;
  const vendor = firstVendor
    ? {
        ...firstVendor,
        businessNameAr: firstVendor.businessNameAr || firstVendor.businessName,
        businessName: firstVendor.businessName || firstVendor.businessNameAr,
      }
    : null;
  return {
    id: order.id,
    invoiceNumber: order.orderNumber ?? order.id,
    customer: order.customer,
    lineItems,
    totalAmount: Number(order.totalAmount ?? 0),
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    shippingCost: Number(order.shippingCost ?? 0),
    issuedAt: order.createdAt,
    dueDate: order.createdAt,
    paidAt: order.paymentStatus === 'PAID' ? order.updatedAt || order.createdAt : null,
    status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
    vendor,
    seller: vendor,
    invoiceUrl: baseUrl || undefined,
  };
}

export default function MarketplaceOrderInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fmt, fmtDT } = useDateFormat();

  const { data: orderResp, isLoading, isError } = useQuery({
    queryKey: ['marketplace-order', id],
    queryFn: () => marketplaceOrderService.getOrderById(id),
    enabled: !!id,
  });

  const order = orderResp?.data ?? orderResp;
  const invoiceUrl = typeof window !== 'undefined' ? `${window.location.origin}/marketplace-orders/${id}/invoice` : '';
  const invoice = order ? orderToInvoiceLike(order, invoiceUrl) : null;

  const customerName = invoice?.customer?.profile
    ? [invoice.customer.profile.firstName, invoice.customer.profile.lastName].filter(Boolean).join(' ')
    : invoice?.customer?.email || invoice?.customer?.phone || '—';

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <TableSkeleton rows={2} cols={2} />
        <Card className="p-6"><TableSkeleton rows={8} cols={3} /></Card>
      </div>
    );
  }

  if (isError || !order || !invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <p className="mb-4 text-slate-600">{t('marketplaceOrders.detail.notFound')}</p>
          <Link to="/marketplace-orders" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            {t('marketplaceOrders.detail.backToOrders')}
          </Link>
        </Card>
      </div>
    );
  }

  // إجمالي الطلب = المجموع الفرعي (شامل الضريبة) + الشحن فقط — لا نضيف ضريبة منفصلة (حتى للطلبات القديمة المخزنة خطأ)
  const subtotal = Number(order.subtotal ?? invoice.subtotal ?? 0);
  const shippingCost = Number(order.shippingCost ?? invoice.shippingCost ?? 0);
  const effectiveTotal = subtotal + shippingCost;
  const productsTotal = subtotal;
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="size-5" />
        </button>
        <Link to="/marketplace-orders" className="text-slate-500 hover:text-indigo-600">
          {t('marketplaceOrders.titleAdmin')}
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <Link to={`/marketplace-orders/${id}`} className="text-slate-500 hover:text-indigo-600">
          {invoice.invoiceNumber}
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="font-medium text-slate-900">{t('marketplaceOrders.detail.invoiceTitle')}</span>
      </div>

      {/* Hero - same as InvoiceDetailPage */}
      <Card className="overflow-hidden p-0">
        <div className={`px-6 pt-6 pb-8 ${isPaid ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <FileText className="size-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {t('marketplaceOrders.detail.invoiceTitle')}
                </p>
                <h1 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h1>
                <p className="mt-0.5 text-sm text-white/80">{customerName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={order.paymentStatus} label={t(`finance.status.${order.paymentStatus}`, order.paymentStatus)} />
              <span className="text-3xl font-bold text-white">
                {effectiveTotal != null ? Number(effectiveTotal).toFixed(2) : '—'}
                <span className="text-base font-normal text-white/60"> {CURRENCY_SYMBOL}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">{t('marketplaceOrders.detail.date')}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{fmt(invoice.issuedAt) ?? '—'}</p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">{t('marketplaceOrders.orderNumber')}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{invoice.invoiceNumber}</p>
          </div>
          <div className="px-5 py-3 text-center">
            <p className="text-xs text-slate-400">{t('marketplaceOrders.detail.status')}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {t(`finance.status.${order.paymentStatus}`, order.paymentStatus)}
            </p>
          </div>
        </div>
      </Card>

      {/* Tax invoice view - same as /invoices */}
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {t('marketplaceOrders.detail.invoiceTitle')} (Tax Invoice)
          </h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600 print:hidden"
          >
            <Printer className="size-4" />
            {t('marketplaceOrders.detail.printInvoice')}
          </button>
        </div>
        <div className="p-6 tax-invoice-print">
          <TaxInvoiceView invoice={invoice} />
        </div>
      </Card>

      {/* Amount breakdown & customer - print:hidden */}
      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <Banknote className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">{t('marketplaceOrders.detail.subtotal')} / {t('marketplaceOrders.detail.total')}</h2>
          </div>
          <div>
            <AmountRow label={t('marketplaceOrders.detail.subtotalInclusive')} value={productsTotal} />
            {shippingCost > 0 && (
              <AmountRow label={t('marketplaceOrders.detail.shipping')} value={shippingCost} sub />
            )}
            <AmountRow label={t('marketplaceOrders.detail.total')} value={effectiveTotal} highlight />
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <User className="size-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">{t('marketplaceOrders.detail.customerDetails')}</h2>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-slate-800">{customerName}</p>
            <p className="text-slate-600">{invoice.customer?.email}</p>
            <p className="text-slate-600">{invoice.customer?.phone}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to={`/marketplace-orders/${id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <Package className="size-3.5" />
              {t('marketplaceOrders.orderNumber')} {invoice.invoiceNumber}
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 pb-6 print:hidden">
        <Link to="/marketplace-orders" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          {t('marketplaceOrders.titleAdmin')}
        </Link>
        <Link to={`/marketplace-orders/${id}`} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          {t('common.view')} {t('marketplaceOrders.orderNumber')}
        </Link>
      </div>
    </div>
  );
}
