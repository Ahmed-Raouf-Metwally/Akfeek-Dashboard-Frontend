import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import { brandService } from '../services/brandService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

function BrandRow({ brand, onEdit, onDelete, openConfirm }) {
  const modelCount = brand._count?.models ?? 0;

  const handleDelete = async () => {
    const ok = await openConfirm({
      title: 'Deactivate brand?',
      message: `"${brand.name}" will be deactivated. ${modelCount ? `It has ${modelCount} model(s).` : ''}`,
      confirmLabel: 'Deactivate',
      variant: 'danger',
    });
    if (ok) await onDelete(brand.id);
  };

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageOrPlaceholder
            src={brand.logo}
            alt={brand.name}
            className="size-12 shrink-0"
            aspect="square"
          />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{brand.name}</p>
            {brand.nameAr && <p className="text-sm text-slate-500">{brand.nameAr}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{brand._count?.models ?? 0}</td>
      <td className="px-4 py-3">
        <span
          className={
            brand.isActive
              ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
          }
        >
          {brand.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            to={`/brands/${brand.id}`}
            className={iconBtn}
            title="View full details"
            aria-label="View full details"
          >
            <Eye className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(brand)}
            className={iconBtn}
            title="Edit"
            aria-label="Edit"
          >
            <Pencil className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
            title="Deactivate"
            aria-label="Deactivate"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

const emptyBrandForm = () => ({ name: '', nameAr: '', logo: '', isActive: true });

export default function BrandsPage() {
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyBrandForm());
  const [editBrand, setEditBrand] = useState(null);
  const [editForm, setEditForm] = useState(emptyBrandForm());

  useEffect(() => setPage(1), [activeOnly]);

  const { data, isLoading } = useQuery({
    queryKey: ['brands', activeOnly],
    queryFn: () => brandService.getBrands({ activeOnly }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => brandService.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created');
      setShowAdd(false);
      setAddForm(emptyBrandForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to create brand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => brandService.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', editBrand?.id] });
      toast.success('Brand updated');
      setEditBrand(null);
      setEditForm(emptyBrandForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to update brand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => brandService.deleteBrand(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deactivated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to deactivate brand'),
  });

  const brands = data?.brands ?? [];
  const { paginatedItems: paginatedBrands, totalPages, total } = useMemo(() => {
    const total = brands.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = brands.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [brands, page]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    createMutation.mutate({
      name: addForm.name.trim(),
      nameAr: addForm.nameAr || undefined,
      logo: addForm.logo || undefined,
    });
  };

  const openEdit = (b) => {
    setEditBrand(b);
    setEditForm({
      name: b.name ?? '',
      nameAr: b.nameAr ?? '',
      logo: b.logo ?? '',
      isActive: b.isActive !== false,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editBrand || !editForm.name.trim()) return;
    updateMutation.mutate({
      id: editBrand.id,
      payload: {
        name: editForm.name.trim(),
        nameAr: editForm.nameAr.trim() || undefined,
        logo: editForm.logo.trim() || undefined,
        isActive: editForm.isActive,
      },
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div />
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Add brand
        </button>
      </div>

      {showAdd && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">New brand</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4">
            <Input
              label="Name"
              name="name"
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Toyota"
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Name (Ar)"
              name="nameAr"
              value={addForm.nameAr}
              onChange={(e) => setAddForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تويوتا"
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Logo URL"
              name="logo"
              value={addForm.logo}
              onChange={(e) => setAddForm((f) => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
            <div className="flex w-full gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {editBrand && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Edit brand</h3>
          <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-4">
            <Input
              label="Name"
              name="name"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Toyota"
              required
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Name (Ar)"
              name="nameAr"
              value={editForm.nameAr}
              onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تويوتا"
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Logo URL"
              name="logo"
              value={editForm.logo}
              onChange={(e) => setEditForm((f) => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
            <div className="flex w-full gap-3 pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditBrand(null); setEditForm(emptyBrandForm()); }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">Active only</span>
          </label>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Models
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                        No brands found.
                      </td>
                    </tr>
                  ) : (
                    paginatedBrands.map((b) => (
                      <BrandRow
                        key={b.id}
                        brand={b}
                        onEdit={openEdit}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                        openConfirm={openConfirm}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              disabled={isLoading}
            />
          </>
        )}
      </Card>
    </div>
  );
}
