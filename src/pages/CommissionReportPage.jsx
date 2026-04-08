import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TrendingUp, Percent, Receipt, BadgeDollarSign, CalendarRange,
  RefreshCw, ChevronRight, FileText, AlertTriangle, Loader2,
  Settings2, CheckCircle2, Info, Download, Printer,
} from 'lucide-react';
import api from '../services/api';
import { settingsService } from '../services/settingsService';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';
import { CURRENCY_SYMBOL } from '../constants/currency';

// ── helpers ──────────────────────────────────────────────────────────────────
// أرقام إنجليزية (0–9) وليس عربية — en-US
function fmt2(n) {
  return Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(n) {
  return Number(n ?? 0).toLocaleString('en-US');
}

function SummaryCard({ icon: Icon, label, value, sub, color = 'indigo', highlight = false }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald:'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50  text-amber-600  border-amber-100',
    rose:   'bg-rose-50   text-rose-600   border-rose-100',
    slate:  'bg-slate-50  text-slate-600  border-slate-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'ring-2 ring-indigo-400/40 ' : ''}${colors[color] ?? colors.indigo}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <Icon className="size-5 opacity-70" />
      </div>
      <p className={`mt-2 font-bold ${highlight ? 'text-2xl' : 'text-xl'}`}>{value} <span className="text-sm font-normal opacity-70">{CURRENCY_SYMBOL}</span></p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

// Default to current month
function defaultDates() {
  const now  = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pad  = (n) => String(n).padStart(2, '0');
  const fmt  = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: fmt(from), to: fmt(to) };
}

export default function CommissionReportPage() {
  const { fmtDT } = useDateFormat();
  const queryClient = useQueryClient();
  const { from: defFrom, to: defTo } = defaultDates();

  const [from, setFrom] = useState(defFrom);
  const [to,   setTo]   = useState(defTo);
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({ from: defFrom, to: defTo });

  // إعدادات العمولة والضريبة
  const { data: settingsData, isLoading: loadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 30_000,
  });

  const findSetting = (key) => {
    for (const cat of Object.keys(settingsData || {})) {
      const found = (settingsData[cat] || []).find((r) => r.key === key);
      if (found) return found;
    }
    return null;
  };

  const vatRow = findSetting('VAT_RATE');
  let vatRate = vatRow?.value != null ? Number(vatRow.value) : 15;
  if (vatRate > 0 && vatRate <= 1) vatRate = vatRate * 100; // تصحيح القيم القديمة

  // حفظ الإعدادات (للضريبة فقط — نسبة العمولة تُحدَّد لكل فيندور من صفحة الفيندور)
  const updateMutation = useMutation({
    mutationFn: ({ key, value }) => settingsService.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['commission-report'] });
      toast.success('تم حفظ الإعداد');
      setEditingKey(null);
    },
    onError: (err) => toast.error(err?.message ?? 'فشل الحفظ'),
  });

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  // تقرير العمولة
  const { data: report, isLoading: loadingReport, isError, error: reportError, refetch } = useQuery({
    queryKey: ['commission-report', applied.from, applied.to, page],
    queryFn: async () => {
      const params = { page, limit: 50 };
      if (applied.from) params.from = applied.from;
      if (applied.to)   params.to   = applied.to;
      const { data } = await api.get('/admin/finance/commission-report', { params });
      if (!data.success) throw new Error(data.error || 'فشل تحميل التقرير');
      return data.data;
    },
    staleTime: 30_000,
    retry: 1,
  });
  const errorMessage = reportError?.response?.data?.error || reportError?.response?.data?.message || reportError?.message;

  const summary = report?.summary;
  const rows    = report?.rows    ?? [];
  const pgn     = report?.pagination;

  const applyFilter = () => {
    setApplied({ from, to });
    setPage(1);
  };

  const openEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(String(value ?? ''));
  };

  const saveEdit = () => {
    if (!editingKey) return;
    updateMutation.mutate({ key: editingKey, value: editValue });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تقرير العمولة والضريبة</h1>
          <p className="mt-1 text-sm text-slate-500">
            عمولة الموقع على الحجوزات المكتملة وطلبات المتجر المُوصّلة/المكتملة · ضريبة القيمة المضافة على العمولة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 print:hidden"
          >
            <Printer className="size-4" /> طباعة التقرير
          </button>
          <button
            type="button"
            onClick={() => { refetch(); refetchSettings(); }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 print:hidden"
          >
            <RefreshCw className="size-4" /> تحديث
          </button>
        </div>
      </div>

      {/* ── Settings Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 print:hidden">
        {/* نسبة العمولة: حسب كل فيندور (لا إعداد عام) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50">
              <Percent className="size-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">نسبة عمولة المنصة</p>
              <p className="text-xs text-slate-500">تُحدَّد لكل فيندور من صفحة تعديل الفيندور</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            كل حجز/طلب يستخدم نسبة العمولة الخاصة بالفيندور المرتبط به. لا يوجد نسبة افتراضية موحّدة.
          </p>
        </div>

        {/* نسبة ضريبة القيمة المضافة */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
                <BadgeDollarSign className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">ضريبة القيمة المضافة (VAT)</p>
                <p className="text-xs text-slate-400">VAT_RATE · تُطبَّق على عمولة الموقع فقط</p>
              </div>
            </div>
            {editingKey !== 'VAT_RATE' && (
              <button
                type="button"
                onClick={() => openEdit('VAT_RATE', vatRate)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                تعديل
              </button>
            )}
          </div>
          {editingKey === 'VAT_RATE' ? (
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="100" step="0.1"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <span className="text-sm text-slate-500">%</span>
              <button onClick={saveEdit} disabled={updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : 'حفظ'}
              </button>
              <button onClick={() => setEditingKey(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-amber-600">{fmtNum(vatRate)}</span>
              <span className="mb-1 text-lg text-amber-400">%</span>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">
            الافتراضي في المملكة العربية السعودية: 15%
          </p>
        </Card>
      </div>

      {/* ── Info box ── */}
      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800 print:hidden">
        <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
        <div>
          <p className="font-semibold mb-1">كيف تعمل الحسابات؟</p>
          <ul className="space-y-0.5 text-xs text-blue-700">
            <li>• <strong>عمولة الموقع</strong> = قيمة (حجز أو طلب متجر) × نسبة العمولة ÷ 100</li>
            <li>• <strong>نسبة العمولة</strong> تُحدَّد <strong>لكل فيندور</strong> من صفحة تعديل الفيندور (حقل نسبة العمولة). لا توجد نسبة افتراضية للمنصة.</li>
            <li>• <strong>ضريبة القيمة المضافة المستحقة</strong> = عمولة الموقع × {fmtNum(vatRate)}% ÷ 100</li>
            <li>• <strong>صافي العمولة بعد الضريبة</strong> = عمولة الموقع − ضريبة القيمة المضافة</li>
            <li>• الحجوزات: حالات <strong>مكتمل / تم التسليم / جاهز للتسليم</strong></li>
            <li>• طلبات المتجر: <strong>مُوصّل أو شُحِن</strong> و<strong>مدفوعة</strong> فقط (للدقة)</li>
          </ul>
        </div>
      </div>

      {/* ── Date filter ── */}
      <Card className="p-5 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarRange className="size-4 text-indigo-500" />
            تحديد الفترة الزمنية
          </div>
          <div className="flex flex-wrap items-end gap-3 flex-1">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">من تاريخ</label>
              <input
                type="date" value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">إلى تاريخ</label>
              <input
                type="date" value={to}
                onChange={(e) => setTo(e.target.value)}
                min={from}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={applyFilter}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <TrendingUp className="size-4" /> عرض التقرير
            </button>
          </div>

          {/* Quick ranges */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'هذا الشهر',    fn: () => { const n = new Date(); const pad = x => String(x).padStart(2,'0'); const y = n.getFullYear(), m = n.getMonth(); const f = `${y}-${pad(m+1)}-01`; const t2 = new Date(y,m+1,0); const tt = `${y}-${pad(m+1)}-${pad(t2.getDate())}`; setFrom(f); setTo(tt); } },
              { label: 'الشهر الماضي', fn: () => { const n = new Date(); const pad = x => String(x).padStart(2,'0'); const y = n.getFullYear(), m = n.getMonth()-1 < 0 ? 11 : n.getMonth()-1; const yr = m === 11 ? n.getFullYear()-1 : y; const f = `${yr}-${pad(m+1)}-01`; const t2 = new Date(yr,m+1,0); const tt = `${yr}-${pad(m+1)}-${pad(t2.getDate())}`; setFrom(f); setTo(tt); } },
              { label: 'هذه السنة',    fn: () => { const y = new Date().getFullYear(); setFrom(`${y}-01-01`); setTo(`${y}-12-31`); } },
              { label: 'كل الوقت',     fn: () => { setFrom(''); setTo(''); } },
            ].map((q) => (
              <button key={q.label} type="button" onClick={() => { q.fn(); }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Summary ── */}
      {loadingReport ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={Receipt}
              color="indigo"
              label="إجمالي الإيرادات (حجوزات + متجر)"
              value={fmt2(summary.totalRevenue)}
              sub={`${fmtNum(summary.totalBookings)} حجز · ${fmtNum(summary.totalMarketplaceOrders)} طلب متجر`}
            />
            <SummaryCard
              icon={TrendingUp}
              color="emerald"
              label="عمولة الموقع"
              value={fmt2(summary.totalCommission)}
              sub="حسب نسبة كل فيندور"
              highlight
            />
            <SummaryCard
              icon={BadgeDollarSign}
              color="amber"
              label="ضريبة القيمة المضافة المستحقة"
              value={fmt2(summary.totalVat)}
              sub={`${fmtNum(summary.vatRate)}% من العمولة`}
            />
            <SummaryCard
              icon={CheckCircle2}
              color="slate"
              label="صافي العمولة بعد الضريبة"
              value={fmt2(summary.totalNetCommission)}
              sub="العمولة الصافية المتبقية"
            />
          </div>

          {/* Period indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-800">
            <CalendarRange className="size-4 shrink-0 text-indigo-500" />
            <span className="font-medium">الفترة:</span>
            <span>
              {summary.periodFrom
                ? `${summary.periodFrom} → ${summary.periodTo}`
                : 'كل الفترة (حجوزات + طلبات متجر)'}
            </span>
          </div>
        </>
      ) : null}

      {/* ── Table ── */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            تفاصيل الحجوزات وطلبات المتجر
            {pgn && <span className="mr-2 text-slate-400 font-normal text-xs">({fmtNum(pgn.total)} عنصر)</span>}
          </h2>
        </div>

        {loadingReport ? (
          <div className="p-6"><TableSkeleton rows={8} cols={6} /></div>
        ) : isError ? (
          <div className="flex flex-col gap-2 p-6 text-sm text-rose-700">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 shrink-0" />
              <span>فشل تحميل التقرير</span>
            </div>
            {errorMessage && <p className="mr-8 text-xs text-rose-600">{errorMessage}</p>}
            <button type="button" onClick={() => refetch()} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100">
              <RefreshCw className="size-3.5" /> إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            لا توجد حجوزات أو طلبات متجر مكتملة/مُوصّلة في هذه الفترة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">النوع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">الرقم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">قيمة الحجز</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500" title="قد تختلف حسب الفيندور">
                    نسبة العمولة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">العمولة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ضريبة القيمة المضافة ({fmtNum(summary?.vatRate ?? vatRate)}%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">صافي العمولة</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => {
                  const isMarketplace = row.source === 'marketplace';
                  const refNum = isMarketplace ? (row.orderNumber ?? row.id?.slice(0, 8)) : (row.bookingNumber ?? row.id?.slice(0, 8));
                  const detailUrl = isMarketplace ? `/marketplace-orders/${row.id}` : `/bookings/${row.id}`;
                  return (
                  <tr key={`${row.source}-${row.id}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isMarketplace ? 'bg-violet-100 text-violet-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {isMarketplace ? 'طلب متجر' : 'حجز'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={detailUrl} className="font-mono text-xs text-indigo-600 hover:text-indigo-500">
                        {refNum}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDT(row.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{fmt2(row.totalPrice)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3">
                      {row.commissionPercent != null ? (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                          {Number(row.commissionPercent).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{fmt2(row.commission)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3 text-amber-700">{fmt2(row.vat)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{fmt2(row.netAfterVat)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3">
                      <Link to={detailUrl} className="text-slate-400 hover:text-indigo-600">
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ); })}
              </tbody>
              {/* Totals footer */}
              {summary && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-slate-700">الإجمالي ({fmtNum(pgn?.total)} عنصر)</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{fmt2(summary.totalRevenue)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-sm text-emerald-700">{fmt2(summary.totalCommission)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3 text-sm text-amber-700">{fmt2(summary.totalVat)} {CURRENCY_SYMBOL}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmt2(summary.totalNetCommission)} {CURRENCY_SYMBOL}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Pagination */}
        {pgn && pgn.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 print:hidden">
            <span className="text-xs text-slate-500">
              صفحة {fmtNum(pgn.page)} من {fmtNum(pgn.totalPages)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pgn.page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(p => Math.min(pgn.totalPages, p + 1))}
                disabled={pgn.page >= pgn.totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
