import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { Search, Plus, Eye, List, Filter, LayoutGrid } from 'lucide-react';
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
  { value: 'SUSPENDED', label: t('finance.status.FAILED') }, // Using FAILED as Suspended approximation or add new key
  { value: 'REJECTED', label: t('finance.status.CANCELLED') },
];

export default function VendorsPage() {
  const { t } = useTranslation();
  const PAGE_SIZE = 12;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'table' | 'grid'

  const statuses = VENDOR_STATUSES(t);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', { search, status }],
    queryFn: () => vendorService.getVendors({ 
      search: search || undefined, 
      status: status !== 'ALL' ? status : undefined 
    }),
    staleTime: 60_000,
  });



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
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
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
                <VendorCard key={vendor.id} vendor={vendor} />
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
                              <p className="font-medium text-slate-900">{vendor.businessName}</p>
                              <p className="text-xs text-slate-500">{vendor.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="text-slate-900">{vendor.u_firstName} {vendor.u_lastName}</p>
                            <p className="text-slate-500">{vendor.u_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ApprovalStatusBadge status={vendor.approvalStatus} />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {vendor._count?.parts ?? 0} parts
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/vendors/${vendor.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Eye className="size-4" />
                          </Link>
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
