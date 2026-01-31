import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, LayoutGrid, List, CheckCircle, XCircle } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import AutoPartCard from '../components/marketplace/AutoPartCard';
import ApprovalStatusBadge from '../components/marketplace/ApprovalStatusBadge';
import VendorBadge from '../components/marketplace/VendorBadge';

export default function AutoPartsPage() {
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 12;
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [isApproved, setIsApproved] = useState(''); // ''=all, 'true'=approved, 'false'=pending

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => autoPartCategoryService.getCategoryTree(),
    staleTime: 600_000,
  });

  // Flat category list for dropdown (simplification)
  const flatCategories = useMemo(() => {
     // A simple flatten if needed, or just use top level
     return categories;
  }, [categories]);

  // Fetch Parts
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['auto-parts', { search, categoryId, isApproved }],
    queryFn: () => autoPartService.getAutoParts({ 
      search: search || undefined, 
      category: categoryId || undefined,
      isApproved: isApproved === '' ? undefined : isApproved === 'true'
    }),
    staleTime: 60_000,
  });

  const updateApprovalMutation = useMutation({
    mutationFn: ({ id, isApproved }) => autoPartService.updatePartApproval(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-parts'] });
      toast.success('Part approval status updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update part'),
  });

  const { paginatedItems: paginatedParts, totalPages, total } = useMemo(() => {
    const total = parts.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = parts.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [parts, page]);

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auto Parts</h1>
          <p className="text-slate-500">Manage catalog and vendor part approvals</p>
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
            to="/auto-parts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            <Plus className="size-4" /> Add Part
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search parts (SKU, Name)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px]"
            >
              <option value="">All Categories</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={isApproved}
              onChange={(e) => setIsApproved(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {paginatedParts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">No parts found.</div>
             ) : (
                paginatedParts.map((part, i) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <AutoPartCard part={part} />
                  </motion.div>
                ))
             )}
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">SKU / Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Price/Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Vendor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {paginatedParts.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No parts found.</td></tr>
                 ) : (
                    paginatedParts.map(part => (
                      <tr key={part.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {part.images?.[0] ? (
                               <img src={part.images[0].url} className="size-10 rounded object-cover bg-slate-100" />
                            ) : (
                               <div className="size-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-bold">?</div>
                            )}
                            <div>
                               <div className="font-medium text-slate-900 line-clamp-1">{part.name}</div>
                               <div className="text-xs text-slate-500">{!part.isApproved && <span className="text-amber-600 font-medium">Pending Approval</span>}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                           <div className="font-mono text-xs">{part.sku}</div>
                           <div>{part.brand}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                           {part.category?.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                           <div className="font-semibold">{parseFloat(part.price).toFixed(2)} SAR</div>
                           <div className={`text-xs ${part.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>Stock: {part.stockQuantity}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                           <VendorBadge vendor={part.vendor} />
                        </td>
                        <td className="px-4 py-3 text-right">
                           <div className="flex items-center justify-end gap-2">
                              {!part.isApproved && (
                                <button
                                  onClick={async () => {
                                      const ok = await openConfirm({
                                          title: 'Approve Part',
                                          message: `Approve "${part.name}" for listing?`,
                                          confirmLabel: 'Approve',
                                          variant: 'primary'
                                      });
                                      if (ok) updateApprovalMutation.mutate({ id: part.id, isApproved: true });
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Approve"
                                >
                                  <CheckCircle className="size-5" />
                                </button>
                              )}
                              <Link to={`/auto-parts/${part.id}`} className="p-1 text-slate-500 hover:bg-slate-100 rounded">
                                 <List className="size-5" />
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
