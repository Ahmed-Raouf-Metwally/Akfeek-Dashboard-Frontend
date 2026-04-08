import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

const DISCOUNT_TYPES = [
  { value: 'PERCENT', labelEn: 'Percent %', labelAr: 'نسبة مئوية %' },
  { value: 'FIXED', labelEn: 'Fixed amount', labelAr: 'مبلغ ثابت' },
];

export default function VendorCouponsPage() {
  const { t, i18n } = useTranslation();
  const { fmt } = useDateFormat();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: coupons = [], isLoading, isError, error } = useQuery({
    queryKey: ['vendor-coupons'],
    queryFn: () => vendorService.getMyCoupons(),
    staleTime: 60_000,
    retry: (_, err) => err?.response?.status !== 403,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => vendorService.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-coupons'] });
      setModalOpen(false);
      toast.success(i18n.language === 'ar' ? 'تم إنشاء الكوبون' : 'Coupon created');
    },
    onError: (e) => toast.error(e.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => vendorService.updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-coupons'] });
      setEditingId(null);
      toast.success(i18n.language === 'ar' ? 'تم تحديث الكوبون' : 'Coupon updated');
    },
    onError: (e) => toast.error(e.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-coupons'] });
      toast.success(i18n.language === 'ar' ? 'تم حذف الكوبون' : 'Coupon deleted');
    },
    onError: (e) => toast.error(e.message || 'Failed'),
  });

  const isAr = i18n.language === 'ar';
  const isVendor = user?.role === 'VENDOR';
  const isForbidden = error?.response?.status === 403;

  if (!isVendor || isForbidden) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة متاحة لحساب فيندور فقط.' : 'This page is only available for vendor accounts.'}
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="overflow-hidden p-0"><TableSkeleton rows={5} cols={5} /></Card>
      </div>
    );
  }

  const editingCoupon = editingId ? coupons.find((c) => c.id === editingId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={isAr ? 'الرئيسية' : 'Dashboard'}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isAr ? 'كوبونات الخصم' : 'Discount Coupons'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAr ? 'الكوبون يطبق على الخدمات الخاصة بك فقط عند حجز العميل' : 'Coupon applies only to your services when a customer books'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setEditingId(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {isAr ? 'إضافة كوبون' : 'Add coupon'}
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="mx-auto size-12 text-slate-300" />
            <p className="mt-2 text-slate-600">{isAr ? 'لا توجد كوبونات. أضف كوبون لخصم العملاء على خدماتك.' : 'No coupons yet. Add a coupon to offer discounts on your services.'}</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {isAr ? 'إضافة كوبون' : 'Add coupon'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'الكود' : 'Code'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'الخصم' : 'Discount'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'الحد الأدنى' : 'Min. order'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'من - إلى' : 'Valid'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'الاستخدام' : 'Uses'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase text-slate-500">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{c.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {c.discountType === 'PERCENT' ? `${Number(c.discountValue)}%` : `${Number(c.discountValue)} SAR`}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {c.minOrderAmount != null ? `${Number(c.minOrderAmount)} SAR` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {fmt(c.validFrom)} – {fmt(c.validUntil)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => { setEditingId(c.id); setModalOpen(true); }}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        title={isAr ? 'تعديل' : 'Edit'}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (window.confirm(isAr ? 'حذف هذا الكوبون؟' : 'Delete this coupon?')) deleteMutation.mutate(c.id); }}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(modalOpen || editingId) && (
        <CouponFormModal
          isOpen={modalOpen || !!editingId}
          onClose={() => { setModalOpen(false); setEditingId(null); }}
          coupon={editingCoupon}
          isAr={isAr}
          onSubmit={(payload) => {
            if (editingId) updateMutation.mutate({ id: editingId, payload });
            else createMutation.mutate(payload);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function CouponFormModal({ isOpen, onClose, coupon, isAr, onSubmit, isSubmitting }) {
  const [code, setCode] = useState(coupon?.code ?? '');
  const [discountType, setDiscountType] = useState(coupon?.discountType ?? 'PERCENT');
  const [discountValue, setDiscountValue] = useState(coupon?.discountValue != null ? String(coupon.discountValue) : '');
  const [minOrderAmount, setMinOrderAmount] = useState(coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : '');
  const [validFrom, setValidFrom] = useState(coupon?.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(coupon?.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 10) : '');
  const [maxUses, setMaxUses] = useState(coupon?.maxUses != null ? String(coupon.maxUses) : '');
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);

  React.useEffect(() => {
    if (!isOpen) return;
    setCode(coupon?.code ?? '');
    setDiscountType(coupon?.discountType ?? 'PERCENT');
    setDiscountValue(coupon?.discountValue != null ? String(coupon.discountValue) : '');
    setMinOrderAmount(coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : '');
    setValidFrom(coupon?.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setValidUntil(coupon?.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 10) : '');
    setMaxUses(coupon?.maxUses != null ? String(coupon.maxUses) : '');
    setIsActive(coupon?.isActive ?? true);
  }, [isOpen, coupon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: code.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount.trim() ? Number(minOrderAmount) : undefined,
      validFrom,
      validUntil: validUntil || undefined,
      maxUses: maxUses.trim() ? parseInt(maxUses, 10) : undefined,
    };
    if (coupon) payload.isActive = isActive;
    onSubmit(payload);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={coupon ? (isAr ? 'تعديل الكوبون' : 'Edit coupon') : (isAr ? 'إضافة كوبون' : 'Add coupon')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'كود الكوبون' : 'Coupon code'}</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="SAVE20"
            required
            disabled={!!coupon}
          />
          {coupon && <p className="mt-1 text-xs text-slate-500">{isAr ? 'لا يمكن تغيير الكود بعد الإنشاء' : 'Code cannot be changed after creation'}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'نوع الخصم' : 'Discount type'}</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DISCOUNT_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{isAr ? o.labelAr : o.labelEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'قيمة الخصم' : 'Discount value'}</label>
            <input
              type="number"
              min="0"
              step={discountType === 'PERCENT' ? '1' : '0.01'}
              max={discountType === 'PERCENT' ? '100' : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'الحد الأدنى للطلب (اختياري)' : 'Min. order amount (optional)'}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'صالح من' : 'Valid from'}</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'صالح حتى' : 'Valid until'}</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{isAr ? 'الحد الأقصى لمرات الاستخدام (اختياري)' : 'Max uses (optional)'}</label>
          <input
            type="number"
            min="0"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={isAr ? 'غير محدود' : 'Unlimited'}
          />
        </div>
        {coupon && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">{isAr ? 'كوبون نشط' : 'Coupon active'}</span>
          </label>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            {isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
