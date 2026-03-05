import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Car, Eye, Search, User, Plus, Pencil, Trash2 } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { userService } from '../services/userService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

const PAGE_SIZE = 20;

const emptyForm = () => ({
  userId: '',
  brandId: '',
  vehicleModelId: '',
  plateLettersAr: '',
  plateLettersEn: '',
  plateDigits: '',
  plateRegion: '',
  plateNumber: '',
  color: '',
  isDefault: false,
});

function vehicleLabel(v) {
  const brand = v.vehicleModel?.brand?.name ?? '';
  const model = v.vehicleModel?.name ?? '';
  const year = v.vehicleModel?.year ?? '';
  return [brand, model, year].filter(Boolean).join(' ') || '—';
}

function userLabel(v) {
  const p = v.user?.profile;
  const name = [p?.firstName, p?.lastName].filter(Boolean).join(' ') || '—';
  const email = v.user?.email ?? '—';
  return name !== '—' ? `${name} (${email})` : email;
}

function buildFullPlateNumber(f) {
  const letters = (f.plateLettersAr || f.plateLettersEn || '').trim();
  const digits = (f.plateDigits || '').trim();
  const region = (f.plateRegion || '').trim();
  const part = [letters, digits].filter(Boolean).join(' ');
  return region ? `${part} ${region}`.trim() : part;
}

/** Display plate: use stored plateNumber or build from parts so the column always shows something */
function displayPlateNumber(v) {
  if (v.plateNumber && String(v.plateNumber).trim()) return v.plateNumber;
  const built = buildFullPlateNumber(v);
  return built || '—';
}

export default function VehiclesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [userSearchApplied, setUserSearchApplied] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [editVehicle, setEditVehicle] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm());

  const applySearch = () => {
    setSearchApplied(search.trim());
    setUserSearchApplied(userSearch.trim());
    setPage(1);
  };

  const params = {
    page,
    limit: PAGE_SIZE,
    search: searchApplied || undefined,
    userSearch: userSearchApplied || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', 'all', params],
    queryFn: () => vehicleService.getAllVehicles(params),
    placeholderData: (prev) => prev,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['vehicles', 'brands'],
    queryFn: () => vehicleService.getBrands(),
    staleTime: 60_000,
  });

  const { data: models = [] } = useQuery({
    queryKey: ['vehicles', 'models', addForm.brandId || editForm.brandId],
    queryFn: () => vehicleService.getModels(addForm.brandId || editForm.brandId),
    enabled: !!(addForm.brandId || editForm.brandId),
    staleTime: 60_000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'list', { limit: 500 }],
    queryFn: () => userService.getUsers({ limit: 500 }),
    enabled: showAdd,
    staleTime: 60_000,
  });
  const usersList = usersData?.users ?? [];

  useEffect(() => {
    if (!addForm.brandId) setAddForm((f) => ({ ...f, vehicleModelId: '' }));
  }, [addForm.brandId]);
  useEffect(() => {
    if (!editForm.brandId) setEditForm((f) => ({ ...f, vehicleModelId: '' }));
  }, [editForm.brandId]);

  const createMutation = useMutation({
    mutationFn: (payload) => vehicleService.createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicles.created', 'تمت إضافة المركبة'));
      setShowAdd(false);
      setAddForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => vehicleService.updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicles.updated', 'تم تحديث المركبة'));
      setEditVehicle(null);
      setEditForm(emptyForm());
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicles.deleted', 'تم حذف المركبة'));
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const vehicles = data?.vehicles ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };

  const openEdit = (v) => {
    setEditVehicle(v);
    setEditForm({
      userId: v.userId ?? '',
      brandId: v.vehicleModel?.brand?.id ?? '',
      vehicleModelId: v.vehicleModelId ?? '',
      plateLettersAr: v.plateLettersAr ?? '',
      plateLettersEn: v.plateLettersEn ?? '',
      plateDigits: v.plateDigits ?? '',
      plateRegion: v.plateRegion ?? '',
      plateNumber: v.plateNumber ?? '',
      color: v.color ?? '',
      isDefault: v.isDefault ?? false,
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.userId) {
      toast.error(t('vehicles.selectOwnerRequired', 'اختر صاحب المركبة'));
      return;
    }
    if (!addForm.vehicleModelId) {
      toast.error(t('vehicles.modelRequired', 'الموديل مطلوب'));
      return;
    }
    if (!addForm.plateDigits?.trim() && !addForm.plateNumber?.trim()) {
      toast.error(t('vehicles.plateRequired', 'رقم اللوحة مطلوب'));
      return;
    }
    const payload = {
      userId: addForm.userId.trim(),
      vehicleModelId: addForm.vehicleModelId,
      plateLettersAr: addForm.plateLettersAr || undefined,
      plateLettersEn: addForm.plateLettersEn || undefined,
      plateDigits: addForm.plateDigits || undefined,
      plateRegion: addForm.plateRegion || undefined,
      plateNumber: addForm.plateNumber || undefined,
      color: addForm.color || undefined,
      isDefault: !!addForm.isDefault,
    };
    createMutation.mutate(payload);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editVehicle) return;
    const payload = {
      plateNumber: editForm.plateNumber || undefined,
      plateLettersAr: editForm.plateLettersAr || undefined,
      plateLettersEn: editForm.plateLettersEn || undefined,
      plateDigits: editForm.plateDigits || undefined,
      plateRegion: editForm.plateRegion || undefined,
      color: editForm.color || undefined,
      isDefault: !!editForm.isDefault,
    };
    updateMutation.mutate({ id: editVehicle.id, payload });
  };

  const handleDelete = async (v) => {
    if (!window.confirm(t('vehicles.confirmDelete', 'حذف هذه المركبة؟'))) return;
    deleteMutation.mutate(v.id);
  };

  const formFieldClass = 'min-w-[140px] flex-1';
  const labelClass = 'mb-1 block text-sm font-medium text-slate-700';
  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div />
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="size-4" /> {t('vehicles.addVehicle', 'إضافة مركبة')}
        </button>
      </div>

      {showAdd && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('vehicles.addVehicle', 'إضافة مركبة')}</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4">
            <div className={`${formFieldClass} min-w-[280px]`}>
              <label className={labelClass}>{t('vehicles.ownerSelect', 'صاحب المركبة')} *</label>
              <select
                value={addForm.userId}
                onChange={(e) => setAddForm((f) => ({ ...f, userId: e.target.value }))}
                className={inputClass}
                required
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? t('vehicles.loadingUsers', 'جاري تحميل المستخدمين...') : t('vehicles.selectOwner', 'اختر المستخدم')}
                </option>
                {usersList.map((u) => {
                  const name = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') || '—';
                  const label = name !== '—' ? `${name} — ${u.email}` : u.email;
                  return (
                    <option key={u.id} value={u.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={formFieldClass}>
              <label className={labelClass}>{t('common.brand', 'الماركة')}</label>
              <select
                value={addForm.brandId}
                onChange={(e) => setAddForm((f) => ({ ...f, brandId: e.target.value, vehicleModelId: '' }))}
                className={inputClass}
              >
                <option value="">{t('vehicles.selectBrand', 'اختر الماركة')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className={formFieldClass}>
              <label className={labelClass}>{t('vehicles.model', 'الموديل')} *</label>
              <select
                value={addForm.vehicleModelId}
                onChange={(e) => setAddForm((f) => ({ ...f, vehicleModelId: e.target.value }))}
                className={inputClass}
                required
              >
                <option value="">{t('vehicles.selectModel', 'اختر الموديل')}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.year})</option>
                ))}
              </select>
            </div>
            <Input label={t('vehicles.plateLettersAr', 'أحرف اللوحة عربي')} value={addForm.plateLettersAr} onChange={(e) => setAddForm((f) => ({ ...f, plateLettersAr: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateLettersEn', 'أحرف اللوحة إنجليزي')} value={addForm.plateLettersEn} onChange={(e) => setAddForm((f) => ({ ...f, plateLettersEn: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateDigits', 'أرقام اللوحة')} value={addForm.plateDigits} onChange={(e) => setAddForm((f) => ({ ...f, plateDigits: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateRegion', 'رمز المنطقة')} value={addForm.plateRegion} onChange={(e) => setAddForm((f) => ({ ...f, plateRegion: e.target.value }))} placeholder="K" className={formFieldClass} />
            <Input label={t('vehicles.plateNumber', 'رقم اللوحة الكامل')} value={addForm.plateNumber} onChange={(e) => setAddForm((f) => ({ ...f, plateNumber: e.target.value }))} placeholder={t('vehicles.plateNumberPlaceholder', 'أو اتركه فارغاً')} className={formFieldClass} />
            <Input label={t('vehicles.color', 'اللون')} value={addForm.color} onChange={(e) => setAddForm((f) => ({ ...f, color: e.target.value }))} className={formFieldClass} />
            <div className="flex w-full items-center gap-2">
              <input
                type="checkbox"
                id="add-default"
                checked={addForm.isDefault}
                onChange={(e) => setAddForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="add-default" className="text-sm text-slate-700">{t('vehicles.isDefault', 'افتراضية')}</label>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {createMutation.isPending ? t('common.creating') : t('common.create')}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setAddForm(emptyForm()); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </Card>
      )}

      {editVehicle && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">{t('vehicles.editVehicle', 'تعديل مركبة')}</h3>
          <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-4">
            <Input label={t('vehicles.plateLettersAr')} value={editForm.plateLettersAr} onChange={(e) => setEditForm((f) => ({ ...f, plateLettersAr: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateLettersEn')} value={editForm.plateLettersEn} onChange={(e) => setEditForm((f) => ({ ...f, plateLettersEn: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateDigits')} value={editForm.plateDigits} onChange={(e) => setEditForm((f) => ({ ...f, plateDigits: e.target.value }))} className={formFieldClass} />
            <Input label={t('vehicles.plateRegion')} value={editForm.plateRegion} onChange={(e) => setEditForm((f) => ({ ...f, plateRegion: e.target.value }))} className={formFieldClass} />
            <div className={`${formFieldClass} w-full`}>
              <span className={labelClass}>{t('vehicles.plateNumber', 'رقم اللوحة الكامل')}</span>
              <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
                {buildFullPlateNumber(editForm) || '—'}
              </p>
            </div>
            <Input label={t('vehicles.color', 'اللون')} value={editForm.color} onChange={(e) => setEditForm((f) => ({ ...f, color: e.target.value }))} className={formFieldClass} />
            <div className="flex w-full items-center gap-2">
              <input
                type="checkbox"
                id="edit-default"
                checked={editForm.isDefault}
                onChange={(e) => setEditForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="edit-default" className="text-sm text-slate-700">{t('vehicles.isDefault')}</label>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {updateMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
              <button type="button" onClick={() => { setEditVehicle(null); setEditForm(emptyForm()); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 px-4 py-4">
          <div className="min-w-[220px] flex-1">
            <label className={labelClass}>{t('vehicles.search', 'بحث')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('vehicles.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="button" onClick={applySearch} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                <Search className="size-4" /> {t('common.search')}
              </button>
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className={labelClass}>{t('vehicles.filterByUser')}</label>
            <input
              type="text"
              placeholder={t('vehicles.filterByUserPlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              className={inputClass}
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vehicles.owner')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vehicles.brandModel')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vehicles.plateNumber')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vehicles.color')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('vehicles.isDefault')}</th>
                    <th className="w-36 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <Car className="mx-auto mb-2 size-10 text-slate-300" />
                        {t('vehicles.noVehicles')}
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <User className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{userLabel(v)}</p>
                              {v.user?.id && (
                                <Link to={`/users/${v.user.id}`} className="text-xs text-indigo-600 hover:underline">
                                  {t('vehicles.viewUser', 'عرض المستخدم')}
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{vehicleLabel(v)}</p>
                          {v.vehicleModel?.nameAr && <p className="text-xs text-slate-500">{v.vehicleModel.nameAr}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-700">{displayPlateNumber(v)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{v.color ?? '—'}</td>
                        <td className="px-4 py-3">
                          {v.isDefault ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              {t('vehicles.default')}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/users/${v.user?.id}`}
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              title={t('common.viewDetails')}
                            >
                              <Eye className="size-5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEdit(v)}
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              title={t('common.edit')}
                            >
                              <Pencil className="size-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(v)}
                              disabled={deleteMutation.isPending}
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title={t('common.delete')}
                            >
                              <Trash2 className="size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
              disabled={isLoading}
            />
          </>
        )}
      </Card>
    </div>
  );
}
