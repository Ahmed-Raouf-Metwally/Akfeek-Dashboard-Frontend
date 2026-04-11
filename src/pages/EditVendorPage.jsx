import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Percent, Info, Camera, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';
import VendorDocuments from '../components/VendorDocuments';

export default function EditVendorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        businessName: '',
        businessNameAr: '',
        description: '',
        descriptionAr: '',
        termsAndConditions: '',
        termsAndConditionsAr: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        country: 'SA',
        vendorType: 'AUTO_PARTS',
        commercialLicense: '',
        taxNumber: '',
        commissionPercent: '',
    });

    const logoInputRef   = useRef(null);
    const bannerInputRef = useRef(null);

    const uploadImageMutation = useMutation({
        mutationFn: ({ file, type }) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', type);
            return api.post(`/vendors/${id}/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: (_, { type }) => {
            queryClient.invalidateQueries({ queryKey: ['vendor', id] });
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            toast.success(type === 'logo' ? 'تم رفع الشعار بنجاح' : 'تم رفع الغلاف بنجاح');
        },
        onError: () => toast.error('فشل رفع الصورة'),
    });

    const handleImagePick = (type) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadImageMutation.mutate({ file, type });
        e.target.value = '';
    };

    const { data: vendor, isLoading: isLoadingVendor } = useQuery({
        queryKey: ['vendor', id],
        queryFn: () => vendorService.getVendorById(id),
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                businessName: vendor.businessName || '',
                businessNameAr: vendor.businessNameAr || '',
                description: vendor.description || '',
                descriptionAr: vendor.descriptionAr || '',
                termsAndConditions: vendor.termsAndConditions || '',
                termsAndConditionsAr: vendor.termsAndConditionsAr || '',
                contactEmail: vendor.contactEmail || '',
                contactPhone: vendor.contactPhone || '',
                address: vendor.address || '',
                city: vendor.city || '',
                country: vendor.country || 'SA',
                vendorType: vendor.vendorType || 'AUTO_PARTS',
                commercialLicense: vendor.commercialLicense || '',
                taxNumber: vendor.taxNumber || '',
                commissionPercent: vendor.commissionPercent != null ? String(vendor.commissionPercent) : '',
            });
        }
    }, [vendor]);

    const VENDOR_TYPE_OPTIONS = [
        { value: 'AUTO_PARTS',         labelEn: 'Auto Parts / Products',  labelAr: 'قطع الغيار / المنتجات' },
        { value: 'COMPREHENSIVE_CARE', labelEn: 'Comprehensive Care',     labelAr: 'العناية الشاملة' },
        { value: 'CERTIFIED_WORKSHOP', labelEn: 'Certified Workshop',     labelAr: 'الورش المعتمدة' },
        { value: 'CAR_WASH',           labelEn: 'Car Wash',               labelAr: 'خدمة الغسيل' },
        { value: 'MOBILE_WORKSHOP',    labelEn: 'Mobile Workshop',        labelAr: 'الورشة المتنقلة' },
        { value: 'TOWING_SERVICE',     labelEn: 'Towing / Winch Service', labelAr: 'خدمة السحب والونش' },
    ];

    const updateMutation = useMutation({
        mutationFn: (data) => vendorService.updateVendor(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            queryClient.invalidateQueries({ queryKey: ['vendor', id] });
            toast.success('Vendor profile updated successfully');
            navigate(`/vendors/${id}`);
        },
        onError: (err) => {
            toast.error(err?.message || 'Failed to update vendor');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoadingVendor) return <div className="p-8 text-center text-slate-500">Loading vendor details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to={`/vendors/${id}`} className="rounded-lg p-2 hover:bg-slate-100">
                    <ArrowLeft className="size-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>
                    <p className="text-slate-500">Update vendor profile information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">

                    {/* ── Images Section ── */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">الصور / Images</h3>

                        {/* Banner */}
                        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500">
                            {vendor?.banner && (
                                <img src={vendor.banner} alt="banner" className="h-full w-full object-cover" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/30">
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={uploadImageMutation.isPending}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white"
                                >
                                    {uploadImageMutation.isPending && uploadImageMutation.variables?.type === 'banner'
                                        ? <Loader2 className="size-3.5 animate-spin" />
                                        : <ImagePlus className="size-3.5" />}
                                    {vendor?.banner ? 'تغيير الغلاف' : 'رفع غلاف'}
                                </button>
                            </div>
                            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick('banner')} />

                            {/* Logo over banner */}
                            <div className="absolute bottom-3 left-4 flex items-end gap-3">
                                <div className="relative size-16 overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg">
                                    {vendor?.logo ? (
                                        <img src={vendor.logo} alt="logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-300">
                                            {vendor?.businessName?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadImageMutation.isPending}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl"
                                    >
                                        {uploadImageMutation.isPending && uploadImageMutation.variables?.type === 'logo'
                                            ? <Loader2 className="size-5 animate-spin text-white" />
                                            : <Camera className="size-5 text-white" />}
                                    </button>
                                </div>
                                <div className="mb-1">
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadImageMutation.isPending}
                                        className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-white"
                                    >
                                        <Camera className="size-3" />
                                        {vendor?.logo ? 'تغيير الشعار' : 'رفع شعار'}
                                    </button>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick('logo')} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">PNG، JPG، WebP — الحد الأقصى 5MB</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Vendor Type / نوع الفيندور</label>
                            <select
                                name="vendorType"
                                value={formData.vendorType}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {VENDOR_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.labelEn} / {opt.labelAr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Business Name (English)"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Business Name (Arabic)"
                            name="businessNameAr"
                            value={formData.businessNameAr}
                            onChange={handleChange}
                            required
                            dir="rtl"
                        />

                        <Input
                            label="Contact Email"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Contact Phone"
                            name="contactPhone"
                            type="tel"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Commercial License"
                            name="commercialLicense"
                            value={formData.commercialLicense}
                            onChange={handleChange}
                        />
                        <Input
                            label="Tax Number"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleChange}
                        />

                        <div className="sm:col-span-2">
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Country Code"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            maxLength={2}
                        />

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description (En)</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description (Ar)</label>
                            <textarea
                                name="descriptionAr"
                                rows={3}
                                value={formData.descriptionAr}
                                onChange={handleChange}
                                dir="rtl"
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        {/* ── Terms and Conditions Section ── */}
                        <div className="sm:col-span-2 border-t border-slate-200 pt-4 mt-4">
                            <h3 className="font-semibold text-slate-900 mb-3">الشروط والأحكام / Terms and Conditions</h3>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Terms and Conditions (English)</label>
                            <textarea
                                name="termsAndConditions"
                                rows={4}
                                value={formData.termsAndConditions}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">الشروط والأحكام (العربية)</label>
                            <textarea
                                name="termsAndConditionsAr"
                                rows={4}
                                value={formData.termsAndConditionsAr}
                                onChange={handleChange}
                                dir="rtl"
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* ── Commission Section ── */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Percent className="size-5 text-amber-600" />
                            <h3 className="font-semibold text-amber-900">
                                Platform Commission / نسبة عمولة التطبيق
                            </h3>
                        </div>

                        <div className="flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-800">
                            <Info className="size-4 mt-0.5 shrink-0" />
                            <p>
                                تحديد نسبة مخصصة لهذا الفيندور تتجاوز الإعداد العام.
                                اتركه فارغاً لاستخدام النسبة العامة للنظام.
                                <br />
                                <span className="font-medium">Set a custom rate that overrides the global system setting.
                                Leave empty to use the global commission rate.</span>
                            </p>
                        </div>

                        <div className="max-w-xs">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Commission % / نسبة العمولة
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="commissionPercent"
                                    value={formData.commissionPercent}
                                    onChange={handleChange}
                                    placeholder="e.g. 8.5 — leave empty for global default"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 font-medium">%</span>
                            </div>
                            {formData.commissionPercent !== '' && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                    من كل {(100 - parseFloat(formData.commissionPercent || 0)).toFixed(1)}% تذهب للفيندور
                                    ·&nbsp;
                                    {parseFloat(formData.commissionPercent || 0).toFixed(1)}% تذهب للتطبيق
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Save className="size-4" />
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </Card>
            </form>

            {/* ── Documents Section ── */}
            <VendorDocuments vendorId={id} />
        </div>
    );
}
