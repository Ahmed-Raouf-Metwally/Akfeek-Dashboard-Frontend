import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    History,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { walletService } from '../services/walletService';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import ImageOrPlaceholder from '../components/ui/ImageOrPlaceholder';

export default function PointsPage() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [filterUserId, setFilterUserId] = useState('');

    // Fetch points audit log
    const { data, isLoading, isError } = useQuery({
        queryKey: ['points-audit', page, limit, filterUserId],
        queryFn: () => walletService.getPointsAudit({ page, limit, userId: filterUserId || undefined }),
        keepPreviousData: true
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('finance.pointsAudit')}</h1>
                    <p className="text-sm text-slate-500">{t('finance.pointsAuditDesc')}</p>
                </div>
            </div>

            <Card className="p-0">
                <div className="border-b border-slate-100 p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('finance.searchUser')}
                            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={filterUserId} // Note: This should ideally be a search input that resolves to a User ID, but for now we might need to search by ID directly or implement a user search dropdown. 
                            // Since the API expects userId, and we don't have a user search by name that returns ID here easily without a combobox, let's assume for this MVP the user might paste an ID or we keep it simple. 
                            // Actually, looking at `walletService`, it seems `getPointsAudit` passes `userId`. 
                            // To make it user friendly, we probably need a user picker. 
                            // For now, let's just leave it as an ID input or remove if too complex for this step. 
                            // Better: Just show the list.
                            onChange={(e) => setFilterUserId(e.target.value)}
                        />
                        {/* Helper text */}
                        <p className="mt-1 text-xs text-slate-400">Search by User ID (exact match)</p>
                    </div>
                </div>

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
                                            {JSON.stringify(item.metadata || {})}
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
                            totalPages={data.pagination.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
