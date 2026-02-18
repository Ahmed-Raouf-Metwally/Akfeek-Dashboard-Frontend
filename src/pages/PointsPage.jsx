import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    History,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    AlertCircle,
    Settings,
    Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { walletService } from '../services/walletService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';

export default function PointsPage() {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isVendor = user?.role === 'VENDOR';
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'settings' (vendor: audit only)

    useEffect(() => {
        if (isVendor && activeTab === 'settings') setActiveTab('audit');
    }, [isVendor, activeTab]);

    // --- Audit Log State ---
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [filterUserId, setFilterUserId] = useState('');

    // Vendor: only their own points audit
    const auditUserId = isVendor ? user?.id : (filterUserId || undefined);

    // Vendor: their wallet (for points balance). Admin: points audit log.
    const { data: myWallet } = useQuery({
        queryKey: ['wallet-me'],
        queryFn: () => walletService.getMyWallet(),
        enabled: !!isVendor,
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['points-audit', page, limit, auditUserId],
        queryFn: () => walletService.getPointsAudit({ page, limit, userId: auditUserId }),
        enabled: activeTab === 'audit' && !isVendor,
        keepPreviousData: true
    });

    // --- Settings State ---
    const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['points-settings'],
        queryFn: () => walletService.getPointsSettings(),
        enabled: activeTab === 'settings'
    });

    const [pointsVal, setPointsVal] = useState('');
    const [currencyVal, setCurrencyVal] = useState('');

    useEffect(() => {
        if (settingsData) {
            setPointsVal(settingsData.points);
            setCurrencyVal(settingsData.currency);
        }
    }, [settingsData]);

    const updateSettingsMutation = useMutation({
        mutationFn: (payload) => walletService.updatePointsSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['points-settings']);
            toast.success(t('common.saved') || 'Settings saved successfully');
        },
        onError: (error) => {
            toast.error(error.message || t('common.error'));
        }
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettingsMutation.mutate({ points: Number(pointsVal), currency: Number(currencyVal) });
    };

    const isAr = i18n.language === 'ar';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('finance.pointsManagement') || 'Points Management'}</h1>
                    <p className="text-sm text-slate-500">{isVendor ? (isAr ? 'رصيد نقاط الولاء الخاص بك' : 'Your loyalty points balance') : (t('finance.pointsDesc') || 'Manage points audit logs and conversion rates')}</p>
                </div>
            </div>

            {/* Vendor: show only their points balance (no audit API) */}
            {isVendor && (
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
                            <Star className="size-8 text-amber-600 fill-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{isAr ? 'رصيد نقاط الولاء' : 'Loyalty points balance'}</p>
                            <p className="text-3xl font-bold text-slate-900">{myWallet?.pointsBalance ?? 0} {isAr ? 'نقطة' : 'pts'}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{isAr ? 'هذا الرصيد خاص بحسابك. سجل الحركات الكامل متاح للإدارة فقط.' : 'This balance is for your account. Full transaction log is available to admins only.'}</p>
                </Card>
            )}

            {/* Admin only: Tabs + Audit table + Settings */}
            {!isVendor && (
            <>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`${activeTab === 'audit'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <History className="size-4" />
                        {t('finance.auditLog') || 'Audit Log'}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`${activeTab === 'settings'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Settings className="size-4" />
                        {t('common.settings') || 'Configuration'}
                    </button>
                </nav>
            </div>

            {activeTab === 'audit' ? (
                <Card className="p-0">
                    {!isVendor && (
                        <div className="border-b border-slate-100 p-4">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={t('finance.searchUser')}
                                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={filterUserId}
                                    onChange={(e) => setFilterUserId(e.target.value)}
                                />
                                <p className="mt-1 text-xs text-slate-400">Search by User ID</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">{t('finance.user')}</th>
                                    <th className="px-6 py-4 font-medium">{t('finance.type')}</th>
                                    <th className="px-6 py-4 font-medium">{t('finance.points')}</th>
                                    <th className="px-6 py-4 font-medium">{t('common.date')}</th>
                                    <th className="px-6 py-4 font-medium">{t('common.details')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                                            <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                                        </tr>
                                    ))
                                ) : isError ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                                            <AlertCircle className="mx-auto mb-2 size-8" />
                                            {t('common.error')}
                                        </td>
                                    </tr>
                                ) : data?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <History className="mx-auto mb-2 size-8 text-slate-300" />
                                            {t('common.noData')}
                                        </td>
                                    </tr>
                                ) : (
                                    data?.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <span className="text-xs font-bold">{item.user?.email?.[0]?.toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.user?.email}</p>
                                                        <p className="text-xs text-slate-500">{item.user?.profile?.firstName} {item.user?.profile?.lastName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.type === 'EARN' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                    item.type === 'REDEEM' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                                                        'bg-slate-50 text-slate-700 ring-slate-600/20'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                <div className="flex items-center gap-1">
                                                    {item.type === 'EARN' ? <ArrowUpRight className="size-3 text-emerald-500" /> : <ArrowDownLeft className="size-3 text-amber-500" />}
                                                    {item.amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-xs">
                                                {item.referenceId && <span className="font-mono bg-slate-100 px-1 rounded mr-2">{item.referenceId}</span>}
                                                {item.performedBy ? (
                                                    <span className="bg-indigo-50 text-indigo-700 px-1 rounded mr-2">
                                                        By: {item.performedBy.profile?.firstName}
                                                    </span>
                                                ) : null}
                                                {item.description || JSON.stringify(item.metadata || {})}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {data && (
                        <div className="border-t border-slate-100 p-4">
                            <Pagination
                                currentPage={page}
                                totalPages={data?.pagination?.totalPages || 1}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </Card>
            ) : (
                <Card className="max-w-2xl p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium leading-6 text-slate-900">{t('finance.conversionRate') || 'Points Conversion Rate'}</h3>
                        <p className="mt-1 text-sm text-slate-500">Define the value of points in currency. Example: 100 Points = 1 SAR.</p>
                    </div>

                    {isLoadingSettings ? (
                        <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('finance.points') || 'Points'}</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-12 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                                            value={pointsVal}
                                            onChange={(e) => setPointsVal(e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-slate-500 sm:text-sm">PTS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 font-bold text-slate-400 text-xl">=</div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('finance.currencyAmount') || 'Currency Amount'}</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-12 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                                            value={currencyVal}
                                            onChange={(e) => setCurrencyVal(e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-slate-500 sm:text-sm">SAR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="size-4 text-indigo-500" />
                                    <span className="font-medium">Calculation Preview:</span>
                                </div>
                                <div className="mt-2 ml-6">
                                    1 Point = <span className="font-bold text-indigo-600">{pointsVal && currencyVal && Number(pointsVal) > 0 ? (Number(currencyVal) / Number(pointsVal)).toFixed(4) : '0.0000'}</span> SAR
                                </div>
                                <div className="mt-1 ml-6 text-xs text-slate-500">
                                    100 Points = {pointsVal && currencyVal && Number(pointsVal) > 0 ? ((Number(currencyVal) / Number(pointsVal)) * 100).toFixed(2) : '0.00'} SAR
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={updateSettingsMutation.isLoading}
                                    className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {updateSettingsMutation.isLoading ? t('common.saving') || 'Saving...' : t('common.saveChanges') || 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    )}
                </Card>
            )}
            </>
            )}
        </div>
    );
}
