import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Pencil, Trash2, Eye, LayoutGrid, List, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Input from '../components/Input';
import { Card } from '../components/ui/Card';

const emptyForm = () => ({
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  address: '',
  addressAr: '',
  city: '',
  cityAr: '',
  locationUrl: '', // Always initialize with empty string
  phone: '',
  email: '',
  services: '',
  isActive: true,
  isVerified: false,
});

function WorkshopRow({ workshop, onEdit, onDelete, onToggleVerification, openConfirm, t }) {
  const handleDelete = async () => {
    const ok = await openConfirm({
      title: t('workshops.deleteWorkshop', 'Delete workshop'),
      message: t('common.confirmDelete', { name: workshop.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) await onDelete(workshop.id);
  };

  const handleToggleVerification = async () => {
    const ok = await openConfirm({
      title: workshop.isVerified ? t('workshops.unverifyWorkshop') : t('workshops.verifyWorkshop'),
      message: workshop.isVerified 
        ? t('workshops.confirmUnverify', { name: workshop.name })
        : t('workshops.confirmVerify', { name: workshop.name }),
      confirmLabel: workshop.isVerified ? t('common.unverify') : t('common.verify'),
      variant: workshop.isVerified ? 'warning' : 'success',
    });
    if (ok) await onToggleVerification(workshop.id, !workshop.isVerified);
  };

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-900">{workshop.name}</p>
            {workshop.isVerified && (
              <CheckCircle className="size-4 text-green-600" title={t('workshops.verified')} />
            )}
          </div>
          {workshop.nameAr && <p className="text-sm text-slate-500">{workshop.nameAr}</p>}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="size-4" />
          <span>{workshop.city}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Phone className="size-4" />
          <span>{workshop.phone}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${workshop.isActive ? 'text-green-600' : 'text-slate-400'}`}>
            {workshop.isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            to={`/workshops/${workshop.id}`}
            className={iconBtn}
            title={t('common.viewDetails')}
            aria-label={t('common.viewDetails')}
          >
            <Eye className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(workshop)}
            className={iconBtn}
            title={t('common.edit')}
            aria-label={t('common.edit')}
          >
            <Pencil className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleToggleVerification}
            className={`${iconBtn} ${workshop.isVerified ? 'hover:bg-yellow-50 hover:text-yellow-600' : 'hover:bg-green-50 hover:text-green-600'}`}
            title={workshop.isVerified ? t('common.unverify') : t('common.verify')}
          >
            {workshop.isVerified ? <XCircle className="size-5" /> : <CheckCircle className="size-5" />}
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

export default function WorkshopsPage() {
  const { t } = useTranslation();
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editWorkshop, setEditWorkshop] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const CITIES = [
    { value: '', label: t('common.all') },
    { value: 'Riyadh', label: t('cities.riyadh', 'Riyadh') },
    { value: 'Jeddah', label: t('cities.jeddah', 'Jeddah') },
    { value: 'Dammam', label: t('cities.dammam', 'Dammam') },
    { value: 'Mecca', label: t('cities.mecca', 'Mecca') },
    { value: 'Medina', label: t('cities.medina', 'Medina') },
  ];

  const VERIFIED_FILTERS = [
    { value: '', label: t('common.all') },
    { value: 'true', label: t('workshops.verified') },
    { value: 'false', label: t('workshops.unverified') },
  ];

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ['workshops-admin', { search, city, isVerified: verifiedFilter }],
    queryFn: () => workshopService.getAllWorkshopsAdmin({ 
      search: search || undefined, 
      city: city || undefined,
      isVerified: verifiedFilter || undefined,
    }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => workshopService.createWorkshop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success(t('common.success'));
      setShowAdd(false);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to create workshop'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => workshopService.updateWorkshop(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      queryClient.invalidateQueries({ queryKey: ['workshop', editWorkshop?.id] });
      toast.success(t('common.success'));
      setEditWorkshop(null);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || 'Failed to update workshop'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }) => workshopService.toggleVerification(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message || 'Failed to update verification'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workshopService.deleteWorkshop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message || t('error.deleteFailed')),
  });

  const openEdit = (w) => {
    setShowAdd(false);
    setEditWorkshop(w);
    setForm({
      name: w.name ?? '',
      nameAr: w.nameAr ?? '',
      description: w.description ?? '',
      descriptionAr: w.descriptionAr ?? '',
      address: w.address ?? '',
      addressAr: w.addressAr ?? '',
      city: w.city ?? '',
      cityAr: w.cityAr ?? '',
      locationUrl: '',
      phone: w.phone ?? '',
      email: w.email ?? '',
      services: typeof w.services === 'string' ? w.services : JSON.stringify(w.services || []),
      isActive: w.isActive ?? true,
      isVerified: w.isVerified ?? false,
    });
  };

  const closeForm = () => {
    setShowAdd(false);
    setEditWorkshop(null);
    setForm(emptyForm());
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      description: form.description.trim() || undefined,
      descriptionAr: form.descriptionAr.trim() || undefined,
      address: form.address.trim(),
      addressAr: form.addressAr.trim() || undefined,
      city: form.city.trim(),
      cityAr: form.cityAr.trim() || undefined,
      locationUrl: form.locationUrl.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      services: form.services.trim(),
      isActive: form.isActive,
      isVerified: form.isVerified,
    };
    if (editWorkshop) {
      updateMutation.mutate({ id: editWorkshop.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const showForm = showAdd || !!editWorkshop;
  const formTitle = editWorkshop ? t('workshops.editWorkshop', 'Edit workshop') : t('workshops.newWorkshop', 'New workshop');

  const { paginatedItems: paginatedWorkshops, totalPages, total } = useMemo(() => {
    const total = workshops.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const effectivePage = Math.min(page, totalPages);
    const start = (effectivePage - 1) * PAGE_SIZE;
    const paginatedItems = workshops.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [workshops, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{t('workshops.title', 'Certified Workshops')}</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {t('workshops.addWorkshop', 'Add Workshop')}
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{formTitle}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4">
            <Input
              label={t('workshops.name')}
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Al-Salam Auto Center"
              required
              className="min-w-[180px] flex-1"
            />
            <Input
              label={t('common.nameAr')}
              name="nameAr"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="مركز السلام للسيارات"
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
            <Input
              label={t('workshops.address')}
              name="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="King Fahd Road"
              required
              className="min-w-[200px] flex-1"
            />
            <Input
              label={t('workshops.city')}
              name="city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Riyadh"
              required
              className="min-w-[140px] flex-1"
            />
            <Input
              label={t('workshops.phone')}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+966112345000"
              required
              className="min-w-[160px] flex-1"
            />
            <Input
              label={t('workshops.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="info@workshop.sa"
              className="min-w-[180px] flex-1"
            />
            <Input
              label={t('workshops.locationUrl')}
              name="locationUrl"
              value={form.locationUrl}
              onChange={(e) => setForm((f) => ({ ...f, locationUrl: e.target.value }))}
              placeholder={t('workshops.locationUrlPlaceholder')}
              className="w-full"
            />
            <Input
              label={t('workshops.services')}
              name="services"
              value={form.services}
              onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
              placeholder='["Engine Repair", "Oil Change"]'
              required
              className="w-full"
            />
            <div className="flex w-full gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {editWorkshop ? (updateMutation.isPending ? t('common.saving') : t('common.save')) : (createMutation.isPending ? t('common.creating') : t('common.create'))}
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
              placeholder={t('workshops.searchWorkshops', 'Search workshops...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={t('workshops.searchWorkshops')}
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by city"
          >
            {CITIES.map((c) => (
              <option key={c.value || 'all'} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by verification"
          >
            {VERIFIED_FILTERS.map((f) => (
              <option key={f.value || 'all'} value={f.value}>{f.label}</option>
            ))}
          </select>
        </form>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('workshops.name')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('workshops.city')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('workshops.phone')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('common.status')}
                    </th>
                    <th className="w-40 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWorkshops.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        {t('workshops.noWorkshops', 'No workshops found')}
                      </td>
                    </tr>
                  ) : (
                    paginatedWorkshops.map((w) => (
                      <WorkshopRow
                        key={w.id}
                        workshop={w}
                        onEdit={openEdit}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                        onToggleVerification={(id, isVerified) => verifyMutation.mutateAsync({ id, isVerified })}
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
