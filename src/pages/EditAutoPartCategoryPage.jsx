import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { autoPartService } from '../services/autoPartService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';
import { API_BASE_URL } from '../config/env';

export default function EditAutoPartCategoryPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        imageUrl: '',
        vehicleType: 'SEDAN',
        icon: '',
    });

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch current category data
    const { data: category, isLoading: loadingCategory } = useQuery({
        queryKey: ['category', id],
        queryFn: () => autoPartCategoryService.getCategoryById(id),
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                nameAr: category.nameAr || '',
                description: category.description || '',
                descriptionAr: category.descriptionAr || '',
                imageUrl: category.imageUrl || '',
                vehicleType: category.vehicleType || 'SEDAN',
                icon: category.icon || '',
            });
        }
    }, [category]);

    const updateMutation = useMutation({
        mutationFn: (data) => autoPartCategoryService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', id] });
            toast.success(t('common.success'));
            navigate('/auto-part-categories');
        },
        onError: (err) => toast.error(err?.message || t('common.error')),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await autoPartService.uploadImages([file]);
            const finalUrl = Array.isArray(url) ? url[0] : url;
            setFormData(prev => ({ ...prev, imageUrl: finalUrl }));
            toast.success('Image uploaded');
        } catch (err) {
            toast.error(err?.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const getImageSrc = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : (API_BASE_URL || '') + url;
    };

    if (loadingCategory) {
        return <div className="p-8 text-center">{t('common.loading')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/auto-part-categories" className="rounded-lg p-2 hover:bg-slate-100">
                    <ArrowLeft className="size-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('categories.editCategory')}</h1>
                    <p className="text-slate-500">{t('categories.subtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-6">
                        <h3 className="font-semibold text-slate-900">بيانات القسم</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Input
                                label={t('common.nameEn')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label={t('common.nameAr')}
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                dir="rtl"
                                required
                            />
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('common.details')} (EN)</label>
                                <textarea
                                    rows={3}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('common.details')} (AR)</label>
                                <textarea
                                    rows={3}
                                    dir="rtl"
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={formData.descriptionAr}
                                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6">
                        <h3 className="font-semibold text-slate-900">{t('workshops.images.title')}</h3>
                        <div className="flex items-start gap-4">
                            {formData.imageUrl ? (
                                <div className="relative group">
                                    <img
                                        src={getImageSrc(formData.imageUrl)}
                                        alt="Category"
                                        className="h-32 w-32 rounded-lg border-2 border-indigo-100 object-cover bg-slate-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 shadow hover:bg-red-600 transition-colors"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="h-32 w-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all disabled:opacity-50"
                                >
                                    <Upload className="size-8" />
                                    <span className="text-xs font-medium">{uploading ? 'جاري الرفع...' : t('workshops.images.uploadImages')}</span>
                                </button>
                            )}
                            <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-slate-700">{t('workshops.images.gallery')}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {t('workshops.images.imagesHint', { max: 1 })}
                                    <br />
                                    {t('workshops.images.maxSize', { size: 5 })}
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold text-slate-900">تصنيف القسم (Classification)</h3>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">نوع المركبات</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, vehicleType: 'SEDAN' })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.vehicleType !== 'MOTORCYCLE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                >
                                    <span className="text-sm font-bold">قطع غيار سيارات</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, vehicleType: 'MOTORCYCLE' })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.vehicleType === 'MOTORCYCLE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                >
                                    <span className="text-sm font-bold">دراجات نارية</span>
                                </button>
                            </div>
                        </div>
                    </Card>

                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                        <Save className="size-4" />
                        {updateMutation.isPending ? t('common.loading') : t('common.update')}
                    </button>
                </div>
            </form>
        </div>
    );
}
