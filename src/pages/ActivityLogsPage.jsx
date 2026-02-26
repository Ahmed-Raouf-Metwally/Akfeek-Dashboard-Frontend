import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../hooks/useDateFormat';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Activity, User, CalendarCheck, FileText, Wrench, Filter,
    LogIn, Settings, Wallet, ShieldCheck, Package, Search,
    AlertTriangle, Server, Star, MessageSquare, Tag,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import Pagination from '../components/ui/Pagination';

const PAGE_SIZE = 15;

const ACTION_CONFIG = {
    USER_LOGIN:          { icon: LogIn,         color: 'bg-blue-100 text-blue-700',    label: 'تسجيل دخول'      },
    USER_LOGOUT:         { icon: LogIn,         color: 'bg-slate-100 text-slate-600',  label: 'تسجيل خروج'     },
    USER_STATUS_CHANGED: { icon: User,          color: 'bg-orange-100 text-orange-700',label: 'تغيير حالة مستخدم'},
    USER_ROLE_CHANGED:   { icon: User,          color: 'bg-purple-100 text-purple-700',label: 'تغيير صلاحية'    },
    BOOKING_CREATED:     { icon: CalendarCheck, color: 'bg-green-100 text-green-700',  label: 'حجز جديد'        },
    BOOKING_CANCELLED:   { icon: CalendarCheck, color: 'bg-red-100 text-red-700',      label: 'إلغاء حجز'       },
    INVOICE_ISSUED:      { icon: FileText,      color: 'bg-indigo-100 text-indigo-700',label: 'إصدار فاتورة'    },
    PAYMENT_RECEIVED:    { icon: Wallet,        color: 'bg-emerald-100 text-emerald-700',label:'دفعة مستلمة'    },
    WALLET_CREDIT:       { icon: Wallet,        color: 'bg-emerald-100 text-emerald-700',label:'إضافة رصيد'     },
    WALLET_DEBIT:        { icon: Wallet,        color: 'bg-red-100 text-red-700',      label: 'خصم رصيد'        },
    SERVICE_CREATED:     { icon: Wrench,        color: 'bg-cyan-100 text-cyan-700',    label: 'خدمة جديدة'      },
    SERVICE_UPDATED:     { icon: Wrench,        color: 'bg-cyan-100 text-cyan-700',    label: 'تعديل خدمة'      },
    SETTINGS_UPDATED:    { icon: Settings,      color: 'bg-slate-100 text-slate-700',  label: 'تعديل الإعدادات' },
    WORKSHOP_VERIFIED:   { icon: ShieldCheck,   color: 'bg-teal-100 text-teal-700',    label: 'اعتماد ورشة'     },
    VENDOR_APPROVED:     { icon: Package,       color: 'bg-teal-100 text-teal-700',    label: 'اعتماد فيندور'   },
    BRAND_CREATED:       { icon: Tag,           color: 'bg-violet-100 text-violet-700',label: 'ماركة جديدة'     },
    COUPON_CREATED:      { icon: Tag,           color: 'bg-pink-100 text-pink-700',    label: 'كوبون جديد'      },
    FEEDBACK_RESOLVED:   { icon: MessageSquare, color: 'bg-amber-100 text-amber-700',  label: 'شكوى محلولة'     },
    SYSTEM_BACKUP:       { icon: Server,        color: 'bg-slate-100 text-slate-600',  label: 'نسخ احتياطي'     },
    SYSTEM_STARTUP:      { icon: Server,        color: 'bg-slate-100 text-slate-600',  label: 'تشغيل النظام'    },
};

const ENTITY_COLOR = {
    User:          'bg-blue-50 text-blue-600',
    Booking:       'bg-green-50 text-green-600',
    Invoice:       'bg-indigo-50 text-indigo-600',
    Payment:       'bg-emerald-50 text-emerald-600',
    Wallet:        'bg-emerald-50 text-emerald-600',
    Service:       'bg-cyan-50 text-cyan-600',
    Workshop:      'bg-teal-50 text-teal-600',
    Vendor:        'bg-teal-50 text-teal-600',
    SystemSettings:'bg-slate-50 text-slate-600',
    System:        'bg-slate-50 text-slate-600',
    VehicleBrand:  'bg-violet-50 text-violet-600',
    Coupon:        'bg-pink-50 text-pink-600',
    Feedback:      'bg-amber-50 text-amber-600',
};

function ActionBadge({ action }) {
    const cfg = ACTION_CONFIG[action];
    if (!cfg) return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            <Activity className="size-3" />
            {action}
        </span>
    );
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
            <Icon className="size-3" />
            {cfg.label || action}
        </span>
    );
}

export default function ActivityLogsPage() {
    const { t, i18n } = useTranslation();
    const { fmtDT } = useDateFormat();
    const isAr = i18n.language === 'ar';
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['activity', page, actionFilter],
        queryFn: () => dashboardService.getActivityLogs({ page, limit: PAGE_SIZE, action: actionFilter || undefined }),
        keepPreviousData: true,
    });

    const raw = data?.data ?? data;
    const logs = raw?.data || [];
    const pagination = raw?.pagination || { total: 0, totalPages: 1 };

    const filtered = search
        ? logs.filter((l) => {
            const userName = l.user?.profile
                ? `${l.user.profile.firstName} ${l.user.profile.lastName}`.toLowerCase()
                : (l.user?.email || '').toLowerCase();
            return (
                l.action?.toLowerCase().includes(search.toLowerCase()) ||
                l.entity?.toLowerCase().includes(search.toLowerCase()) ||
                userName.includes(search.toLowerCase())
            );
        })
        : logs;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 shadow-xl">
                <div className="flex items-start gap-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                        <Activity className="size-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isAr ? 'سجل النشاط' : 'Activity Log'}
                        </h1>
                        <p className="mt-1 text-slate-300/80">
                            {isAr
                                ? 'جميع العمليات والأحداث التي تمت على النظام'
                                : 'All system operations and events'}
                        </p>
                        {pagination.total > 0 && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                                <Activity className="size-3.5" />
                                {pagination.total} {isAr ? 'حدث مسجل' : 'events logged'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        placeholder={isAr ? 'ابحث بالإجراء أو الكيان أو المستخدم...' : 'Search action, entity or user...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                    >
                        <option value="">{isAr ? 'كل الإجراءات' : 'All Actions'}</option>
                        {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-16 text-center">
                    <AlertTriangle className="mb-3 size-12 text-red-300" />
                    <p className="text-red-600">{isAr ? 'حدث خطأ في تحميل البيانات' : 'Failed to load data'}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <Activity className="mb-3 size-14 text-slate-300" />
                    <p className="text-slate-500">{isAr ? 'لا يوجد سجل نشاط' : 'No activity logs found'}</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50">
                                <tr>
                                    {[
                                        isAr ? 'الإجراء' : 'Action',
                                        isAr ? 'الكيان' : 'Entity',
                                        isAr ? 'المستخدم' : 'User',
                                        isAr ? 'التفاصيل' : 'Details',
                                        isAr ? 'الـ IP' : 'IP',
                                        isAr ? 'التوقيت' : 'Time',
                                    ].map((h, i) => (
                                        <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((log, i) => {
                                    const userName = log.user?.profile
                                        ? `${log.user.profile.firstName} ${log.user.profile.lastName || ''}`
                                        : log.user?.email || (isAr ? 'النظام' : 'System');
                                    const userRole = log.user?.role;
                                    const details = log.details
                                        ? Object.entries(log.details)
                                            .slice(0, 2)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(' | ')
                                        : '—';

                                    return (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.02 * i }}
                                            className="transition-colors hover:bg-slate-50/60"
                                        >
                                            <td className="px-4 py-3">
                                                <ActionBadge action={log.action} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${ENTITY_COLOR[log.entity] || 'bg-slate-50 text-slate-600'}`}>
                                                    {log.entity}
                                                </span>
                                                {log.entityId && (
                                                    <span className="ml-1 font-mono text-[10px] text-slate-400">
                                                        #{log.entityId.slice(0, 8)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{userName}</div>
                                                {userRole && (
                                                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{userRole}</div>
                                                )}
                                            </td>
                                            <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-500" title={details}>
                                                {details}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                                {log.ipAddress || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {log.createdAt ? fmtDT(log.createdAt) : '—'}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="border-t border-slate-100 px-4 py-3">
                            <Pagination
                                page={page}
                                totalPages={pagination.totalPages}
                                total={pagination.total}
                                pageSize={PAGE_SIZE}
                                onPageChange={setPage}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
