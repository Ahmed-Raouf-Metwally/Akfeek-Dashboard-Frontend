import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Tag, Search, ArrowLeft, Building2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
    const { t, i18n } = useTranslation();
    const { fmt } = useDateFormat();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: coupons = [], isLoading, isError, error } = useQuery({
        queryKey: ['admin-all-coupons', searchTerm],
        queryFn: () => vendorService.getAllCoupons({ search: searchTerm }),
        staleTime: 30_000,
    });

    const isAr = i18n.language === 'ar';
    const isAdmin = user?.role === 'ADMIN';

    if (!isAdmin) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-slate-600">
                        {isAr ? 'هذه الصفحة متاحة للمسؤولين فقط.' : 'This page is only available for administrators.'}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isAr ? 'إدارة جميع الكوبونات' : 'Manage All Coupons'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isAr ? 'عرض ومراقبة كافة الكوبونات في النظام' : 'View and monitor all coupons in the system'}
                        </p>
                    </div>
                </div>

                <div className="relative w-full max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                        <Search className="size-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 ps-10 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={isAr ? 'بحث عن كود أو مورد...' : 'Search code or vendor...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden p-0 shadow-sm">
                {isLoading ? (
                    <TableSkeleton rows={8} cols={7} />
                ) : coupons.length === 0 ? (
                    <div className="p-12 text-center">
                        <Tag className="mx-auto size-12 text-slate-300" />
                        <p className="mt-2 text-slate-600">{isAr ? 'لا توجد كوبونات مطابقة لبحثك.' : 'No coupons match your search.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm text-start">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الكود' : 'Code'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'المورد' : 'Vendor'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الخصم' : 'Discount'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الحد الأدنى' : 'Min. Order'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الصلاحية' : 'Validity'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الاستخدام' : 'Usage'}</th>
                                    <th className="px-6 py-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-indigo-600">{c.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="size-4 text-slate-400" />
                                                <span className="font-medium text-slate-900">
                                                    {isAr ? (c.vendor?.businessNameAr || c.vendor?.businessName) : (c.vendor?.businessName || c.vendor?.businessNameAr)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                                {c.discountType === 'PERCENT' ? `${Number(c.discountValue)}%` : `${Number(c.discountValue)} SAR`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {c.minOrderAmount != null ? `${Number(c.minOrderAmount)} SAR` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                                <span>{isAr ? 'من:' : 'From:'} {fmt(c.validFrom)}</span>
                                                <span>{isAr ? 'إلى:' : 'To:'} {fmt(c.validUntil)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{c.usedCount}</span>
                                                {c.maxUses != null && (
                                                    <span className="text-slate-400">/ {c.maxUses}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.isActive ? (
                                                <div className="flex items-center gap-1 text-emerald-600">
                                                    <CheckCircle2 className="size-4" />
                                                    <span className="text-xs font-medium">{isAr ? 'نشط' : 'Active'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <XCircle className="size-4" />
                                                    <span className="text-xs font-medium">{isAr ? 'معطل' : 'Inactive'}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
