import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { Card } from '../components/ui/Card';

const ROLES = [
  { value: 'CUSTOMER', labelAr: 'عميل', labelEn: 'Customer' },
  { value: 'TECHNICIAN', labelAr: 'فني', labelEn: 'Technician' },
  { value: 'SUPPLIER', labelAr: 'مورد', labelEn: 'Supplier' },
  { value: 'VENDOR', labelAr: 'فيندور', labelEn: 'Vendor' },
  { value: 'EMPLOYEE', labelAr: 'موظف أكفيك', labelEn: 'Akfeek Employee' },
];

export default function CreateUserPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'CUSTOMER',
    firstName: '',
    lastName: '',
    phone: '',
    preferredLanguage: 'AR',
  });

  const createMutation = useMutation({
    mutationFn: (payload) => userService.createUser(payload),
    onSuccess: () => {
      toast.success(i18n.language === 'ar' ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
      navigate('/users');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      toast.error(msg || (i18n.language === 'ar' ? 'فشل في إضافة المستخدم' : 'Failed to add user'));
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      toast.error(i18n.language === 'ar' ? 'يرجى تعبئة البريد وكلمة المرور والاسم الأول والأخير' : 'Please fill email, password, first name and last name');
      return;
    }
    if (form.password.length < 8) {
      toast.error(i18n.language === 'ar' ? 'كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    const payload = {
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      preferredLanguage: form.preferredLanguage,
    };
    createMutation.mutate(payload);
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="size-4" />
          {isAr ? 'رجوع للمستخدمين' : 'Back to users'}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {isAr ? 'إضافة مستخدم' : 'Add user'}
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isAr ? 'البريد الإلكتروني' : 'Email'} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isAr ? 'كلمة المرور' : 'Password'} * (8+ {isAr ? 'أحرف' : 'chars'})
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isAr ? 'الدور' : 'Role'} *
            </label>
            <select
              id="role"
              name="role"
              required
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {isAr ? r.labelAr : r.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAr ? 'الاسم الأول' : 'First name'} *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAr ? 'الاسم الأخير' : 'Last name'} *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isAr ? 'رقم الجوال' : 'Phone'} ({isAr ? 'اختياري' : 'optional'})
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="preferredLanguage" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isAr ? 'اللغة المفضلة' : 'Preferred language'}
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={form.preferredLanguage}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="AR">{isAr ? 'العربية' : 'Arabic'}</option>
              <option value="EN">English</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {createMutation.isPending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'إضافة المستخدم' : 'Add user')}
            </button>
            <Link
              to="/users"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
