import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CUSTOMIZATION', label: 'Customization' },
];

const TYPES = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'CATALOG', label: 'Catalog' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'INSPECTION', label: 'Inspection' },
];

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
});

function ServiceRow({ service, onEdit, onDelete, openConfirm }) {
  const handleDelete = async () => {
    const ok = await openConfirm({
      title: 'Delete service',
      message: `Remove "${service.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (ok) await onDelete(service.id);
  };

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{service.name}</p>
        {service.nameAr && <p className="text-sm text-slate-500">{service.nameAr}</p>}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {service.category ?? '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {service.type ?? '—'}
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
            title="View full details"
            aria-label="View full details"
          >
            <Eye className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(service)}
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
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value != null && value !== '' ? value : '—'}</span>
    </div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { setPage(1); }, [search, category]);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', { search, category }],
    queryFn: () => serviceService.getServices({ search: search || undefined, category: category || undefined }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => serviceService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created');
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
      toast.success('Service updated');
      setEditService(null);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to update service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete service'),
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
    };
    if (editService) {
      updateMutation.mutate({ id: editService.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const showForm = showAdd || !!editService;
  const formTitle = editService ? 'Edit service' : 'New service';

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div />
        <Link
          to="/services/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Create service
        </Link>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{formTitle}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Oil Change"
              required
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Name (Ar)"
              name="nameAr"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="تغيير الزيت"
              className="min-w-[180px] flex-1"
            />
            <Input
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
              className="w-full"
            />
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (min)"
              type="number"
              min={1}
              name="estimatedDuration"
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
              className="min-w-[100px]"
            />
            <Input
              label="Image URL"
              name="imageUrl"
              type="url"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
            <Input
              label="Icon URL"
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
                {editService ? (updateMutation.isPending ? 'Saving…' : 'Save') : (createMutation.isPending ? 'Creating…' : 'Create')}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Search services"
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
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Search
          </button>
        </form>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Duration
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No services found.
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
