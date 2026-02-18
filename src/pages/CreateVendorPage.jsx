import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessNameAr: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    country: 'SA',
    userId: '', // Admin creates for a user
    vendorType: 'AUTO_PARTS', // AUTO_PARTS | COMPREHENSIVE_CARE | CERTIFIED_WORKSHOP | CAR_WASH
  });

  const VENDOR_TYPE_OPTIONS = [
    { value: 'AUTO_PARTS', labelEn: 'Auto Parts / Products', labelAr: 'قطع الغيار / المنتجات' },
    { value: 'COMPREHENSIVE_CARE', labelEn: 'Comprehensive Care', labelAr: 'العناية الشاملة' },
    { value: 'CERTIFIED_WORKSHOP', labelEn: 'Certified Workshop', labelAr: 'الورش المعتمدة' },
    { value: 'CAR_WASH', labelEn: 'Car Wash', labelAr: 'خدمة الغسيل' },
  ];

  const createMutation = useMutation({
    mutationFn: (data) => vendorService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor profile created successfully');
      navigate('/vendors');
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.normalized?.message || err?.message || 'Failed to create vendor';
      const is409 = err?.response?.status === 409;
      toast.error(is409 ? (msg || 'البريد أو رقم الهاتف مسجل مسبقاً. استخدم بريداً آخر أو اختر "ربط بمستخدم موجود".') : msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vendors" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Vendor</h1>
          <p className="text-slate-500">Create a new vendor profile for a user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">طريقة إضافة الحساب / Account type</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="accountType"
                  checked={createNewAccount}
                  onChange={() => setCreateNewAccount(true)}
                  className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <UserPlus className="size-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-800">إنشاء حساب جديد للفيندور / Create new vendor account</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="accountType"
                  checked={!createNewAccount}
                  onChange={() => setCreateNewAccount(false)}
                  className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-800">ربط بمستخدم موجود (User ID) / Link existing user</span>
              </label>
            </div>
          </div>

          {createNewAccount ? (
            <div className="grid gap-6 sm:grid-cols-2 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
              <h3 className="sm:col-span-2 text-sm font-semibold text-indigo-900">بيانات تسجيل الدخول / Login credentials</h3>
              <Input label="Email" name="email" type="email" value={accountData.email} onChange={handleAccountChange} required />
              <Input label="Password" name="password" type="password" value={accountData.password} onChange={handleAccountChange} required />
              <Input label="First Name" name="firstName" value={accountData.firstName} onChange={handleAccountChange} required />
              <Input label="Last Name" name="lastName" value={accountData.lastName} onChange={handleAccountChange} required />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <Input
                label="User ID (UUID)"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="e.g. 550e8400-e29b-..."
                required={!createNewAccount}
                helperText="The existing user UUID (must already have role VENDOR)."
              />
            </div>
          )}

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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
