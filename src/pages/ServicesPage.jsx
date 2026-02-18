import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Pencil, Trash2, Eye, LayoutGrid, List } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

const emptyForm = () => ({
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  type: 'FIXED',
  category: 'CLEANING',
  estimatedDuration: 30,
  imageUrl: '',
  icon: '',
  parentServiceId: '',
});

function ServiceRow({ service, onEdit, onDelete, openConfirm, t }) {
  const handleDelete = async () => {
    const ok = await openConfirm({
      title: t('services.deleteService', 'Delete service'),
      message: t('common.confirmDelete', { name: service.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) await onDelete(service.id);
  };

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageOrPlaceholder
            src={service.imageUrl || service.icon}
            alt={service.name}
            className="size-12 shrink-0"
            aspect="square"
          />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{service.name}</p>
            {service.nameAr && <p className="text-sm text-slate-500">{service.nameAr}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {t(`services.categories.${service.category}`) || service.category || '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
           {t(`services.types.${service.type}`) || service.type || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {service.estimatedDuration ? `${service.estimatedDuration} min` : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            to={`/services/${service.id}`}
            className={iconBtn}
            title={t('common.viewDetails')}
            aria-label={t('common.viewDetails')}
          >
            <Eye className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(service)}
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

export default function ServicesPage() {
  const { t } = useTranslation();
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') || '';

  const [typeFilter, setTypeFilter] = useState(typeFromUrl);
  useEffect(() => {
    setTypeFilter(typeFromUrl);
  }, [typeFromUrl]);

  useEffect(() => { setPage(1); }, [search, category, typeFilter]);

  const CATEGORIES = [
    { value: '', label: t('common.all') },
    { value: 'CLEANING', label: t('services.categories.CLEANING') },
    { value: 'MAINTENANCE', label: t('services.categories.MAINTENANCE') },
    { value: 'REPAIR', label: t('services.categories.REPAIR') },
    { value: 'EMERGENCY', label: t('services.categories.EMERGENCY') },
    { value: 'INSPECTION', label: t('services.categories.INSPECTION') },
    { value: 'CUSTOMIZATION', label: t('services.categories.CUSTOMIZATION') },
    { value: 'COMPREHENSIVE_CARE', label: t('services.categories.COMPREHENSIVE_CARE') },
  ];

  const TYPES = [
    { value: 'FIXED', label: t('services.types.FIXED') },
    { value: 'CATALOG', label: t('services.types.CATALOG') },
    { value: 'EMERGENCY', label: t('services.types.EMERGENCY') },
    { value: 'INSPECTION', label: t('services.types.INSPECTION') },
    { value: 'MOBILE_CAR_SERVICE', label: t('services.types.MOBILE_CAR_SERVICE') },
  ];

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', { search, category, type: typeFilter }],
    queryFn: () => serviceService.getServices({ search: search || undefined, category: category || undefined, type: typeFilter || undefined }),
    staleTime: 60_000,
  });

  const parentServices = services.filter((s) => s.type === 'MOBILE_CAR_SERVICE' && !s.parentServiceId);

  const createMutation = useMutation({
    mutationFn: (payload) => serviceService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(t('common.success'));
      setShowAdd(false);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to create service'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => serviceService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', editService?.id] });
      toast.success(t('common.success'));
      setEditService(null);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to update service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message || t('error.deleteFailed')),
  });

  const openEdit = (s) => {
    setShowAdd(false);
    setEditService(s);
    setForm({
      name: s.name ?? '',
      nameAr: s.nameAr ?? '',
      description: s.description ?? '',
      descriptionAr: s.descriptionAr ?? '',
      type: s.type ?? 'FIXED',
      category: s.category ?? 'CLEANING',
      estimatedDuration: s.estimatedDuration ?? 30,
      imageUrl: s.imageUrl ?? '',
      icon: s.icon ?? '',
      parentServiceId: s.parentServiceId ?? '',
    });
  };

  const closeForm = () => {
    setShowAdd(false);
    setEditService(null);
    setForm(emptyForm());
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      description: form.description.trim() || undefined,
      descriptionAr: form.descriptionAr.trim() || undefined,
      type: form.type,
      category: form.category,
      estimatedDuration: Number(form.estimatedDuration) || 30,
      imageUrl: form.imageUrl?.trim() || undefined,
      icon: form.icon?.trim() || undefined,
      parentServiceId: form.type === 'MOBILE_CAR_SERVICE' && form.parentServiceId ? form.parentServiceId : undefined,
    };
    if (editService) {
      updateMutation.mutate({ id: editService.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const showForm = showAdd || !!editService;
  const formTitle = editService ? t('services.editService', 'Edit service') : t('services.newService', 'New service');

  const { paginatedItems: paginatedServices, totalPages, total } = useMemo(() => {
    const total = services.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = services.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [services, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-md p-2 transition-colors ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            aria-label={t('common.viewTable', 'Table view')}
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            aria-label={t('common.viewGrid', 'Grid view')}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
        <Link
          to="/services/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {t('services.addService')}
        </Link>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{formTitle}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4">
            <Input
              label={t('services.name')}
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Oil Change"
              required
              className="min-w-[180px] flex-1"
            />
            <Input
              label={t('common.nameAr')}
              name="nameAr"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تغيير الزيت"
              className="min-w-[180px] flex-1"
            />
            <Input
              label={t('common.description')}
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
              className="w-full"
            />
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('services.category')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('services.type')}</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, parentServiceId: e.target.value === 'MOBILE_CAR_SERVICE' ? f.parentServiceId : '' }))}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {form.type === 'MOBILE_CAR_SERVICE' && (
              <div className="min-w-[200px] flex-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('services.parentService')}</label>
                <select
                  value={form.parentServiceId}
                  onChange={(e) => setForm((f) => ({ ...f, parentServiceId: e.target.value }))}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">{t('services.thisIsParent')}</option>
                  {parentServices.map((s) => (
                    <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label={t('services.duration')}
              type="number"
              min={1}
              name="estimatedDuration"
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
              className="min-w-[100px]"
            />
            <Input
              label={t('common.imageUrl')}
              name="imageUrl"
              type="url"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
            <Input
              label={t('common.iconUrl')}
              name="icon"
              type="url"
              value={form.icon ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
            <div className="flex w-full gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {editService ? (updateMutation.isPending ? t('common.saving') : t('common.save')) : (createMutation.isPending ? t('common.creating') : t('common.create'))}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                 {t('common.cancel')}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder={t('services.searchServices')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={t('services.searchServices')}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value || 'all'} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              const v = e.target.value;
              setTypeFilter(v);
              if (v) setSearchParams({ type: v }, { replace: true });
              else setSearchParams({}, { replace: true });
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by type"
          >
            <option value="">{t('common.all')}</option>
            {TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {t('common.search')}
          </button>
        </form>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedServices.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">{t('services.noServices')}</div>
              ) : (
                paginatedServices.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                      <Link to={`/services/${s.id}`} className="block">
                        <div className="aspect-video w-full overflow-hidden bg-slate-100">
                          <ImageOrPlaceholder
                            src={s.imageUrl || s.icon}
                            alt={s.name}
                            className="size-full transition-transform duration-300 group-hover:scale-105"
                            aspect="video"
                          />
                        </div>
                        <div className="border-t border-slate-100 p-4">
                          <p className="font-semibold text-slate-900">{s.name}</p>
                          {s.nameAr && <p className="text-sm text-slate-500">{s.nameAr}</p>}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                              {t(`services.categories.${s.category}`) || s.category || '—'}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {s.estimatedDuration ? `${s.estimatedDuration} min` : '—'}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center justify-end gap-1 border-t border-slate-100 bg-slate-50/50 px-4 py-2">
                        <Link
                          to={`/services/${s.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                          title={t('common.view')}
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                          title={t('common.edit')}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await openConfirm({
                              title: t('services.deleteService', 'Delete service'),
                              message: t('common.confirmDelete', { name: s.name }),
                              confirmLabel: t('common.delete'),
                              variant: 'danger',
                            });
                            if (ok) deleteMutation.mutate(s.id);
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={t('common.delete')}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
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
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('services.name')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('services.category')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('services.type')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('services.duration')}
                    </th>
                    <th className="w-32 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        {t('services.noServices')}
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map((s) => (
                      <ServiceRow
                        key={s.id}
                        service={s}
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
