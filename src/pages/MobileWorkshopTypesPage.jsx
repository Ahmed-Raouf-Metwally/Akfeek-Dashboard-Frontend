import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Wrench, Plus, Pencil, Trash2, List, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import mobileWorkshopTypeService from '../services/mobileWorkshopTypeService';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';

export default function MobileWorkshopTypesPage() {
  const queryClient = useQueryClient();
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name: '', nameAr: '', description: '', isActive: true });
  const [expandedTypeId, setExpandedTypeId] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceModalTypeId, setServiceModalTypeId] = useState(null);
  const [editingTypeService, setEditingTypeService] = useState(null);
  const [typeServiceForm, setTypeServiceForm] = useState({ name: '', nameAr: '', description: '', isActive: true });

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['mobile-workshop-types', 'all'],
    queryFn: () => mobileWorkshopTypeService.getAll({ includeInactive: 'true' }),
  });

  const createTypeMutation = useMutation({
    mutationFn: (payload) => mobileWorkshopTypeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      setShowTypeModal(false);
      setTypeForm({ name: '', nameAr: '', description: '', isActive: true });
      setEditingType(null);
      toast.success('تم إضافة نوع الورشة');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل الحفظ'),
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, payload }) => mobileWorkshopTypeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      setShowTypeModal(false);
      setEditingType(null);
      toast.success('تم التحديث');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل التحديث'),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id) => mobileWorkshopTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      toast.success('تم الحذف');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل الحذف'),
  });

  const createTypeServiceMutation = useMutation({
    mutationFn: ({ typeId, payload }) => mobileWorkshopTypeService.createTypeService(typeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      setShowServiceModal(false);
      setServiceModalTypeId(null);
      setEditingTypeService(null);
      setTypeServiceForm({ name: '', nameAr: '', description: '', isActive: true });
      toast.success('تم إضافة الخدمة للنوع');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل الحفظ'),
  });

  const updateTypeServiceMutation = useMutation({
    mutationFn: ({ typeId, serviceId, payload }) => mobileWorkshopTypeService.updateTypeService(typeId, serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      setShowServiceModal(false);
      setServiceModalTypeId(null);
      setEditingTypeService(null);
      toast.success('تم التحديث');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل التحديث'),
  });

  const deleteTypeServiceMutation = useMutation({
    mutationFn: ({ typeId, serviceId }) => mobileWorkshopTypeService.deleteTypeService(typeId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-workshop-types'] });
      toast.success('تم حذف الخدمة');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'فشل الحذف'),
  });

  const openAddTypeService = (type) => {
    setServiceModalTypeId(type.id);
    setEditingTypeService(null);
    setTypeServiceForm({ name: '', nameAr: '', description: '', isActive: true });
    setShowServiceModal(true);
  };

  const openEditTypeService = (type, svc) => {
    setServiceModalTypeId(type.id);
    setEditingTypeService(svc);
    setTypeServiceForm({
      name: svc.name || '',
      nameAr: svc.nameAr || '',
      description: svc.description || '',
      isActive: svc.isActive !== false,
    });
    setShowServiceModal(true);
  };

  const handleSubmitTypeService = (e) => {
    e.preventDefault();
    if (!typeServiceForm.name?.trim()) return toast.error('اسم الخدمة مطلوب');
    if (editingTypeService) {
      updateTypeServiceMutation.mutate({
        typeId: serviceModalTypeId,
        serviceId: editingTypeService.id,
        payload: typeServiceForm,
      });
    } else {
      createTypeServiceMutation.mutate({ typeId: serviceModalTypeId, payload: typeServiceForm });
    }
  };

  const openAddType = () => {
    setEditingType(null);
    setTypeForm({ name: '', nameAr: '', description: '', isActive: true });
    setShowTypeModal(true);
  };

  const openEditType = (type) => {
    setEditingType(type);
    setTypeForm({
      name: type.name || '',
      nameAr: type.nameAr || '',
      description: type.description || '',
      isActive: type.isActive !== false,
    });
    setShowTypeModal(true);
  };

  const handleSubmitType = (e) => {
    e.preventDefault();
    if (!typeForm.name?.trim()) return toast.error('اسم النوع مطلوب');
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, payload: typeForm });
    } else {
      createTypeMutation.mutate(typeForm);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="size-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <List className="size-6 text-indigo-600" /> أنواع الورش المتنقلة
          </h1>
          <p className="text-slate-500">أضف أنواع الورش ثم افتح كل نوع لإضافة خدمات داخل النوع (الفيندور يربط خدمته بأحدها أو بدون نوع)</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/mobile-workshops"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Wrench className="size-4" /> الورش المتنقلة
          </Link>
          <button
            type="button"
            onClick={openAddType}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="size-4" /> إضافة نوع ورشة
          </button>
        </div>
      </div>

      <Card className="p-4">
        {types.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <List className="size-12 mx-auto text-slate-300 mb-3" />
            <p>لا توجد أنواع ورش متنقلة بعد.</p>
            <p className="text-sm mt-1">أضف نوعاً (مثل: تغيير زيت، إطارات) — كل نوع = خدمة واحدة.</p>
            <button
              type="button"
              onClick={openAddType}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="size-4" /> إضافة نوع ورشة
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {types.map((type) => {
              const typeServices = type.typeServices ?? [];
              const isExpanded = expandedTypeId === type.id;
              return (
                <li key={type.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => setExpandedTypeId(isExpanded ? null : type.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{type.nameAr || type.name}</p>
                      {type.nameAr && type.name && <p className="text-xs text-slate-400">{type.name}</p>}
                      {type.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{type.description}</p>}
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                      {typeServices.length} خدمة
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {type.isActive ? 'نشط' : 'موقوف'}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => { setExpandedTypeId(type.id); openAddTypeService(type); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                        title="إضافة خدمة لهذا النوع"
                      >
                        <Plus className="size-4" /> إضافة خدمة
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditType(type)}
                        className="p-2 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                        title="تعديل النوع"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.confirm('حذف هذا النوع؟') && deleteTypeMutation.mutate(type.id)}
                        className="p-2 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"
                        title="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Settings2 className="size-4" /> خدمات هذا النوع (يضيفها الأدمن — الفيندور يربط خدمته بأحدها أو بدون نوع)
                        </h4>
                        <button
                          type="button"
                          onClick={() => openAddTypeService(type)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                          <Plus className="size-4" /> إضافة خدمة للنوع
                        </button>
                      </div>
                      {typeServices.length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">لا توجد خدمات مضافة لهذا النوع. يمكن للفيندور إضافة خدمات بدون ربط بنوع.</p>
                      ) : (
                        <ul className="space-y-2">
                          {typeServices.map((svc) => (
                            <li key={svc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <span className="font-medium text-slate-800">{svc.nameAr || svc.name}</span>
                              {svc.nameAr && svc.name && <span className="text-xs text-slate-400">{svc.name}</span>}
                              {svc.description && <span className="text-xs text-slate-500 truncate max-w-[200px]">{svc.description}</span>}
                              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {svc.isActive ? 'نشط' : 'موقوف'}
                              </span>
                              <button type="button" onClick={() => openEditTypeService(type, svc)} className="p-1.5 rounded border border-slate-200 text-indigo-600 hover:bg-indigo-50" title="تعديل"><Pencil className="size-4" /></button>
                              <button type="button" onClick={() => window.confirm('حذف هذه الخدمة من النوع؟') && deleteTypeServiceMutation.mutate({ typeId: type.id, serviceId: svc.id })} className="p-1.5 rounded border border-slate-200 text-red-500 hover:bg-red-50" title="حذف"><Trash2 className="size-4" /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Modal: إضافة/تعديل نوع ورشة — إدخال يدوي للاسم */}
      <Modal open={showTypeModal} onClose={() => { setShowTypeModal(false); setEditingType(null); }} title={editingType ? 'تعديل نوع الورشة' : 'إضافة نوع ورشة'}>
        <form onSubmit={handleSubmitType} className="space-y-4">
          <Input label="اسم النوع (EN) *" name="name" value={typeForm.name} onChange={(e) => setTypeForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="اسم النوع (عربي)" name="nameAr" value={typeForm.nameAr} onChange={(e) => setTypeForm((p) => ({ ...p, nameAr: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
            <textarea name="description" value={typeForm.description} onChange={(e) => setTypeForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={typeForm.isActive} onChange={(e) => setTypeForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-slate-300 text-indigo-600" />
            <span className="text-sm text-slate-700">نشط</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTypeModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="submit" disabled={createTypeMutation.isPending || updateTypeMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Modal: إضافة/تعديل خدمة نوع الورشة */}
      <Modal open={showServiceModal} onClose={() => { setShowServiceModal(false); setServiceModalTypeId(null); setEditingTypeService(null); }} title={editingTypeService ? 'تعديل خدمة النوع' : 'إضافة خدمة لنوع الورشة'}>
        <form onSubmit={handleSubmitTypeService} className="space-y-4">
          <Input label="اسم الخدمة *" value={typeServiceForm.name} onChange={(e) => setTypeServiceForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="الاسم بالعربي" value={typeServiceForm.nameAr} onChange={(e) => setTypeServiceForm((p) => ({ ...p, nameAr: e.target.value }))} dir="rtl" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
            <textarea value={typeServiceForm.description} onChange={(e) => setTypeServiceForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={typeServiceForm.isActive} onChange={(e) => setTypeServiceForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-slate-300 text-indigo-600" />
            <span className="text-sm text-slate-700">نشط</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowServiceModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="submit" disabled={createTypeServiceMutation.isPending || updateTypeServiceMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">حفظ</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
