import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function EditVendorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        businessName: '',
        businessNameAr: '',
        description: '',
        descriptionAr: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        country: 'SA',
        vendorType: 'AUTO_PARTS',
        commercialLicense: '',
        taxNumber: '',
    });

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
                contactEmail: vendor.contactEmail || '',
                contactPhone: vendor.contactPhone || '',
                address: vendor.address || '',
                city: vendor.city || '',
                country: vendor.country || 'SA',
                vendorType: vendor.vendorType || 'AUTO_PARTS',
                commercialLicense: vendor.commercialLicense || '',
                taxNumber: vendor.taxNumber || '',
            });
        }
    }, [vendor]);

    const VENDOR_TYPE_OPTIONS = [
        { value: 'AUTO_PARTS', labelEn: 'Auto Parts / Products', labelAr: 'قطع الغيار / المنتجات' },
        { value: 'COMPREHENSIVE_CARE', labelEn: 'Comprehensive Care', labelAr: 'العناية الشاملة' },
        { value: 'CERTIFIED_WORKSHOP', labelEn: 'Certified Workshop', labelAr: 'الورش المعتمدة' },
        { value: 'CAR_WASH', labelEn: 'Car Wash', labelAr: 'خدمة الغسيل' },
        { value: 'ADHMN_AKFEEK', labelEn: 'Adhmn Akfeek', labelAr: 'أضمن أكفيك' },
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
        </div>
    );
}
