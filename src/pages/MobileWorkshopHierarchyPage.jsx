import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  FolderTree,
  Layers3,
  Plus,
  Pencil,
  Trash2,
  Wrench,
} from 'lucide-react';
import mobileWorkshopHierarchyService from '../services/mobileWorkshopHierarchyService';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';

const EMPTY_CATALOG = { name: '', nameAr: '', imageUrl: '', sortOrder: 0, isActive: true };
const EMPTY_CATEGORY = { name: '', nameAr: '', imageUrl: '', sortOrder: 0, isActive: true };
const EMPTY_SERVICE = {
  name: '',
  nameAr: '',
  imageUrl: '',
  price: '',
  currency: 'SAR',
  pricingNoteAr: '',
  sortOrder: 0,
  isActive: true,
};

function boolLabel(v) {
  return v ? 'نشط' : 'موقوف';
}

function SectionBadge({ active }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
      {boolLabel(active)}
    </span>
  );
}

function CatalogModal({ open, onClose, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || EMPTY_CATALOG);
  React.useEffect(() => setForm(initialData || EMPTY_CATALOG), [initialData, open]);

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'تعديل الكاتالوج' : 'إضافة كاتالوج'} size="md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input label="الاسم *" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input label="الاسم بالعربي" name="nameAr" value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
        <Input label="رابط الصورة" name="imageUrl" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <Input label="الترتيب" type="number" name="sortOrder" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          <span className="text-sm text-slate-700">نشط</span>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryModal({ open, onClose, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || EMPTY_CATEGORY);
  React.useEffect(() => setForm(initialData || EMPTY_CATEGORY), [initialData, open]);

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'تعديل التصنيف' : 'إضافة تصنيف'} size="md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input label="الاسم *" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input label="الاسم بالعربي" name="nameAr" value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
        <Input label="رابط الصورة" name="imageUrl" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <Input label="الترتيب" type="number" name="sortOrder" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          <span className="text-sm text-slate-700">نشط</span>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceModal({ open, onClose, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData || EMPTY_SERVICE);
  React.useEffect(() => setForm(initialData || EMPTY_SERVICE), [initialData, open]);

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'تعديل الخدمة' : 'إضافة خدمة'} size="md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input label="الاسم *" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input label="الاسم بالعربي" name="nameAr" value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
        <Input label="رابط الصورة" name="imageUrl" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <Input label="السعر" type="number" name="price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="العملة" name="currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} />
          <Input label="الترتيب" type="number" name="sortOrder" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ملاحظة التسعير بالعربي</label>
          <textarea
            rows={2}
            value={form.pricingNoteAr}
            onChange={(e) => setForm((p) => ({ ...p, pricingNoteAr: e.target.value }))}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          <span className="text-sm text-slate-700">نشط</span>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryCard({ category, catalogId }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['mobile-workshop-hierarchy', 'services', category.id],
    queryFn: () => mobileWorkshopHierarchyService.listServices(category.id, { includeInactive: 'true' }),
    enabled: expanded,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopHierarchyService.updateCategory(category.id, {
      ...payload,
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'categories', catalogId] });
      setShowModal(false);
      toast.success('تم تحديث التصنيف');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => mobileWorkshopHierarchyService.deleteCategory(category.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'categories', catalogId] });
      toast.success('تم حذف التصنيف');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الحذف'),
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopHierarchyService.createService(category.id, {
      ...payload,
      price: payload.price === '' ? null : Number(payload.price),
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'services', category.id] });
      setShowServiceModal(false);
      toast.success('تمت إضافة الخدمة');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الإضافة'),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => mobileWorkshopHierarchyService.updateService(id, {
      ...payload,
      price: payload.price === '' ? null : Number(payload.price),
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'services', category.id] });
      setShowServiceModal(false);
      setEditingService(null);
      toast.success('تم تحديث الخدمة');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل التحديث'),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId) => mobileWorkshopHierarchyService.deleteService(serviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'services', category.id] });
      toast.success('تم حذف الخدمة');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الحذف'),
  });

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{category.nameAr || category.name}</p>
            {category.nameAr && category.name && <p className="text-xs text-slate-400">{category.name}</p>}
          </div>
          <span className="text-xs text-slate-400">ترتيب: {category.sortOrder ?? 0}</span>
          <SectionBadge active={category.isActive} />
          <button type="button" onClick={() => setShowServiceModal(true)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">
            <Plus className="size-3.5" /> خدمة
          </button>
          <button type="button" onClick={() => setShowModal(true)} className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50">
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={() => window.confirm('حذف التصنيف؟') && deleteMutation.mutate()} className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50">
            <Trash2 className="size-4" />
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {isLoading ? (
              <div className="text-sm text-slate-400">جاري تحميل الخدمات...</div>
            ) : services.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">لا توجد خدمات داخل هذا التصنيف.</div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{service.nameAr || service.name}</p>
                      {service.nameAr && service.name && <p className="text-xs text-slate-400">{service.name}</p>}
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {service.price != null ? `${service.price}` : '—'} {service.currency || 'SAR'}
                    </span>
                    <SectionBadge active={service.isActive} />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService({
                          ...service,
                          price: service.price ?? service.priceMin ?? '',
                          sortOrder: service.sortOrder ?? 0,
                          pricingNoteAr: service.pricingNoteAr ?? '',
                        });
                        setShowServiceModal(true);
                      }}
                      className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('حذف الخدمة؟') && deleteServiceMutation.mutate(service.id)}
                      className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {service.pricingNoteAr && <p className="mt-2 text-xs text-slate-500">{service.pricingNoteAr}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <CategoryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={{
          name: category.name || '',
          nameAr: category.nameAr || '',
          imageUrl: category.imageUrl || '',
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive ?? true,
        }}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        loading={updateMutation.isPending}
      />

      <ServiceModal
        open={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        initialData={editingService || EMPTY_SERVICE}
        onSubmit={(payload) => {
          if (editingService?.id) updateServiceMutation.mutate({ id: editingService.id, payload });
          else createServiceMutation.mutate(payload);
        }}
        loading={createServiceMutation.isPending || updateServiceMutation.isPending}
      />
    </>
  );
}

function CatalogCard({ catalog }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['mobile-workshop-hierarchy', 'categories', catalog.id],
    queryFn: () => mobileWorkshopHierarchyService.listCategories(catalog.id, { includeInactive: 'true' }),
    enabled: expanded,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopHierarchyService.updateCatalog(catalog.id, {
      ...payload,
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'catalogs'] });
      setShowModal(false);
      toast.success('تم تحديث الكاتالوج');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => mobileWorkshopHierarchyService.deleteCatalog(catalog.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'catalogs'] });
      toast.success('تم حذف الكاتالوج');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الحذف'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopHierarchyService.createCategory(catalog.id, {
      ...payload,
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'categories', catalog.id] });
      setShowCategoryModal(false);
      setExpanded(true);
      toast.success('تمت إضافة التصنيف');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الإضافة'),
  });

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </button>
          <div className="flex flex-1 items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FolderTree className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{catalog.nameAr || catalog.name}</p>
              {catalog.nameAr && catalog.name && <p className="text-xs text-slate-400">{catalog.name}</p>}
              <p className="text-xs text-slate-500">
                السعر: {catalog.priceMin != null ? catalog.priceMin : '—'} - {catalog.priceMax != null ? catalog.priceMax : '—'} {catalog.currency || 'SAR'}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">ترتيب: {catalog.sortOrder ?? 0}</span>
          <SectionBadge active={catalog.isActive} />
          <button type="button" onClick={() => setShowCategoryModal(true)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            <Plus className="size-4" /> تصنيف
          </button>
          <button type="button" onClick={() => setShowModal(true)} className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50">
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={() => window.confirm('حذف الكاتالوج؟') && deleteMutation.mutate()} className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50">
            <Trash2 className="size-4" />
          </button>
        </div>

        {expanded && (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            {isLoading ? (
              <div className="text-sm text-slate-400">جاري تحميل التصنيفات...</div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">لا توجد تصنيفات داخل هذا الكاتالوج.</div>
            ) : (
              categories.map((category) => <CategoryCard key={category.id} category={category} catalogId={catalog.id} />)
            )}
          </div>
        )}
      </Card>

      <CatalogModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={{
          name: catalog.name || '',
          nameAr: catalog.nameAr || '',
          imageUrl: catalog.imageUrl || '',
          sortOrder: catalog.sortOrder ?? 0,
          isActive: catalog.isActive ?? true,
        }}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        loading={updateMutation.isPending}
      />

      <CategoryModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        initialData={EMPTY_CATEGORY}
        onSubmit={(payload) => createCategoryMutation.mutate(payload)}
        loading={createCategoryMutation.isPending}
      />
    </>
  );
}

export default function MobileWorkshopHierarchyPage() {
  const qc = useQueryClient();
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  const { data: catalogs = [], isLoading } = useQuery({
    queryKey: ['mobile-workshop-hierarchy', 'catalogs'],
    queryFn: () => mobileWorkshopHierarchyService.listCatalogs({ includeInactive: 'true' }),
  });

  const stats = useMemo(() => ({
    catalogs: catalogs.length,
    active: catalogs.filter((x) => x.isActive).length,
  }), [catalogs]);

  const createMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopHierarchyService.createCatalog({
      ...payload,
      sortOrder: payload.sortOrder === '' ? 0 : Number(payload.sortOrder),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop-hierarchy', 'catalogs'] });
      setShowCatalogModal(false);
      toast.success('تم إنشاء الكاتالوج');
    },
    onError: (err) => toast.error(err.normalized?.message || err.message || 'فشل الإنشاء'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Layers3 className="size-6 text-indigo-600" />
            إدارة كاتالوج الورش المتنقلة
          </h1>
          <p className="text-slate-500">إدارة الهيكل الهرمي: كاتالوجات ثم تصنيفات ثم خدمات.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCatalogModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="size-4" /> إضافة كاتالوج
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FolderTree className="size-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">عدد الكاتالوجات</p>
              <p className="text-2xl font-bold text-slate-900">{stats.catalogs}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wrench className="size-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الكاتالوجات النشطة</p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}
        </div>
      ) : catalogs.length === 0 ? (
        <Card className="p-10 text-center">
          <FolderTree className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-slate-500">لا توجد كاتالوجات حتى الآن.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {catalogs.map((catalog) => <CatalogCard key={catalog.id} catalog={catalog} />)}
        </div>
      )}

      <CatalogModal
        open={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        initialData={EMPTY_CATALOG}
        onSubmit={(payload) => createMutation.mutate(payload)}
        loading={createMutation.isPending}
      />
    </div>
  );
}
