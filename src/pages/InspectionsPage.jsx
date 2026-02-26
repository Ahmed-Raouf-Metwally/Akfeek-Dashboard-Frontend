import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    ClipboardCheck, Search, AlertTriangle, CheckCircle2, Clock,
    ChevronDown, ChevronUp, Wrench, Car, User, DollarSign, Eye,
} from 'lucide-react';
import inspectionService from '../services/inspectionService';
import Pagination from '../components/ui/Pagination';

const STATUS_CONFIG = {
    PENDING:   { label: 'Pending',   labelAr: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    COMPLETED: { label: 'Completed', labelAr: 'مكتمل',        color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
    APPROVED:  { label: 'Approved',  labelAr: 'موافق عليه',   color: 'bg-blue-100 text-blue-700',   icon: CheckCircle2 },
    REJECTED:  { label: 'Rejected',  labelAr: 'مرفوض',        color: 'bg-red-100 text-red-700',     icon: AlertTriangle },
};

const SEVERITY_COLOR = {
    LOW:      'bg-green-100 text-green-700',
    MEDIUM:   'bg-yellow-100 text-yellow-700',
    HIGH:     'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
            <Icon className="size-3" />
            {cfg.label}
        </span>
    );
}

function InspectionRow({ report, isAr }) {
    const [expanded, setExpanded] = useState(false);
    const technician = report.technician;
    const techName = technician?.profile
        ? `${technician.profile.firstName} ${technician.profile.lastName}`
        : technician?.email || '—';
    const booking = report.booking;
    const vehicle = booking?.vehicle;
    const vehicleName = vehicle?.vehicleModel
        ? `${vehicle.vehicleModel.name} (${vehicle.year || ''})`
        : '—';

    return (
        <>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                    <div className="font-mono text-sm font-medium text-slate-800">
                        #{booking?.bookingNumber || report.id.slice(0, 8)}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Car className="size-4 text-slate-400" />
                        {vehicleName}
                    </div>
                    {vehicle?.plateNumber && (
                        <div className="mt-0.5 text-xs text-slate-400">{vehicle.plateNumber}</div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <User className="size-4 text-slate-400" />
                        {techName}
                    </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                    {report.overallCondition || '—'}
                </td>
                <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        <DollarSign className="size-3.5 text-slate-400" />
                        {report.estimatedCost ? Number(report.estimatedCost).toLocaleString() + ' SAR' : '—'}
                    </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-4 py-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                        <Eye className="size-3.5" />
                        {isAr ? 'تفاصيل' : 'Details'}
                        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50">
                    <td colSpan={8} className="px-4 pb-4 pt-2">
                        <div className="space-y-3">
                            {report.notes && (
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">{isAr ? 'الملاحظات:' : 'Notes:'}</span> {report.notes}
                                </p>
                            )}
                            {report.items && report.items.length > 0 ? (
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {isAr ? 'بنود الفحص' : 'Inspection Items'} ({report.items.length})
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {report.items.map((item) => (
                                            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-800">{item.category}</span>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_COLOR[item.severity] || 'bg-slate-100 text-slate-600'}`}>
                                                        {item.severity}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-slate-600">{item.issue}</p>
                                                {item.estimatedCost > 0 && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {isAr ? 'التكلفة:' : 'Cost:'} {Number(item.estimatedCost).toLocaleString()} SAR
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    {isAr ? 'لا توجد بنود فحص' : 'No inspection items recorded'}
                                </p>
                            )}
                            {report.customerResponse && (
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">{isAr ? 'رد العميل:' : 'Customer Response:'}</span>{' '}
                                    <span className={report.customerResponse === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                                        {report.customerResponse}
                                    </span>
                                    {report.customerComment && ` — "${report.customerComment}"`}
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function InspectionsPage() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const PAGE_SIZE = 15;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['inspections', page, statusFilter],
        queryFn: () => inspectionService.getInspections({
            page,
            limit: PAGE_SIZE,
            ...(statusFilter ? { status: statusFilter } : {}),
        }),
        keepPreviousData: true,
    });

    const reports = data?.data || [];
    const pagination = data?.pagination || {};

    const filtered = search
        ? reports.filter((r) => {
            const bnum = r.booking?.bookingNumber?.toLowerCase() || '';
            const techName = r.technician?.profile
                ? `${r.technician.profile.firstName} ${r.technician.profile.lastName}`.toLowerCase()
                : '';
            return bnum.includes(search.toLowerCase()) || techName.includes(search.toLowerCase());
        })
        : reports;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 p-8 shadow-xl shadow-violet-500/20">
                <div className="flex items-start gap-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <ClipboardCheck className="size-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isAr ? 'تقارير الفحص' : 'Inspection Reports'}
                        </h1>
                        <p className="mt-1 text-violet-100/80">
                            {isAr
                                ? 'عرض وإدارة جميع تقارير فحص المركبات'
                                : 'View and manage all vehicle inspection reports'}
                        </p>
                        {pagination.total !== undefined && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                                <Wrench className="size-3.5" />
                                {pagination.total} {isAr ? 'تقرير' : 'reports'}
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
                        placeholder={isAr ? 'ابحث برقم الحجز أو الفني...' : 'Search by booking number or technician...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                    <option value="">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{isAr ? cfg.labelAr : cfg.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
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
                    <ClipboardCheck className="mb-3 size-14 text-slate-300" />
                    <p className="text-slate-500">{isAr ? 'لا توجد تقارير فحص' : 'No inspection reports found'}</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50">
                                <tr>
                                    {[
                                        isAr ? 'رقم الحجز' : 'Booking',
                                        isAr ? 'المركبة' : 'Vehicle',
                                        isAr ? 'الفني' : 'Technician',
                                        isAr ? 'الحالة العامة' : 'Condition',
                                        isAr ? 'الحالة' : 'Status',
                                        isAr ? 'التكلفة' : 'Est. Cost',
                                        isAr ? 'التاريخ' : 'Date',
                                        '',
                                    ].map((h, i) => (
                                        <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((report) => (
                                    <InspectionRow key={report.id} report={report} isAr={isAr} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Pagination
                page={page}
                totalPages={pagination.totalPages || 1}
                total={pagination.total || 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                disabled={isLoading}
            />
        </div>
    );
}
