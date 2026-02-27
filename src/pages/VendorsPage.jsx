import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useTranslation } from 'react-i18next';
import { Search, Plus, Eye, List, Filter, LayoutGrid, Trash2, Pencil } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import VendorCard from '../components/marketplace/VendorCard';
import ApprovalStatusBadge from '../components/marketplace/ApprovalStatusBadge';

const VENDOR_STATUSES = (t) => [
  { value: 'ALL', label: t('common.all') },
  { value: 'PENDING_APPROVAL', label: t('autoParts.pending') },
  { value: 'ACTIVE', label: t('brands.active') },
  { value: 'SUSPENDED', label: t('finance.status.FAILED') },
  { value: 'REJECTED', label: t('finance.status.CANCELLED') },
];

const VENDOR_TYPES = [
  { value: 'ALL', labelEn: 'All Types', labelAr: 'الكل' },
  { value: 'AUTO_PARTS', labelEn: 'Auto Parts', labelAr: 'قطع غيار' },
  { value: 'COMPREHENSIVE_CARE', labelEn: 'Comprehensive Care', labelAr: 'عناية شاملة' },
  { value: 'CERTIFIED_WORKSHOP', labelEn: 'Certified Workshop', labelAr: 'ورش معتمدة' },
  { value: 'CAR_WASH', labelEn: 'Car Wash', labelAr: 'غسيل سيارات' },
  { value: 'ADHMN_AKFEEK', labelEn: 'Adhmn Akfeek', labelAr: 'أضمن أكفيك' },
];

export default function VendorsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 12;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [vendorType, setVendorType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'table' | 'grid'

  const statuses = VENDOR_STATUSES(t);
  const isAr = i18n.language === 'ar';

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', { search, status, vendorType }],
    queryFn: () => vendorService.getVendors({
      search: search || undefined,
      status: status !== 'ALL' ? status : undefined,
      vendorType: vendorType !== 'ALL' ? vendorType : undefined
    }),
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete vendor'),
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete vendor: ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };



  const filteredVendors = vendors; // Filtering happens in API in real app, simplified here

  const { paginatedItems: paginatedVendors, totalPages, total } = useMemo(() => {
    const total = filteredVendors.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = filteredVendors.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [filteredVendors, page]);

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('vendors.title')}</h1>
          <p className="text-slate-500">{t('vendors.subtitle')}</p>
        </div>
        <Link
          to="/vendors/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {t('vendors.addVendor')}
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                placeholder={t('vendors.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rtl:pl-4 rtl:pr-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-slate-400" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                {statuses.slice(1).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={vendorType}
                onChange={(e) => { setVendorType(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {VENDOR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {isAr ? type.labelAr : type.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="size-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-2 transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="size-5" />
            </button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : paginatedVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
            <Search className="size-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{t('vendors.noVendors')}</h3>
          <p className="mt-2 text-slate-500 max-w-sm">
            {t('marketplaceOrders.noOrdersDesc')}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedVendors.map((vendor) => (
                <div key={vendor.id} className="relative group">
                  <VendorCard vendor={vendor} isArabic={i18n.language === 'ar'} />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/vendors/${vendor.id}/edit`}
                      className="inline-flex size-8 items-center justify-center rounded-lg bg-white/90 shadow-sm border border-slate-200 text-indigo-600 hover:bg-white"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vendors.business')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vendors.contact')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vendors.stats')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={vendor.logo || '/placeholder-vendor.png'} alt="" className="size-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <p className="font-medium text-slate-900">{i18n.language === 'ar' ? vendor.businessNameAr || vendor.businessName : vendor.businessName}</p>
                              <p className="text-xs text-slate-500 capitalize">{vendor.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="text-slate-900">
                              {vendor.user?.profile?.firstName} {vendor.user?.profile?.lastName}
                            </p>
                            <p className="text-slate-500">{vendor.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ApprovalStatusBadge status={vendor.status} isArabic={i18n.language === 'ar'} />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {vendor._count?.parts ?? 0} parts
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/vendors/${vendor.id}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                              title="View"
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              to={`/vendors/${vendor.id}/edit`}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-slate-50 hover:text-indigo-700"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(vendor.id, vendor.businessName)}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
