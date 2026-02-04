import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import { modelService } from '../services/modelService';
import { brandService } from '../services/brandService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

function ModelRow({ model, onEdit, onDelete, openConfirm, t }) {
  const brandName = model.brand?.name ?? '—';

  const handleDelete = async () => {
    const ok = await openConfirm({
      title: t('models.confirmDeactivate'),
      message: t('models.deactivateMessage'),
      confirmLabel: t('brands.deactivate'),
      variant: 'danger',
    });
    if (ok) await onDelete(model.id);
  };

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageOrPlaceholder
            src={model.imageUrl || model.brand?.logo}
            alt={model.name}
            className="size-12 shrink-0"
            aspect="square"
          />
          <p className="font-medium text-slate-900">{model.brand?.name ?? '—'}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{model.name}</p>
        {model.nameAr && <p className="text-sm text-slate-500">{model.nameAr}</p>}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{model.year}</td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {t(`models.sizes.${model.size}`) || model.size || model.type || '—'}
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
          {model.isActive ? t('brands.active') : t('brands.inactive')}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            to={`/models/${model.id}`}
            className={iconBtn}
            title={t('common.viewDetails')}
            aria-label={t('common.viewDetails')}
          >
            <Eye className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(model)}
            className={iconBtn}
            title={t('common.edit')}
            aria-label={t('common.edit')}
          >
            <Pencil className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
            title={t('common.delete')}
            aria-label={t('common.delete')}
          >
            <Trash2 className="size-5" />
          </button>
        </div>
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
  const { t } = useTranslation();
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [brandId, setBrandId] = useState('');
  const [year, setYear] = useState('');
  const [size, setSize] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyModelForm());
  const [editModel, setEditModel] = useState(null);
  const [editForm, setEditForm] = useState(emptyModelForm());

  const SIZES = [
    { value: '', label: t('common.all') },
    { value: 'SMALL', label: t('models.sizes.SMALL') },
    { value: 'MEDIUM', label: t('models.sizes.MEDIUM') },
    { value: 'LARGE', label: t('models.sizes.LARGE') },
    { value: 'EXTRA_LARGE', label: t('models.sizes.EXTRA_LARGE') },
  ];

  const { data: brandsData } = useQuery({ queryKey: ['brands', false], queryFn: () => brandService.getBrands({ activeOnly: false }), staleTime: 60_000 });
  const brands = brandsData?.brands ?? [];

  useEffect(() => setPage(1), [brandId, year, size]);

  const { data, isLoading } = useQuery({
    queryKey: ['models', { brandId, year, size }],
    queryFn: () => modelService.getModels({ brandId: brandId || undefined, year: year || undefined, size: size || undefined, activeOnly: 'false' }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => modelService.createModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success(t('models.created'));
      setShowAdd(false);
      setAddForm(emptyModelForm());
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => modelService.updateModel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['model', editModel?.id] });
      toast.success(t('models.updated'));
      setEditModel(null);
      setEditForm(emptyModelForm());
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => modelService.deleteModel(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success(t('models.deactivated'));
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
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
      toast.error(t('validation.required'));
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
      toast.error(t('validation.required'));
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div />
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {t('models.addModel')}
        </button>
      </div>

      {showAdd && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('models.newModel')}</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.brand')}</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={addForm.brandId}
                onChange={(e) => setAddForm((f) => ({ ...f, brandId: e.target.value }))}
                required
              >
                <option value="">{t('models.selectBrand')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Input label={t('models.modelName')} name="name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Camry" className="min-w-[140px] flex-1" />
            <Input label={t('models.modelNameAr')} name="nameAr" value={addForm.nameAr} onChange={(e) => setAddForm((f) => ({ ...f, nameAr: e.target.value }))} placeholder="كامري" className="min-w-[140px] flex-1" />
            <div className="min-w-[100px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.year')}</label>
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
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.size')}</label>
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
                {createMutation.isPending ? t('common.creating') : t('common.create')}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </Card>
      )}

      {editModel && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('models.editModel')}</h3>
          <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.brand')}</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={editForm.brandId}
                onChange={(e) => setEditForm((f) => ({ ...f, brandId: e.target.value }))}
                required
              >
                <option value="">{t('models.selectBrand')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Input label={t('models.modelName')} name="name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Camry" className="min-w-[140px] flex-1" required />
            <Input label={t('models.modelNameAr')} name="nameAr" value={editForm.nameAr} onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))} placeholder="كامري" className="min-w-[140px] flex-1" />
            <div className="min-w-[100px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.year')}</label>
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
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.size')}</label>
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
                {updateMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
              <button type="button" onClick={() => { setEditModel(null); setEditForm(emptyModelForm()); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-4">
          <div className="min-w-[180px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.brand')}</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.year')}</label>
            <input
              type="number"
              placeholder={t('models.year')}
              min="2000"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="min-w-[140px] self-end">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('models.size')}</label>
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
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.brand')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('models.model')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('models.year')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('models.size')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                    <th className="w-32 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedModels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">{t('models.noModels')}</td>
                    </tr>
                  ) : (
                    paginatedModels.map((m) => (
                      <ModelRow
                        key={m.id}
                        model={m}
                        onEdit={openEdit}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                        openConfirm={openConfirm}
                        t={t}
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
