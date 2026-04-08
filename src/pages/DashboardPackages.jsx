import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Plus, Package, Calendar, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import packageService from '../services/packageService';

function PackageCard({ pkg, onEdit, onDelete, onToggleActive }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              pkg.isActive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {pkg.isActive ? t('packages.active', 'Active') : t('packages.inactive', 'Inactive')}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">#{pkg.id.slice(0, 8)}</span>
          </div>
          
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isArabic && pkg.nameAr ? pkg.nameAr : pkg.name}
          </h3>
          
          {pkg.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {isArabic && pkg.descriptionAr ? pkg.descriptionAr : pkg.description}
            </p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <CreditCard className="size-4" />
              <span className="font-semibold">{Number(pkg.price).toFixed(2)} SAR</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Calendar className="size-4" />
              <span>{pkg.validityDays} {t('packages.days', 'days')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Package className="size-4" />
              <span>
                {pkg.usageCount === null || pkg.usageCount === undefined 
                  ? t('packages.unlimited', 'Unlimited') 
                  : `${pkg.usageCount} ${t('packages.uses', 'uses')}`}
              </span>
            </div>
          </div>
          
          {pkg.services && pkg.services.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('packages.services', 'Services')}:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {pkg.services.map(ps => (
                  <span 
                    key={ps.id} 
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {isArabic && ps.service.nameAr ? ps.service.nameAr : ps.service.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleActive(pkg)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
              pkg.isActive
                ? 'border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200 dark:hover:bg-yellow-900/30'
                : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30'
            }`}
          >
            {pkg.isActive ? t('packages.deactivate', 'Deactivate') : t('packages.activate', 'Activate')}
          </button>
          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-200 dark:hover:bg-indigo-900/30"
          >
            {t('packages.edit', 'Edit')}
          </button>
          <button
            type="button"
            onClick={() => onDelete(pkg)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30"
          >
            <Trash2 className="size-4" />
            {t('packages.delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageForm({ services, initialData, onSubmit, onCancel }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    nameAr: initialData?.nameAr || '',
    description: initialData?.description || '',
    descriptionAr: initialData?.descriptionAr || '',
    price: initialData?.price || 0,
    usageCount: initialData?.usageCount ?? '',
    validityDays: initialData?.validityDays || 30,
    serviceIds: initialData?.services?.map(s => s.serviceId) || [],
    isActive: initialData?.isActive ?? true,
    imageUrl: initialData?.imageUrl || '',
    sortOrder: initialData?.sortOrder || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      usageCount: formData.usageCount === '' ? null : Number(formData.usageCount),
      price: Number(formData.price),
      validityDays: Number(formData.validityDays),
      sortOrder: Number(formData.sortOrder)
    };
    onSubmit(data);
  };

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">
          {initialData ? t('packages.editPackage', 'Edit Package') : t('packages.createPackage', 'Create Package')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block font-semibold">{t('packages.name', 'Name')} (EN) *</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block font-semibold">{t('packages.nameAr', 'Name')} (AR)</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </label>
          </div>
          
          <label className="text-sm text-slate-700 dark:text-slate-200">
            <span className="mb-1 block font-semibold">{t('packages.description', 'Description')} (EN)</span>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>
          
          <label className="text-sm text-slate-700 dark:text-slate-200">
            <span className="mb-1 block font-semibold">{t('packages.descriptionAr', 'Description')} (AR)</span>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
              rows={2}
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            />
          </label>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block font-semibold">{t('packages.price', 'Price')} (SAR) *</span>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block font-semibold">{t('packages.usageCount', 'Usage Count')}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={formData.usageCount}
                onChange={(e) => setFormData({ ...formData, usageCount: e.target.value })}
                placeholder={t('packages.unlimited', 'Unlimited')}
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block font-semibold">{t('packages.validityDays', 'Validity (Days)')} *</span>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                required
              />
            </label>
          </div>
          
          <label className="text-sm text-slate-700 dark:text-slate-200">
            <span className="mb-1 block font-semibold">{t('packages.selectServices', 'Select Services')}</span>
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
              {services?.map(service => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {isArabic && service.nameAr ? service.nameAr : service.name}
                  </span>
                </label>
              ))}
            </div>
          </label>
          
          <label className="text-sm text-slate-700 dark:text-slate-200">
            <span className="mb-1 block font-semibold">{t('packages.sortOrder', 'Sort Order')}</span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            />
          </label>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {initialData ? t('packages.update', 'Update') : t('packages.create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPackages() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await packageService.getAllPackages();
      return res.data.data;
    }
  });

  const { data: servicesData } = useQuery({
    queryKey: ['package-services'],
    queryFn: async () => {
      const res = await packageService.getAllServices();
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: packageService.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(t('packages.created', 'Package created successfully'));
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('packages.error', 'Error creating package'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => packageService.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(t('packages.updated', 'Package updated successfully'));
      setShowForm(false);
      setEditingPackage(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('packages.error', 'Error updating package'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: packageService.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(t('packages.deleted', 'Package deleted successfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('packages.error', 'Error deleting package'));
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => packageService.updatePackage(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(t('packages.statusUpdated', 'Package status updated'));
    }
  });

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDelete = (pkg) => {
    if (window.confirm(t('packages.confirmDelete', 'Are you sure you want to delete this package?'))) {
      deleteMutation.mutate(pkg.id);
    }
  };

  const handleToggleActive = (pkg) => {
    toggleActiveMutation.mutate({ id: pkg.id, isActive: !pkg.isActive });
  };

  const handleSubmit = (data) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('packages.title', 'Packages Management')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.subtitle', 'Manage subscription packages for customers')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPackage(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          {t('packages.addPackage', 'Add Package')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : packagesData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="size-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('packages.noPackages', 'No packages yet')}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.noPackagesDesc', 'Create your first package to get started')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {packagesData?.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PackageForm
          services={servicesData}
          initialData={editingPackage}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPackage(null);
          }}
        />
      )}
    </div>
  );
}
