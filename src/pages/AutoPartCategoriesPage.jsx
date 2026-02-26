import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Folder, Tag } from 'lucide-react';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { useConfirm } from '../hooks/useConfirm';
import { Card } from '../components/ui/Card';
import { API_BASE_URL } from '../config/env';

// Category Tree Item Component
function CategoryItem({ category, onEdit, onDelete, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;

  const getImageSrc = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : (API_BASE_URL || '') + url;
  };

  const imageUrl = getImageSrc(category.imageUrl || category.icon);

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm border-b border-slate-50 ${depth > 0 ? 'ltr:ml-8 rtl:mr-8 ltr:border-l rtl:border-r border-slate-100 ltr:pl-4 rtl:pr-4' : ''}`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4 rtl:rotate-180" />}
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-10 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden text-slate-400">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <Folder className={`size-5 ${depth === 0 ? 'text-indigo-400' : 'text-slate-300'}`} />
            )}
          </div>
          <div className="flex flex-col min-w-0 text-right sm:text-left">
            <span className="font-semibold text-slate-900 truncate">{category.nameAr || category.name}</span>
            <span className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{category.name}</span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center px-4 shrink-0 border-x border-slate-50">
          <span className="text-sm font-bold text-indigo-600">{category._count?.parts || 0}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">قطع غيار</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category.id)}
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Edit2 className="size-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="space-y-1 mt-1">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AutoPartCategoriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openConfirm, ConfirmModal] = useConfirm();
  const [activeTab, setActiveTab] = useState('CAR'); // CAR, MOTORCYCLE

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['categories-tree', activeTab],
    queryFn: () => autoPartCategoryService.getCategoryTree({
      vehicleType: activeTab === 'CAR' ? 'CAR' : 'MOTORCYCLE'
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => autoPartCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const handleEdit = (id) => {
    navigate(`/auto-part-categories/${id}/edit`);
  };

  const handleDelete = async (category) => {
    const ok = await openConfirm({
      title: t('common.delete'),
      message: t('common.confirmDelete', { name: category.nameAr || category.name }),
      variant: 'danger'
    });
    if (ok) deleteMutation.mutate(category.id);
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('nav.auto-part-categories')}</h1>
          <p className="text-slate-500">إدارة تصنيفات قطع الغيار للسيارات والدراجات</p>
        </div>
        <Link
          to="/auto-part-categories/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
        >
          <Plus className="size-4" />
          {t('categories.newCategory')}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('CAR')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'CAR' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            قطع غيار سيارات
          </button>
          <button
            onClick={() => setActiveTab('MOTORCYCLE')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'MOTORCYCLE' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            دراجات نارية
          </button>
        </div>

        <div className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
          {activeTab === 'CAR' ? 'Car Parts Directory' : 'Motorcycle Parts Directory'}
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-sm shadow-slate-200/60 bg-slate-50/50 p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="size-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">{t('common.loading')}</p>
          </div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="size-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Folder className="size-8" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">{activeTab === 'CAR' ? 'لا توجد فئات سيارات' : 'لا توجد فئات دراجات'}</p>
              <p className="text-slate-500 max-w-xs">ابدأ بإضافة أول فئة لهذا القسم من زر الإضافة في الأعلى</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="px-3 py-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex-1 ltr:pl-11 rtl:pr-11">هيكل الأقسام</span>
              <span className="hidden sm:block px-10">الحجم</span>
              <span className="px-6">التحكم</span>
            </div>
            {tree.map(cat => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
        <Tag className="size-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-800 leading-relaxed">
          <p className="font-bold mb-1">نصيحة تنظيمية:</p>
          استخدم التبويبات في الأعلى (سيارات / دراجات) لمشاهدة هيكل الأقسام الخاص بكل نوع. هذا التقسيم يساعد العملاء في العثور على ما يحتاجونه بسرعة فائقة في المتجر.
        </div>
      </div>
    </div>
  );
}
