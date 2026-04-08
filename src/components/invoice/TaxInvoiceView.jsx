import React from 'react';
import { useDateFormat } from '../../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../../constants/currency';

const VAT_RATE = 15;

/**
 * استخراج بيانات البائع (الفيندور) من الفاتورة.
 * البائع هو مقدم الخدمة؛ أكفيك منصة لها عمولة فقط ولا تظهر كبائع.
 */
function getSellerFromInvoice(invoice) {
  const v = invoice?.vendor ?? invoice?.booking?.workshop?.vendor ?? invoice?.seller;
  if (!v) return null;
  const user = v.user ?? v;
  return {
    tradeName: v.businessNameAr || v.businessName || '—',
    taxNumber: v.taxNumber || '',
    commercialRegistration: v.commercialLicense || '',
    address: [v.address, v.city, v.country].filter(Boolean).join('، ') || 'المملكة العربية السعودية',
    email: v.contactEmail || user?.email || '—',
    phone: v.contactPhone || user?.phone || '—',
    website: v.website || '',
  };
}

/**
 * عرض الفاتورة الضريبية بالشكل المعتمد (فاتورة ضريبية - بين منشأة ومنشأة).
 * البائع = الفيندور (مقدم الخدمة)، والسعر المعروض هو السعر الشامل للضريبة الذي يحدده الفيندور.
 * أكفيك منصة لها عمولة فقط ولا تظهر كبائع.
 */
export default function TaxInvoiceView({ invoice }) {
  const { fmt, fmtDT } = useDateFormat();

  const seller = getSellerFromInvoice(invoice);

  const customer = invoice?.customer;
  const buyerName = customer?.profile
    ? [customer.profile.firstName, customer.profile.lastName].filter(Boolean).join(' ') || customer?.email
    : customer?.email || customer?.phone || '—';
  const buyerEmail = customer?.email || '—';
  const buyerPhone = customer?.phone || '—';
  const buyerAddress = 'المملكة العربية السعودية';

  // السعر الذي يحدده الفيندور شامل الضريبة — نستنتج المبلغ قبل الضريبة ومبلغ الضريبة لكل بند
  const invoiceTotal = invoice?.totalAmount != null ? Number(invoice.totalAmount) : 0;

  const lineItems = invoice?.lineItems && invoice.lineItems.length > 0
    ? invoice.lineItems.map((line) => {
        const qty = line.quantity || 1;
        const totalPrice = Number(line.totalPrice ?? 0); // شامل الضريبة
        const amountBeforeTaxLine = totalPrice / (1 + VAT_RATE / 100);
        const lineTax = totalPrice - amountBeforeTaxLine;
        const unitPrice = totalPrice / qty;
        return {
          description: line.descriptionAr || line.description || 'خدمة',
          quantity: qty,
          unitPrice,
          amountBeforeTax: amountBeforeTaxLine,
          taxRate: VAT_RATE,
          taxAmount: lineTax,
          total: totalPrice,
        };
      })
    : [
        {
          description: 'خدمة صيانة / خدمات الحجز',
          quantity: 1,
          unitPrice: invoiceTotal,
          amountBeforeTax: invoiceTotal / (1 + VAT_RATE / 100),
          taxRate: VAT_RATE,
          taxAmount: invoiceTotal - invoiceTotal / (1 + VAT_RATE / 100),
          total: invoiceTotal,
        },
      ];

  // الملخص = مجموع البنود فقط (حتى يتطابق الجدول مع الملخص)
  const summarySubtotal = lineItems.reduce((s, r) => s + r.amountBeforeTax, 0);
  const summaryTax = lineItems.reduce((s, r) => s + r.taxAmount, 0);
  const summaryTotal = lineItems.reduce((s, r) => s + r.total, 0);

  const invoiceUrl = invoice?.invoiceUrl || (typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoice?.id}` : '');
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(invoiceUrl)}`;

  return (
    <div className="rounded-xl border-0 bg-transparent p-0 shadow-none print:p-0" dir="rtl">
      {/* ── Header: عنوان الفاتورة + رمز QR ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-4">
          <img src={qrSrc} alt="QR" className="size-20 shrink-0 rounded border border-slate-200 bg-white object-contain print:size-16" width={80} height={80} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">فاتورة ضريبية</h1>
            <p className="mt-0.5 text-xs text-slate-500">Tax Invoice (تصدر بين منشأة ومنشأة)</p>
            <p className="mt-2 text-sm font-medium text-slate-700">الرقم التسلسلي: {invoice?.invoiceNumber ?? invoice?.id ?? '—'}</p>
            <p className="text-xs text-slate-600">تاريخ ووقت الإصدار: {invoice?.issuedAt ? fmtDT(invoice.issuedAt) : '—'}</p>
          </div>
        </div>
      </div>

      {/* ── معلومات البائع (الفيندور) ومعلومات المشتري ── */}
      <div className="mb-6 grid gap-6 border-b border-slate-200 pb-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-800">معلومات البائع</h2>
          {seller ? (
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li><span className="text-slate-500">الاسم التجاري:</span> {seller.tradeName}</li>
              {seller.taxNumber && <li><span className="text-slate-500">الرقم الضريبي:</span> {seller.taxNumber}</li>}
              {seller.commercialRegistration && <li><span className="text-slate-500">رقم السجل التجاري:</span> {seller.commercialRegistration}</li>}
              <li><span className="text-slate-500">عنوان:</span> {seller.address}</li>
              <li><span className="text-slate-500">البريد الإلكتروني:</span> {seller.email}</li>
              {seller.phone && <li><span className="text-slate-500">رقم الهاتف:</span> {seller.phone}</li>}
              {seller.website && <li><span className="text-slate-500">الموقع الإلكتروني:</span> {seller.website}</li>}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">لم يتم ربط البائع (الفيندور) بهذه الفاتورة.</p>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-800">معلومات المشتري</h2>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li><span className="text-slate-500">الاسم التجاري / الاسم:</span> {buyerName}</li>
            <li><span className="text-slate-500">البريد الإلكتروني:</span> {buyerEmail}</li>
            <li><span className="text-slate-500">رقم الهاتف:</span> {buyerPhone}</li>
            <li><span className="text-slate-500">عنوان:</span> {buyerAddress}</li>
          </ul>
        </section>
      </div>

      {/* ── جدول البنود ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" role="table">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-right font-semibold text-slate-700">البيان</th>
              <th className="px-3 py-2.5 text-center font-semibold text-slate-700">الكمية</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-700">السعر الوحدة</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-700">المبلغ قبل الضريبة</th>
              <th className="px-3 py-2.5 text-center font-semibold text-slate-700">نسبة الضريبة</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-700">مبلغ الضريبة</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-700">إجمالي المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((row, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-3 py-2.5 text-right text-slate-800">{row.description}</td>
                <td className="px-3 py-2.5 text-center text-slate-700">{row.quantity}</td>
                <td className="px-3 py-2.5 text-left font-mono text-slate-700">{Number(row.unitPrice).toFixed(2)} {CURRENCY_SYMBOL}</td>
                <td className="px-3 py-2.5 text-left font-mono text-slate-700">{Number(row.amountBeforeTax).toFixed(2)} {CURRENCY_SYMBOL}</td>
                <td className="px-3 py-2.5 text-center text-slate-700">{row.taxRate}%</td>
                <td className="px-3 py-2.5 text-left font-mono text-slate-700">{Number(row.taxAmount).toFixed(2)} {CURRENCY_SYMBOL}</td>
                <td className="px-3 py-2.5 text-left font-mono font-semibold text-slate-800">{Number(row.total).toFixed(2)} {CURRENCY_SYMBOL}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── الملخص = مجموع بنود الجدول (حتى تتطابق الأرقام) ── */}
      <div className="mt-6 flex justify-start">
        <div className="min-w-[240px] rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-600">المجموع (غير شامل ضريبة القيمة المضافة)</span>
            <span className="font-mono font-medium text-slate-800">{Number(summarySubtotal).toFixed(2)} {CURRENCY_SYMBOL}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-600">ضريبة القيمة المضافة ({VAT_RATE}%)</span>
            <span className="font-mono font-medium text-slate-800">{Number(summaryTax).toFixed(2)} {CURRENCY_SYMBOL}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>المجموع مع الضريبة ({VAT_RATE}%)</span>
            <span className="font-mono">{Number(summaryTotal).toFixed(2)} {CURRENCY_SYMBOL}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        صادرة عبر منصة أكفيك (عمولة المنصة فقط)
      </p>
    </div>
  );
}
