import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, Eye, MapPin, Phone, CheckCircle, XCircle, Building2, Star, ArrowRight } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useConfirm } from '../hooks/useConfirm';
import { useAuthStore } from '../store/authStore';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';
import { defaultWorkingHoursByDay, buildWorkingHoursPayload } from '../utils/workshopFormShared';
import WorkshopFormFields from '../components/workshops/WorkshopFormFields';

const emptyForm = () => ({
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  address: '',
  addressAr: '',
  city: '',
  cityAr: '',
  locationUrl: '',
  phone: '',
  email: '',
  services: '["Engine Repair", "Oil Change"]',
  workingHoursByDay: defaultWorkingHoursByDay(),
  isActive: true,
  isVerified: false,
});

function WorkshopCard({ workshop, onEdit, onDelete, onToggleVerification, openConfirm, t }) {
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await openConfirm({
      title: t('workshops.deleteWorkshop', 'Delete workshop'),
      message: t('common.confirmDelete', { name: workshop.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) await onDelete(workshop.id);
  };

  const handleToggleVerification = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(workshop);
  };

  const mainImage = workshop.logo 
    ? `${import.meta.env.VITE_API_URL}${workshop.logo}`
    : (workshop.images && workshop.images.length > 0 ? `${import.meta.env.VITE_API_URL}${workshop.images[0]}` : null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Link
        to={`/workshops/${workshop.id}`}
        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ImageOrPlaceholder
            src={mainImage}
            alt={workshop.name}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
            placeholder={<Building2 className="size-10 text-slate-300" />}
          />
          
          {/* Status Badges - Overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {workshop.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100/90 px-2 py-0.5 text-xs font-medium text-green-700 backdrop-blur-sm">
                {t('common.active')}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100/90 px-2 py-0.5 text-xs font-medium text-slate-600 backdrop-blur-sm">
                {t('common.inactive')}
              </span>
            )}
          </div>
          
          <div className="absolute right-3 top-3">
             {workshop.isVerified && (
               <div className="rounded-full bg-white/90 p-1 backdrop-blur-sm" title={t('workshops.verified')}>
                 <CheckCircle className="size-4 text-green-600" />
               </div>
             )}
          </div>
          
          {/* Quick Actions Overlay on Hover */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
             <button
                onClick={handleEdit}
                className="rounded-lg bg-white/90 p-1.5 text-slate-700 hover:bg-white hover:text-indigo-600"
                title={t('common.edit')}
             >
               <Pencil className="size-4" />
             </button>
             <button
                onClick={handleToggleVerification}
                className={`rounded-lg bg-white/90 p-1.5 hover:bg-white ${workshop.isVerified ? 'text-green-600 hover:text-yellow-600' : 'text-slate-400 hover:text-green-600'}`}
                title={workshop.isVerified ? t('common.unverify') : t('common.verify')}
             >
               {workshop.isVerified ? <XCircle className="size-4" /> : <CheckCircle className="size-4" />}
             </button>
             <button
                onClick={handleDelete}
                className="rounded-lg bg-white/90 p-1.5 text-slate-700 hover:bg-white hover:text-red-600"
                title={t('common.delete')}
             >
               <Trash2 className="size-4" />
             </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <div className="mb-2">
            <h3 className="line-clamp-1 font-bold text-slate-900 group-hover:text-indigo-600">
              {workshop.name}
            </h3>
            {workshop.nameAr && (
              <p className="line-clamp-1 text-sm text-slate-500">{workshop.nameAr}</p>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-y-2 text-sm text-slate-600">
            <div className="flex w-full items-center gap-1.5">
               <MapPin className="size-3.5 shrink-0 text-slate-400" />
               <span className="line-clamp-1">{workshop.city}</span>
            </div>
            {/* Rating */}
            <div className="flex w-full items-center gap-1.5">
               <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
               <span className="font-medium text-slate-900">{workshop.averageRating?.toFixed(1) || '0.0'}</span>
               <span className="text-xs text-slate-400">
                 ({workshop.totalReviews || 0} {t('workshops.reviews', 'reviews')})
               </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
             <span className="text-xs font-medium text-slate-500">
                {workshop.phone}
             </span>
             <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2">
               {t('common.viewDetails')}
               <ArrowRight className="size-4 transition-all group-hover:translate-x-0.5" />
             </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function WorkshopsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 12; // Increased page size for grid
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
    enabled: isAdmin,
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
    const wh = w.workingHours && typeof w.workingHours === 'object' ? w.workingHours : {};
    const workingHoursByDay = defaultWorkingHoursByDay();
    WORKING_DAYS.forEach(({ key }) => {
      const h = wh[key];
      if (h && (h.closed === true || h === null)) {
        workingHoursByDay[key] = { closed: true, open: '', close: '' };
      } else if (h && h.open && h.close) {
        workingHoursByDay[key] = { closed: false, open: h.open, close: h.close };
      }
    });
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
      workingHoursByDay,
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
      workingHours: buildWorkingHoursPayload(form.workingHoursByDay || defaultWorkingHoursByDay()),
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

  if (!isAdmin) {
    const isAr = i18n.language === 'ar';
    const isWorkshopVendor = user?.role === 'VENDOR' && user?.vendorType === 'CERTIFIED_WORKSHOP';
    return (
      <div className="space-y-8">
        <ConfirmModal />
        <Card className="p-8 text-center">
          <Building2 className="mx-auto size-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{isAr ? 'صفحة إدارية' : 'Admin only'}</h2>
          <p className="mt-2 text-slate-600">
            {isAr ? 'هذه الصفحة متاحة للمسؤولين فقط. لإدارة ورشتك استخدم الرابط أدناه.' : 'This page is for administrators only. To manage your workshop, use the link below.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isWorkshopVendor && (
              <Link to="/vendor/workshop" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                <Building2 className="size-4" /> {isAr ? 'الورشة' : 'My Workshop'}
              </Link>
            )}
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {isAr ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmModal />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-xl shadow-indigo-500/20"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Building2 className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t('workshops.title', 'Certified Workshops')}
              </h1>
              <p className="mt-2 max-w-xl text-indigo-100/90">
                {t('workshops.subtitle', 'Manage and monitor all certified workshops, verifications, and customer reviews.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditWorkshop(null);
              setForm(emptyForm());
              setShowAdd(true);
            }} // Fix: clear form when adding new
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            <Plus className="size-5" />
            {t('workshops.addWorkshop', 'Add Workshop')}
          </button>
        </div>
      </motion.div>

      {/* Form Section */}
      {showForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{formTitle}</h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WorkshopFormFields
              form={form}
              setForm={setForm}
              requireLocationUrl={!editWorkshop}
              showAdminFields={true}
            />
            <div className="flex w-full gap-3 pt-2 sm:col-span-2 lg:col-span-3">
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

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder={t('workshops.searchWorkshops', 'Search workshops...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {CITIES.map((c) => (
              <option key={c.value || 'all'} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {VERIFIED_FILTERS.map((f) => (
              <option key={f.value || 'all'} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Grid View */}
        {isLoading ? (
           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
           </div>
        ) : paginatedWorkshops.length === 0 ? (
           <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
             <Building2 className="mb-4 size-14 text-slate-300" />
             <p className="text-slate-600">
               {t('workshops.noWorkshops', 'No workshops found')}
             </p>
           </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedWorkshops.map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutateAsync(id)}
                onToggleVerification={(id, isVerified) => verifyMutation.mutateAsync({ id, isVerified })}
                openConfirm={openConfirm}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8">
           <Pagination
             page={page}
             totalPages={totalPages}
             total={total}
             pageSize={PAGE_SIZE}
             onPageChange={setPage}
             disabled={isLoading}
           />
        </div>
      </div>
    </div>
  );
}
