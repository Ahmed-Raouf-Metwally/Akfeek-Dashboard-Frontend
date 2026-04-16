import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, UserPlus, Search, X, CheckCircle2, User, LocateFixed } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { userService } from '../services/userService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const presetType = searchParams.get('type') || 'AUTO_PARTS';

  const [formData, setFormData] = useState({
    businessName: '',
    businessNameAr: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    country: 'SA',
    userId: '',
    vendorType: presetType,
    mobileWorkshopName: '',
    mobileWorkshopNameAr: '',
    mobileWorkshopDescription: '',
    mobileWorkshopCity: '',
    mobileWorkshopLatitude: '',
    mobileWorkshopLongitude: '',
    mobileWorkshopServiceRadius: '30',
  });

  const [createNewAccount, setCreateNewAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const VENDOR_TYPE_OPTIONS = [
    { value: 'AUTO_PARTS',         labelEn: 'Auto Parts / Products',  labelAr: 'قطع الغيار / المنتجات' },
    { value: 'COMPREHENSIVE_CARE', labelEn: 'Comprehensive Care',     labelAr: 'العناية الشاملة' },
    { value: 'CERTIFIED_WORKSHOP', labelEn: 'Certified Workshop',     labelAr: 'الورش المعتمدة' },
    { value: 'CAR_WASH',           labelEn: 'Car Wash',               labelAr: 'خدمة الغسيل' },
    { value: 'MOBILE_WORKSHOP',    labelEn: 'Mobile Workshop',        labelAr: 'الورشة المتنقلة' },
    { value: 'TOWING_SERVICE',     labelEn: 'Towing / Winch Service', labelAr: 'خدمة السحب والونش' },
  ];

  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search by 350ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(userSearch), 350);
    return () => clearTimeout(debounceRef.current);
  }, [userSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Always fetch when in link-user mode
  const { data: usersData, isLoading: isLoadingUsers, isFetching: isFetchingUsers, refetch } = useQuery({
    queryKey: ['users-search', debouncedSearch],
    queryFn: () => userService.getUsers({ search: debouncedSearch || undefined, limit: 20 }),
    enabled: !createNewAccount,
    staleTime: 15_000,
    keepPreviousData: true,
  });

  const users = usersData?.users ?? usersData?.data ?? [];

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
    const payload = { ...formData };
    if (createNewAccount) {
      payload.newAccount = {
        email: accountData.email,
        password: accountData.password,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
      };
      delete payload.userId;
    } else {
      if (!selectedUser) {
        toast.error('الرجاء اختيار مستخدم من قائمة البحث');
        return;
      }
      payload.userId = selectedUser.id;
    }
    createMutation.mutate(payload);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const isMobileWorkshopVendor = formData.vendorType === 'MOBILE_WORKSHOP';

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          mobileWorkshopLatitude: String(pos.coords.latitude),
          mobileWorkshopLongitude: String(pos.coords.longitude),
          mobileWorkshopCity: prev.mobileWorkshopCity || prev.city,
        }));
        toast.success('تم تحديد موقعك الحالي');
      },
      () => {
        toast.error('تعذر الحصول على موقعك الحالي');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vendors" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{formLabels.addVendor}</h1>
          <p className="text-slate-500">{formLabels.createVendorProfile}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">{formLabels.accountType}</p>
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
                <span className="text-sm font-medium text-slate-800">{formLabels.createNewAccount}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="accountType"
                  checked={!createNewAccount}
                  onChange={() => setCreateNewAccount(false)}
                  className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-800">{formLabels.linkExistingUser}</span>
              </label>
            </div>
          </div>

          {createNewAccount ? (
            <div className="grid gap-6 sm:grid-cols-2 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
              <h3 className="sm:col-span-2 text-sm font-semibold text-indigo-900">{formLabels.loginCredentials}</h3>
              <Input label="Email" name="email" type="email" value={accountData.email} onChange={handleAccountChange} required />
              <Input label="Password" name="password" type="password" value={accountData.password} onChange={handleAccountChange} required />
              <Input label="First Name" name="firstName" value={accountData.firstName} onChange={handleAccountChange} required />
              <Input label="Last Name" name="lastName" value={accountData.lastName} onChange={handleAccountChange} required />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">ابحث عن مستخدم / Search User</p>

              {/* Selected user chip */}
              {selectedUser && (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
                  <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-900 truncate">
                      {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                    </p>
                    <p className="text-xs text-green-700 truncate">{selectedUser.email} · {selectedUser.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedUser(null); setUserSearch(''); setFormData(p => ({ ...p, userId: '' })); }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Search input with dropdown */}
              {!selectedUser && (
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setShowDropdown(true); }}
                      onFocus={() => { setShowDropdown(true); refetch(); }}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {(isLoadingUsers || isFetchingUsers) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    )}
                  </div>

                  {/* Results dropdown */}
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                      {isLoadingUsers ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400 animate-pulse">جاري التحميل...</div>
                      ) : users.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                          {debouncedSearch ? `لا توجد نتائج لـ "${debouncedSearch}"` : 'لا يوجد مستخدمون'}
                        </div>
                      ) : (
                        <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {users.map((u) => (
                            <li key={u.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setFormData(p => ({ ...p, userId: u.id }));
                                  setShowDropdown(false);
                                  setUserSearch('');
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors"
                              >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                  <User className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {u.profile?.firstName || ''} {u.profile?.lastName || ''}
                                    {!u.profile?.firstName && !u.profile?.lastName && <span className="text-slate-400">بدون اسم</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">{u.email} {u.phone ? `· ${u.phone}` : ''}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  u.role === 'VENDOR' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                  u.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>{u.role}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400">
                لو المستخدم مش فيندور، الدور هيتحول تلقائياً لـ VENDOR بعد الربط.
              </p>
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
              label={formLabels.businessName}
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <Input
              label={formLabels.businessNameAr}
              name="businessNameAr"
              value={formData.businessNameAr}
              onChange={handleChange}
              required
              dir="rtl"
            />

            <Input
              label={formLabels.contactEmail}
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
            />
            <Input
              label={formLabels.contactPhone}
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />

            <div className="sm:col-span-2">
              <Input
                label={formLabels.address}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label={formLabels.city}
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <Input
              label={formLabels.country}
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
                placeholder={formLabels.description}
              />
            </div>

            {isMobileWorkshopVendor && (
              <>
                <div className="sm:col-span-2 mt-2 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-cyan-900">بيانات الورشة المتنقلة</h3>
                      <p className="text-xs text-cyan-700">سيتم إنشاء الورشة المتنقلة وربطها بهذا الفيندور مباشرة.</p>
                    </div>
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
                    >
                      <LocateFixed className="size-4" />
                      استخدام موقعي الحالي
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="اسم الورشة المتنقلة"
                      name="mobileWorkshopName"
                      value={formData.mobileWorkshopName}
                      onChange={handleChange}
                      placeholder="مثال: Mobile Workshop Riyadh"
                    />
                    <Input
                      label="اسم الورشة المتنقلة بالعربية"
                      name="mobileWorkshopNameAr"
                      value={formData.mobileWorkshopNameAr}
                      onChange={handleChange}
                      placeholder="مثال: الورشة المتنقلة - الرياض"
                      dir="rtl"
                    />
                    <Input
                      label="مدينة الورشة"
                      name="mobileWorkshopCity"
                      value={formData.mobileWorkshopCity}
                      onChange={handleChange}
                      placeholder="الرياض"
                    />
                    <Input
                      label="نطاق الخدمة بالكيلومتر"
                      name="mobileWorkshopServiceRadius"
                      type="number"
                      value={formData.mobileWorkshopServiceRadius}
                      onChange={handleChange}
                    />
                    <Input
                      label="خط العرض الحالي"
                      name="mobileWorkshopLatitude"
                      type="number"
                      step="any"
                      value={formData.mobileWorkshopLatitude}
                      onChange={handleChange}
                    />
                    <Input
                      label="خط الطول الحالي"
                      name="mobileWorkshopLongitude"
                      type="number"
                      step="any"
                      value={formData.mobileWorkshopLongitude}
                      onChange={handleChange}
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">وصف الورشة المتنقلة</label>
                      <textarea
                        name="mobileWorkshopDescription"
                        rows={3}
                        value={formData.mobileWorkshopDescription}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="وصف مختصر للورشة المتنقلة"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? 'جاري الإنشاء...' : formLabels.createVendor}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}

// Updated translations for Arabic support
const formLabels = {
  addVendor: 'إضافة فيندور جديد',
  createVendorProfile: 'إنشاء ملف فيندور جديد',
  accountType: 'طريقة إضافة الحساب',
  createNewAccount: 'إنشاء حساب جديد للفيندور',
  linkExistingUser: 'ربط بمستخدم موجود',
  loginCredentials: 'بيانات تسجيل الدخول',
  businessName: 'اسم النشاط التجاري (بالإنجليزية)',
  businessNameAr: 'اسم النشاط التجاري (بالعربية)',
  contactEmail: 'البريد الإلكتروني',
  contactPhone: 'رقم الهاتف',
  address: 'العنوان',
  city: 'المدينة',
  country: 'رمز الدولة',
  description: 'الوصف',
  createVendor: 'إنشاء فيندور',
};
