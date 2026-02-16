import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { toast } from 'react-hot-toast';
import Modal from '../components/ui/Modal';

const STATUS_CONFIG = {
    PENDING: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, labelKey: 'autoParts.pending' },
    APPROVED: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle, labelKey: 'common.active' },
    REJECTED: { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle, labelKey: 'finance.status.CANCELLED' },
    SUSPENDED: { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: ShieldCheck, labelKey: 'finance.status.FAILED' }
};

export default function VendorOnboardingPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['vendor-onboarding', statusFilter],
        queryFn: () => vendorService.getOnboardingRequests(statusFilter),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => vendorService.updateOnboardingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['vendor-onboarding']);
            toast.success(t('common.success'));
            setIsDetailModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const filteredRequests = requests.filter(req =>
        req.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.commercialRegNo.includes(searchTerm) ||
        req.companyEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleStatusUpdate = (id, status) => {
        if (window.confirm(t('common.confirmAction'))) {
            updateStatusMutation.mutate({ id, status });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('vendors.onboardingTitle', 'Vendor Registration Requests')}</h1>
                    <p className="text-slate-500">{t('vendors.onboardingSubtitle', 'Review and manage new vendor applications')}</p>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rtl:pl-4 rtl:pr-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="size-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="ALL">{t('common.all')}</option>
                            <option value="PENDING">{t('autoParts.pending')}</option>
                            <option value="APPROVED">{t('common.active')}</option>
                            <option value="REJECTED">{t('finance.status.CANCELLED')}</option>
                        </select>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <TableSkeleton rows={5} cols={5} />
            ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                    <Building2 className="size-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{t('common.noData')}</h3>
                </div>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-start">
                                    <th className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">{t('vendors.company')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">{t('vendors.contact')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">{t('vendors.mainService')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                                    <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredRequests.map((req) => {
                                    const StatusIcon = STATUS_CONFIG[req.status]?.icon || AlertCircle;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                        <Building2 className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{req.legalName}</p>
                                                        <p className="text-xs text-slate-500">CR: {req.commercialRegNo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Mail className="size-3.5" /> {req.companyEmail}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Phone className="size-3.5" /> {req.companyPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                    {req.mainService}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CONFIG[req.status]?.color}`}>
                                                    <StatusIcon className="size-3.5" />
                                                    {t(STATUS_CONFIG[req.status]?.labelKey)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-end">
                                                <button
                                                    onClick={() => handleOpenDetails(req)}
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-indigo-500 hover:text-indigo-600 shadow-sm"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={t('vendors.requestDetails', 'Vendor Registration Details')}
                size="xl"
            >
                {selectedRequest && (
                    <div className="space-y-8">
                        {/* Header Info */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-1">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('vendors.legalName')}</span>
                                <p className="text-lg font-bold text-slate-900">{selectedRequest.legalName}</p>
                                {selectedRequest.tradeName && <p className="text-slate-500">({selectedRequest.tradeName})</p>}
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('vendors.supplierType')}</span>
                                <p className="text-lg font-semibold text-slate-700">{selectedRequest.supplierType}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('common.status')}</span>
                                <div>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${STATUS_CONFIG[selectedRequest.status]?.color}`}>
                                        {t(STATUS_CONFIG[selectedRequest.status]?.labelKey)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-2">
                            {/* Registration & Address */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                                    <MapPin className="size-5 text-indigo-500" /> {t('vendors.locationInfo', 'Registration & Location')}
                                </h3>
                                <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('vendors.crNumber')}</span>
                                        <span className="font-medium text-slate-900">{selectedRequest.commercialRegNo}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('vendors.vatNumber')}</span>
                                        <span className="font-medium text-slate-900">{selectedRequest.vatNumber || '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('vendors.address')}</span>
                                        <span className="font-medium text-slate-900 text-end">{selectedRequest.addressLine1}, {selectedRequest.city}, {selectedRequest.country}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                                    <ShieldCheck className="size-5 text-emerald-500" /> {t('vendors.contactPerson', 'Contact Person')}
                                </h3>
                                <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('common.name')}</span>
                                        <span className="font-medium text-slate-900">{selectedRequest.contactPersonName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('common.title')}</span>
                                        <span className="font-medium text-slate-900">{selectedRequest.contactPersonTitle}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('common.phone')}</span>
                                        <span className="font-medium text-slate-900">{selectedRequest.contactPersonMobile}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service & Capacity */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <h3 className="font-bold text-slate-900">{t('vendors.serviceCapacity', 'Service & Capacity')}</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Card className="bg-indigo-50/30 border-none p-4">
                                    <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">{t('vendors.mainService')}</p>
                                    <p className="font-bold text-slate-900">{selectedRequest.mainService}</p>
                                </Card>
                                <Card className="bg-emerald-50/30 border-none p-4">
                                    <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">{t('vendors.experience')}</p>
                                    <p className="font-bold text-slate-900">{selectedRequest.yearsOfExperience} {t('common.years')}</p>
                                </Card>
                                <Card className="bg-amber-50/30 border-none p-4">
                                    <p className="text-xs font-semibold text-amber-600 uppercase mb-1">{t('vendors.fleet')}</p>
                                    <p className="font-bold text-slate-900">{selectedRequest.fleetCount} {t('common.vehicles')}</p>
                                </Card>
                            </div>
                            <div className="rounded-xl border border-slate-100 p-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{t('vendors.servicesOffered')}</p>
                                <p className="text-slate-700 leading-relaxed">{selectedRequest.servicesOffered}</p>
                            </div>
                        </div>

                        {/* Capacity Bands */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-400 uppercase">{t('vendors.employeesBand')}</p>
                                <p className="text-slate-900 font-medium">{selectedRequest.employeesBand || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-400 uppercase">{t('vendors.monthlyCapacity')}</p>
                                <p className="text-slate-900 font-medium">{selectedRequest.monthlyCapacityBand || '-'}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {selectedRequest.status === 'PENDING' && (
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                                <button
                                    onClick={() => handleStatusUpdate(selectedRequest.id, 'APPROVED')}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50"
                                >
                                    <CheckCircle className="size-5" /> {t('common.approve', 'Approve Application')}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
                                >
                                    <XCircle className="size-5" /> {t('common.reject', 'Reject Application')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
