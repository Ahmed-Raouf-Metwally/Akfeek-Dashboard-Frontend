import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Pencil, Trash2, Eye, MapPin, Phone, CheckCircle, XCircle, Building2, Star, ArrowRight, ImagePlus, Image, X, Upload } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { vendorService } from '../services/vendorService';
import { useConfirm } from '../hooks/useConfirm';
import { useAuthStore } from '../store/authStore';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';
import { defaultWorkingHoursByDay, buildWorkingHoursPayload, WORKING_DAYS } from '../utils/workshopFormShared';
import WorkshopFormFields from '../components/workshops/WorkshopFormFields';

/** Safely build an image src — handles both full URLs (legacy) and relative paths */
const apiImg = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

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
  vendorId: '',
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
    ? apiImg(workshop.logo)
    : (workshop.images && workshop.images.length > 0 ? apiImg(workshop.images[0]) : null);

  return (
    <div>
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
    </div>
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
  const logoInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const newLogoInputRef = useRef(null);
  const [newLogoFile, setNewLogoFile] = useState(null);

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
    enabled: isAdmin,
  });

  const { data: certifiedVendorsResult } = useQuery({
    queryKey: ['vendors', { vendorType: 'CERTIFIED_WORKSHOP', limit: 100 }],
    queryFn: () => vendorService.getVendors({ vendorType: 'CERTIFIED_WORKSHOP', limit: 100 }),
    enabled: isAdmin,
    staleTime: 60_000,
  });
  const certifiedVendors = certifiedVendorsResult?.vendors ?? [];

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const workshop = await workshopService.createWorkshop(payload);
      if (newLogoFile) {
        try {
          await workshopService.uploadLogo(workshop.id, newLogoFile);
        } catch {
          toast.error(i18n.language === 'ar' ? 'تم إنشاء الورشة لكن فشل رفع الصورة' : 'Workshop created but logo upload failed');
        }
      }
      return workshop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success(t('common.success'));
      setShowAdd(false);
      setForm(emptyForm());
      setNewLogoFile(null);
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

  const invalidateWorkshop = () => {
    queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
    if (editWorkshop?.id) queryClient.invalidateQueries({ queryKey: ['workshop', editWorkshop.id] });
  };

  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }) => workshopService.uploadLogo(id, file),
    onSuccess: (data) => {
      setEditWorkshop((w) => ({ ...w, logo: data.logo }));
      invalidateWorkshop();
      toast.success(i18n.language === 'ar' ? 'تم رفع الشعار' : 'Logo uploaded');
    },
    onError: (err) => toast.error(err?.message || 'Failed to upload logo'),
  });

  const deleteLogoMutation = useMutation({
    mutationFn: (id) => workshopService.deleteLogo(id),
    onSuccess: () => {
      setEditWorkshop((w) => ({ ...w, logo: null }));
      invalidateWorkshop();
      toast.success(i18n.language === 'ar' ? 'تم حذف الشعار' : 'Logo deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete logo'),
  });

  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, files }) => workshopService.uploadImages(id, files),
    onSuccess: (data) => {
      setEditWorkshop((w) => ({ ...w, images: data.images }));
      invalidateWorkshop();
      toast.success(i18n.language === 'ar' ? 'تم رفع الصور' : 'Images uploaded');
    },
    onError: (err) => toast.error(err?.message || 'Failed to upload images'),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ id, index }) => workshopService.deleteImage(id, index),
    onSuccess: (data) => {
      setEditWorkshop((w) => ({ ...w, images: data?.images ?? [] }));
      invalidateWorkshop();
      toast.success(i18n.language === 'ar' ? 'تم حذف الصورة' : 'Image deleted');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete image'),
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
      vendorId: w.vendorId ?? '',
    });
  };

  const closeForm = () => {
    setShowAdd(false);
    setEditWorkshop(null);
    setForm(emptyForm());
    setNewLogoFile(null);
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
      vendorId: form.vendorId?.trim() ? form.vendorId.trim() : (editWorkshop ? null : undefined),
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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-xl shadow-indigo-500/20">
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
      </div>

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
            <div className="sm:col-span-2 lg:col-span-3 space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                {i18n.language === 'ar' ? 'ربط بالفيندور (ورشة معتمدة)' : 'Link to vendor (Certified Workshop)'}
              </label>
              <select
                value={form.vendorId || ''}
                onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">{i18n.language === 'ar' ? '-- بدون ربط --' : '-- No link --'}</option>
                {certifiedVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName || v.id} {v.businessNameAr ? ` / ${v.businessNameAr}` : ''}
                  </option>
                ))}
              </select>
              {certifiedVendors.length === 0 && (
                <p className="text-xs text-amber-600">
                  {i18n.language === 'ar' ? 'لا يوجد فيندورز من نوع ورشة معتمدة. أضف فيندور من نوع "الورش المعتمدة" أولاً.' : 'No certified workshop vendors. Add a vendor with type "Certified Workshop" first.'}
                </p>
              )}
            </div>
            {/* Logo picker — create mode only */}
            {!editWorkshop && (
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {i18n.language === 'ar' ? 'صورة / شعار الورشة (اختياري)' : 'Workshop logo / image (optional)'}
                </label>
                <div className="flex items-center gap-4">
                  {newLogoFile ? (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img src={URL.createObjectURL(newLogoFile)} alt="preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setNewLogoFile(null); if (newLogoInputRef.current) newLogoInputRef.current.value = ''; }}
                        className="absolute right-0.5 top-0.5 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
                      <Image className="size-7" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => newLogoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Upload className="size-3.5" />
                    {i18n.language === 'ar' ? 'اختر صورة' : 'Choose image'}
                  </button>
                  <input ref={newLogoInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setNewLogoFile(f); }} />
                </div>
              </div>
            )}

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

          {/* ── Image Management (edit only) ─────────────────────────────── */}
          {editWorkshop && (
            <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
              <h4 className="text-sm font-semibold text-slate-700">
                {i18n.language === 'ar' ? 'الشعار والصور' : 'Logo & Images'}
              </h4>

              {/* Logo */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {i18n.language === 'ar' ? 'الشعار' : 'Logo'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {editWorkshop.logo
                      ? <img src={apiImg(editWorkshop.logo)} alt="logo" className="size-full object-cover" />
                      : <Image className="size-7 text-slate-300" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadLogoMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
                      <Upload className="size-3.5" />
                      {uploadLogoMutation.isPending
                        ? (i18n.language === 'ar' ? 'جارٍ الرفع…' : 'Uploading…')
                        : (i18n.language === 'ar' ? 'رفع شعار' : 'Upload logo')}
                    </button>
                    {editWorkshop.logo && (
                      <button type="button" onClick={() => deleteLogoMutation.mutate(editWorkshop.id)} disabled={deleteLogoMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                        <Trash2 className="size-3.5" />
                        {i18n.language === 'ar' ? 'حذف الشعار' : 'Delete logo'}
                      </button>
                    )}
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadLogoMutation.mutate({ id: editWorkshop.id, file }); e.target.value = ''; }} />
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {i18n.language === 'ar' ? 'صور الورشة' : 'Workshop images'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {(editWorkshop.images ?? []).map((imgUrl, idx) => (
                    <div key={idx} className="group relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img src={apiImg(imgUrl)} alt={`img-${idx}`} className="size-full object-cover" />
                      <button type="button" onClick={() => deleteImageMutation.mutate({ id: editWorkshop.id, index: idx })}
                        disabled={deleteImageMutation.isPending}
                        className="absolute right-1 top-1 hidden rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700 group-hover:flex disabled:opacity-50">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {(editWorkshop.images ?? []).length < 10 && (
                    <button type="button" onClick={() => imagesInputRef.current?.click()} disabled={uploadImagesMutation.isPending}
                      className="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 disabled:opacity-50 transition">
                      {uploadImagesMutation.isPending
                        ? <span className="text-[10px] font-medium">{i18n.language === 'ar' ? 'جارٍ…' : 'Uploading…'}</span>
                        : <ImagePlus className="size-6" />}
                    </button>
                  )}
                </div>
                <input ref={imagesInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { if (e.target.files?.length) uploadImagesMutation.mutate({ id: editWorkshop.id, files: e.target.files }); e.target.value = ''; }} />
              </div>
            </div>
          )}
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
