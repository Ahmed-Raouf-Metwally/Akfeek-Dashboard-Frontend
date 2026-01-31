import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, Ban, CheckCircle, LayoutGrid, List, Filter } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import VendorCard from '../components/marketplace/VendorCard';
import ApprovalStatusBadge from '../components/marketplace/ApprovalStatusBadge';

const VENDOR_STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function VendorsPage() {
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 12;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'table' | 'grid'

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', { search, status }],
    queryFn: () => vendorService.getVendors({ 
      search: search || undefined, 
      status: status !== 'ALL' ? status : undefined 
    }),
    staleTime: 60_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => vendorService.updateVendorStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor status updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update vendor status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete vendor'),
  });

  const handleStatusChange = async (vendor, newStatus) => {
    const ok = await openConfirm({
      title: 'Update Vendor Status',
      message: `Change status of "${vendor.businessName}" to ${newStatus}?`,
      confirmLabel: 'Update',
      variant: newStatus === 'REJECTED' || newStatus === 'SUSPENDED' ? 'danger' : 'primary',
    });
    if (ok) updateStatusMutation.mutate({ id: vendor.id, status: newStatus });
  };

  const { paginatedItems: paginatedVendors, totalPages, total } = useMemo(() => {
    const total = vendors.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = vendors.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [vendors, page]);

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500">Manage auto parts vendors and approvals</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
             <button
               type="button"
               onClick={() => setViewMode('table')}
               className={`rounded-md p-2 transition-colors ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               <List className="size-4" />
             </button>
             <button
               type="button"
               onClick={() => setViewMode('grid')}
               className={`rounded-md p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               <LayoutGrid className="size-4" />
             </button>
           </div>
          <Link
            to="/vendors/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            <Plus className="size-4" /> Add Vendor
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-500" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {VENDOR_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={4} />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {paginatedVendors.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">No vendors found.</div>
             ) : (
                paginatedVendors.map((vendor, i) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <VendorCard vendor={vendor} />
                  </motion.div>
                ))
             )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Stats</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">No vendors found.</td>
                  </tr>
                ) : (
                  paginatedVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                            {vendor.logo ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" /> : vendor.businessName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{vendor.businessName}</div>
                            <div className="text-xs text-slate-500">{vendor.businessNameAr}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div>{vendor.contactEmail}</div>
                        <div className="text-xs text-slate-400">{vendor.contactPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <ApprovalStatusBadge status={vendor.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div>{vendor._count?.parts || 0} Parts</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {vendor.status === 'PENDING_APPROVAL' && (
                             <button
                               onClick={() => handleStatusChange(vendor, 'ACTIVE')}
                               className="p-1 text-green-600 hover:bg-green-50 rounded"
                               title="Approve"
                             >
                               <CheckCircle className="size-5" />
                             </button>
                           )}
                           {vendor.status === 'ACTIVE' && (
                             <button
                               onClick={() => handleStatusChange(vendor, 'SUSPENDED')}
                               className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                               title="Suspend"
                             >
                               <Ban className="size-5" />
                             </button>
                           )}
                           <Link to={`/vendors/${vendor.id}`} className="p-1 text-slate-500 hover:bg-slate-100 rounded" title="View Details">
                             <Eye className="size-5" />
                           </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
           <div className="border-t border-slate-200 px-4 py-3">
             <Pagination
               page={page}
               totalPages={totalPages}
               total={total}
               pageSize={PAGE_SIZE}
               onPageChange={setPage}
               disabled={isLoading}
             />
           </div>
        )}
      </Card>
    </div>
  );
}
