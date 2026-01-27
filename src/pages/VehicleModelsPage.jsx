import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, MoreHorizontal, Eye, Pencil } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { modelService } from '../services/modelService';
import { brandService } from '../services/brandService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import DetailModal from '../components/ui/DetailModal';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const SIZES = [
  { value: '', label: 'All sizes' },
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' },
  { value: 'EXTRA_LARGE', label: 'Extra large' },
];

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

function ModelRow({ model, onView, onEdit, onDelete, openConfirm }) {
  const brandName = model.brand?.name ?? '—';

  const handleDelete = async () => {
    const ok = await openConfirm({
      title: 'Deactivate model?',
      message: `"${brandName} ${model.name}" (${model.year}) will be deactivated.`,
      confirmLabel: 'Deactivate',
      variant: 'danger',
    });
    if (ok) await onDelete(model.id);
  };

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{model.brand?.name ?? '—'}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{model.name}</p>
        {model.nameAr && <p className="text-sm text-slate-500">{model.nameAr}</p>}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{model.year}</td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {model.size ?? model.type ?? '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={
            model.isActive
              ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
          }
        >
          {model.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="w-14 px-4 py-3">
        <Menu as="div" className="relative">
          <MenuButton
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Actions"
          >
            <MoreHorizontal className="size-5" />
          </MenuButton>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 top-full z-50 mt-1 w-48 origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => onView?.(model.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-slate-50' : ''} text-slate-700`}
                  >
                    <Eye className="size-4" /> View
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => onEdit?.(model)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-slate-50' : ''} text-slate-700`}
                  >
                    <Pencil className="size-4" /> Edit
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-red-50' : ''} text-red-600`}
                  >
                    <Trash2 className="size-4" /> Deactivate
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </td>
    </tr>
  );
}

const emptyModelForm = () => ({
  brandId: '',
  name: '',
  nameAr: '',
  year: new Date().getFullYear(),
  size: 'MEDIUM',
});

export default function VehicleModelsPage() {
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [brandId, setBrandId] = useState('');
  const [year, setYear] = useState('');
  const [size, setSize] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyModelForm());
  const [viewModelId, setViewModelId] = useState(null);
  const [editModel, setEditModel] = useState(null);
  const [editForm, setEditForm] = useState(emptyModelForm());

  const { data: brandsData } = useQuery({ queryKey: ['brands', false], queryFn: () => brandService.getBrands({ activeOnly: false }), staleTime: 60_000 });
  const brands = brandsData?.brands ?? [];

  useEffect(() => setPage(1), [brandId, year, size]);

  const { data, isLoading } = useQuery({
    queryKey: ['models', { brandId, year, size }],
    queryFn: () => modelService.getModels({ brandId: brandId || undefined, year: year || undefined, size: size || undefined, activeOnly: 'false' }),
    staleTime: 60_000,
  });

  const { data: viewModel, isLoading: viewLoading } = useQuery({
    queryKey: ['model', viewModelId],
    queryFn: () => modelService.getModelById(viewModelId),
    enabled: !!viewModelId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => modelService.createModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success('Model created');
      setShowAdd(false);
      setAddForm(emptyModelForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to create model'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => modelService.updateModel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['model', editModel?.id] });
      toast.success('Model updated');
      setEditModel(null);
      setEditForm(emptyModelForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to update model'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => modelService.deleteModel(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success('Model deactivated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to deactivate model'),
  });

  const models = data?.models ?? [];
  const { paginatedItems: paginatedModels, totalPages, total } = useMemo(() => {
    const total = models.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = models.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [models, page]);

  const openEdit = (m) => {
    setEditModel(m);
    setEditForm({
      brandId: m.brandId ?? m.brand?.id ?? '',
      name: m.name ?? '',
      nameAr: m.nameAr ?? '',
      year: m.year ?? new Date().getFullYear(),
      size: m.size ?? m.type ?? 'MEDIUM',
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModel || !editForm.brandId || !editForm.name.trim() || !editForm.year || !editForm.size) {
      toast.error('Fill brand, name, year and size');
      return;
    }
    const payload = {
      brandId: editForm.brandId,
      name: editForm.name.trim(),
      nameAr: editForm.nameAr.trim() || undefined,
      year: Number(editForm.year),
      size: editForm.size,
    };
    updateMutation.mutate({ id: editModel.id, payload });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.brandId || !addForm.name.trim() || !addForm.year || !addForm.size) {
      toast.error('Fill brand, name, year and size');
      return;
    }
    createMutation.mutate({
      brandId: addForm.brandId,
      name: addForm.name.trim(),
      nameAr: addForm.nameAr || undefined,
      year: Number(addForm.year),
      size: addForm.size,
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <DetailModal title="Model details" open={!!viewModelId} onClose={() => setViewModelId(null)}>
        {viewLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : viewModel ? (
          <>
            <DetailRow label="Brand" value={viewModel.brand?.name ?? viewModel.brandId} />
            <DetailRow label="Name" value={viewModel.name} />
            <DetailRow label="Name (Ar)" value={viewModel.nameAr} />
            <DetailRow label="Year" value={viewModel.year} />
            <DetailRow label="Size / Type" value={viewModel.size ?? viewModel.type} />
            <DetailRow label="Status" value={viewModel.isActive !== false ? 'Active' : 'Inactive'} />
          </>
        ) : (
          <p className="text-sm text-slate-500">Model not found.</p>
        )}
      </DetailModal>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div />
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Add model
        </button>
      </div>

      {showAdd && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">New model</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={addForm.brandId}
                onChange={(e) => setAddForm((f) => ({ ...f, brandId: e.target.value }))}
                required
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Input label="Name" name="name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Camry" className="min-w-[140px] flex-1" />
            <Input label="Name (Ar)" name="nameAr" value={addForm.nameAr} onChange={(e) => setAddForm((f) => ({ ...f, nameAr: e.target.value }))} placeholder="كامري" className="min-w-[140px] flex-1" />
            <div className="min-w-[100px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={addForm.year}
                onChange={(e) => setAddForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">Size</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={addForm.size}
                onChange={(e) => setAddForm((f) => ({ ...f, size: e.target.value }))}
              >
                {SIZES.filter((s) => s.value).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {editModel && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Edit model</h3>
          <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={editForm.brandId}
                onChange={(e) => setEditForm((f) => ({ ...f, brandId: e.target.value }))}
                required
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Input label="Name" name="name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Camry" className="min-w-[140px] flex-1" required />
            <Input label="Name (Ar)" name="nameAr" value={editForm.nameAr} onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))} placeholder="كامري" className="min-w-[140px] flex-1" />
            <div className="min-w-[100px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={editForm.year}
                onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">Size</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={editForm.size}
                onChange={(e) => setEditForm((f) => ({ ...f, size: e.target.value }))}
              >
                {SIZES.filter((s) => s.value).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setEditModel(null); setEditForm(emptyModelForm()); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-4">
          <div className="min-w-[180px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
            <input
              type="number"
              placeholder="Year"
              min="2000"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="min-w-[140px] self-end">
            <label className="mb-1 block text-sm font-medium text-slate-700">Size</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {SIZES.map((s) => (
                <option key={s.value || 'all'} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    <th className="w-14 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedModels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">No models found.</td>
                    </tr>
                  ) : (
                    paginatedModels.map((m) => (
                      <ModelRow
                        key={m.id}
                        model={m}
                        onView={setViewModelId}
                        onEdit={openEdit}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                        openConfirm={openConfirm}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} disabled={isLoading} />
          </>
        )}
      </Card>
    </div>
  );
}
