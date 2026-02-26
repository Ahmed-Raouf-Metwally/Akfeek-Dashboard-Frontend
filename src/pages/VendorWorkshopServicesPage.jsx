import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Pencil, Trash2, Wrench, Save, X } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';
import toast from 'react-hot-toast';

export default function VendorWorkshopServicesPage() {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isAr = i18n.language === 'ar';

    const [services, setServices] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [serviceName, setServiceName] = useState('');

    const { data: workshop, isLoading, isError } = useQuery({
        queryKey: ['workshop', 'me'],
        queryFn: () => workshopService.getMyWorkshop(),
        retry: (_, err) => err?.response?.status !== 403 && err?.response?.status !== 404,
    });

    useEffect(() => {
        if (workshop?.services) {
            let parsedServices = [];
            if (Array.isArray(workshop.services)) {
                parsedServices = workshop.services;
            } else if (typeof workshop.services === 'string') {
                try {
                    const parsed = JSON.parse(workshop.services);
                    parsedServices = Array.isArray(parsed) ? parsed : [workshop.services];
                } catch {
                    parsedServices = workshop.services.includes(',')
                        ? workshop.services.split(',').map(s => s.trim())
                        : [workshop.services];
                }
            }
            setServices(parsedServices.filter(Boolean));
        }
    }, [workshop]);

    const updateMutation = useMutation({
        mutationFn: (newServices) => workshopService.updateMyWorkshop({
            services: JSON.stringify(newServices)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workshop', 'me'] });
            toast.success(isAr ? 'تم تحديث الخدمات بنجاح' : 'Services updated successfully');
            setShowAddModal(false);
            setEditingIndex(null);
            setServiceName('');
        },
        onError: (err) => {
            toast.error(err?.message || (isAr ? 'فشل التحديث' : 'Update failed'));
        }
    });

    const handleAddService = (e) => {
        e.preventDefault();
        if (!serviceName.trim()) return;
        const newServices = [...services, serviceName.trim()];
        updateMutation.mutate(newServices);
    };

    const handleEditService = (e) => {
        e.preventDefault();
        if (!serviceName.trim() || editingIndex === null) return;
        const newServices = [...services];
        newServices[editingIndex] = serviceName.trim();
        updateMutation.mutate(newServices);
    };

    const handleDeleteService = (index) => {
        if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) return;
        const newServices = services.filter((_, i) => i !== index);
        updateMutation.mutate(newServices);
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setServiceName('');
        setShowAddModal(true);
    };

    const openEditModal = (index) => {
        setEditingIndex(index);
        setServiceName(services[index]);
        setShowAddModal(true);
    };

    if (user?.role !== 'VENDOR' || user?.vendorType !== 'CERTIFIED_WORKSHOP') {
        return (
            <div className="space-y-6">
                <Card className="p-8 text-center">
                    <p className="text-slate-600">{isAr ? 'هذه الصفحة متاحة لفيندور الورش المعتمدة فقط.' : 'This page is only available for certified workshop vendors.'}</p>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card className="p-6">
                    <Skeleton className="h-64 w-full" />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/vendor/workshop"
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        aria-label={isAr ? 'الرجوع للورشة' : 'Back to workshop'}
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'إدارة الخدمات' : 'Manage Services'}</h1>
                        <p className="text-sm text-slate-500">{workshop?.nameAr || workshop?.name}</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-sm"
                >
                    <Plus className="size-4" />
                    {isAr ? 'إضافة خدمة جديدة' : 'Add New Service'}
                </button>
            </div>

            <Card className="overflow-hidden p-0 border-none shadow-sm shadow-slate-200/60 bg-white">
                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                            <Wrench className="size-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{isAr ? 'لا توجد خدمات مضافة' : 'No services added yet'}</h3>
                        <p className="mt-1 text-slate-500 max-w-xs">{isAr ? 'ابدأ بإضافة الخدمات التي تقدمها ورشتك ليتمكن العملاء من رؤيتها عند الحجز.' : 'Start adding services your workshop provides so customers can see them when booking.'}</p>
                        <button
                            onClick={openAddModal}
                            className="mt-6 flex items-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                            <Plus className="size-4" />
                            {isAr ? 'إضافة أول خدمة' : 'Add first service'}
                        </button>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {services.map((service, index) => (
                            <li key={index} className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <span className="font-medium text-slate-700">{service}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(index)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                        title={isAr ? 'تعديل' : 'Edit'}
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(index)}
                                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        title={isAr ? 'حذف' : 'Delete'}
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 self-start">
                    <Wrench className="size-5 text-indigo-600" />
                </div>
                <div className="text-sm text-indigo-900 leading-relaxed">
                    <p className="font-bold mb-1">{isAr ? 'نصيحة لإدارة الخدمات:' : 'Service Management Tip:'}</p>
                    {isAr
                        ? 'احرص على إضافة أسماء الخدمات بوضوح (مثال: توضيب مكينة، فحص كمبيوتر، غيار زيت). هذا يساعد في ظهور ورشتك للعملاء المهتمين بهذه الخدمات المحددة.'
                        : 'Make sure to add service names clearly (e.g. Engine Overhaul, Computer Diagnosis, Oil Change). This helps your workshop appear to customers interested in these specific services.'}
                </div>
            </div>

            <Modal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingIndex !== null ? (isAr ? 'تعديل خدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}
            >
                <form onSubmit={editingIndex !== null ? handleEditService : handleAddService} className="space-y-4">
                    <Input
                        label={isAr ? 'اسم الخدمة' : 'Service Name'}
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder={isAr ? 'مثال: غيار زيت المحرك' : 'e.g. Engine Oil Change'}
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {updateMutation.isPending ? <Skeleton className="size-4 rounded-full" /> : (editingIndex !== null ? <Save className="size-4" /> : <Plus className="size-4" />)}
                            {editingIndex !== null ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الخدمة' : 'Add Service')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
