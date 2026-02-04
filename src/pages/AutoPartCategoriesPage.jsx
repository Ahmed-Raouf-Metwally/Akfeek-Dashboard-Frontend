import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Folder, Tag } from 'lucide-react';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { useConfirm } from '../hooks/useConfirm';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

// Category Tree Item Component
function CategoryItem({ category, onEdit, onDelete, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 p-2 rounded hover:bg-slate-50 border-b border-slate-100 ${depth > 0 ? 'ltr:ml-6 rtl:mr-6 ltr:border-l-2 rtl:border-r-2 border-slate-200 ltr:pl-4 rtl:pr-4' : ''}`}
      >
        <button 
          onClick={() => setExpanded(!expanded)}
          className={`p-1 rounded hover:bg-slate-200 text-slate-500 ${hasChildren ? '' : 'opacity-0'}`}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4 rtl:rotate-180" />}
        </button>
        
        <div className="flex items-center gap-2 flex-1">
          {category.icon ? (
             <img src={category.icon} alt="" className="size-5 object-contain" />
          ) : (
             <Folder className="size-5 text-indigo-400" />
          )}
          <div className="flex flex-col">
             <span className="font-medium text-slate-900">{category.name}</span>
             {category.nameAr && <span className="text-xs text-slate-500">{category.nameAr}</span>}
          </div>
        </div>
        
        <div className="text-xs text-slate-500 px-4">
           {category._count?.parts || 0} items
        </div>

        <div className="flex items-center gap-1">
           <button 
             onClick={() => onEdit(category)}
             className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
           >
             <Edit2 className="size-4" />
           </button>
           <button 
             onClick={() => onDelete(category)}
             className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
           >
             <Trash2 className="size-4" />
           </button>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="ltr:border-l ltr:ml-4 rtl:border-r rtl:mr-4 border-indigo-100">
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
  const queryClient = useQueryClient();
  const [openConfirm, ConfirmModal] = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', nameAr: '', parentId: '' });

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => autoPartCategoryService.getCategoryTree(),
  });

  const { data: flatCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => autoPartCategoryService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => autoPartCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('common.success'));
      resetForm();
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => autoPartCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('common.success'));
      resetForm();
    },
    onError: (err) => toast.error(err?.message || t('common.error')),
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

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', nameAr: '', parentId: '' });
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setFormData({
      id: category.id,
      name: category.name,
      nameAr: category.nameAr || '',
      parentId: category.parentId || '',
    });
  };

  const handleDelete = async (category) => {
    const ok = await openConfirm({
      title: t('common.delete'),
      message: t('common.confirmDelete', {name: category.name}),
      variant: 'danger'
    });
    if (ok) deleteMutation.mutate(category.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      nameAr: formData.nameAr,
      parentId: formData.parentId || null,
    };

    if (formData.id) {
      updateMutation.mutate({ id: formData.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ConfirmModal />
      
      {/* List Column */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('categories.title')}</h1>
          <p className="text-slate-500">{t('categories.subtitle')}</p>
        </div>

        <Card className="p-4 min-h-[500px]">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">{t('common.loading')}</div>
          ) : tree.length === 0 ? (
            <div className="text-center py-12 text-slate-500">{t('common.noData')}</div>
          ) : (
            <div className="space-y-1">
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
      </div>

      {/* Form Column */}
      <div className="space-y-6">
        <div className="h-[60px] hidden lg:block"></div> {/* Spacer for alignment */}
        <Card className="p-6 sticky top-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {isEditing ? t('categories.editCategory') : t('categories.newCategory')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label={t('common.nameEn')} 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label={t('common.nameAr')} 
              value={formData.nameAr} 
              onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
              dir="rtl"
            />
            
            <div>
               <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('categories.parentCategory')}</label>
               <select
                 value={formData.parentId}
                 onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                 className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
               >
                 <option value="">{t('categories.noneRoot')}</option>
                 {flatCategories
                   .filter(c => c.id !== formData.id) // Prevent selecting self as parent
                   .map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                {isEditing ? t('common.update') : t('common.create')}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
