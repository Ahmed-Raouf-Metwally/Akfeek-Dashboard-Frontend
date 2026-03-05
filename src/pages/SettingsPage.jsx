import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Sliders, Database, RotateCcw, Palette, Sun, Moon, Globe } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { useDashboardSettingsStore } from '../store/dashboardSettingsStore';
import { Card } from '../components/ui/Card';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const {
    navVisibility,
    setNavVisible,
    defaultPageSize,
    setDefaultPageSize,
    theme,
    setTheme,
    dateFormat,
    setDateFormat,
    resetNav,
    resetAll,
  } = useDashboardSettingsStore();

  const isAr = i18n.language === 'ar';

  const NAV_SECTIONS = [
    {
      key: 'main',
      label: isAr ? 'الرئيسية' : 'Main',
      items: [
        { key: 'dashboard',      label: t('nav.dashboard',      'Dashboard') },
        { key: 'analytics',      label: t('nav.analytics',      'Analytics') },
        { key: 'myVendorDetail', label: t('nav.myVendorDetail', 'My Store Page') },
        { key: 'vendorCoupons',  label: t('nav.vendorCoupons',  'Coupons') },
      ],
    },
    {
      key: 'services-vehicles',
      label: isAr ? 'الخدمات والمركبات' : 'Services & Vehicles',
      items: [
        { key: 'services',                    label: t('nav.services',                    'Services') },
        { key: 'mobileCarService',            label: t('nav.mobileCarService',            'Mobile Car Service') },
        { key: 'workshops',                   label: t('nav.workshops',                   'Workshops') },
        { key: 'carWashWorkshops',            label: t('nav.carWashWorkshops',            'Car Wash Workshops') },
        { key: 'comprehensiveCareWorkshops',  label: t('nav.comprehensiveCareWorkshops',  'Comprehensive Care') },
        { key: 'brands',                      label: t('nav.brands',                      'Vehicle Brands') },
        { key: 'models',                      label: t('nav.models',                      'Vehicle Models') },
      ],
    },
    {
      key: 'orders',
      label: isAr ? 'الطلبات والمالية' : 'Orders & Finance',
      items: [
        { key: 'bookings',        label: t('nav.bookings',        'Bookings') },
        { key: 'broadcasts',      label: t('nav.broadcasts',      'Broadcasts') },
        { key: 'towingRequests',  label: t('nav.towingRequests',  'Towing Requests') },
        { key: 'inspections',     label: t('nav.inspections',     'Inspections') },
        { key: 'supply-requests', label: t('nav.supply-requests', 'Supply Requests') },
        { key: 'invoices',          label: t('nav.invoices',          'Invoices') },
        { key: 'payments',          label: t('nav.payments',          'Payments') },
        { key: 'wallets',           label: t('nav.wallets',           'Wallets') },
        { key: 'commissionReport',  label: t('nav.commissionReport',  'تقرير العمولة والضريبة') },
        { key: 'points',            label: t('nav.points',            'Points Audit') },
        { key: 'ratings',         label: t('nav.ratings',         'Ratings') },
      ],
    },
    {
      key: 'vendorServices',
      label: isAr ? 'خدمات الفيندور' : 'Vendor Services',
      items: [
        { key: 'vendorMyServices', label: t('nav.vendorMyServices', 'My Services') },
        { key: 'vendorBookings',   label: t('nav.vendorBookings',   'Appointments') },
      ],
    },
    {
      key: 'vendorWorkshop',
      label: isAr ? 'الورش المعتمدة (فيندور)' : 'Certified Workshop (Vendor)',
      items: [
        { key: 'vendorMyWorkshop',       label: t('nav.vendorMyWorkshop',       'My Workshop') },
        { key: 'vendorWorkshopBookings', label: t('nav.vendorWorkshopBookings', 'Workshop Bookings') },
      ],
    },
    {
      key: 'marketplace',
      label: isAr ? 'المتجر' : 'Marketplace',
      items: [
        { key: 'vendors',               label: t('nav.vendors',               'Vendors') },
        { key: 'vendorRequests',        label: t('nav.vendorRequests',        'Vendor Requests') },
        { key: 'auto-part-categories',  label: t('nav.auto-part-categories',  'Categories') },
        { key: 'auto-parts',            label: t('nav.auto-parts',            'Auto Parts') },
        { key: 'marketplace-orders',    label: t('nav.marketplace-orders',    'Orders') },
        { key: 'allCoupons',            label: t('nav.allCoupons',            'All Coupons') },
      ],
    },
    {
      key: 'management',
      label: isAr ? 'الإدارة' : 'Management',
      items: [
        { key: 'users',                     label: t('nav.users',                     'Users') },
        { key: 'roles',                     label: t('nav.roles',                     'Roles & Permissions') },
        { key: 'feedback',                  label: t('nav.feedback',                  'Feedback') },
        { key: 'technicalSupportRequests',  label: t('nav.technicalSupportRequests',  'Technical Support') },
        { key: 'notifications',             label: t('nav.notifications',             'Notifications') },
        { key: 'activity',                  label: t('nav.activity',                  'Activity / Logs') },
      ],
    },
  ];

  const PAGE_SIZES = [5, 10, 25, 50, 100];
  const THEMES = [
    { value: 'light', label: t('settings.themes.light'), icon: Sun },
    { value: 'dark', label: t('settings.themes.dark'), icon: Moon },
  ];
  const DATE_FORMATS = [
    { value: 'short', label: t('settings.dateFormats.short') },
    // { value: 'medium', label: t('settings.dateFormats.medium') },
    { value: 'long', label: t('settings.dateFormats.long') },
  ];

  // Theme is applied globally by useTheme() in App.jsx — no local effect needed here.

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: grouped = {}, isLoading, isError, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }) => settingsService.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(t('common.success'));
      setEditingKey(null);
      setEditValue('');
    },
    onError: (err) => toast.error(err?.message ?? t('common.error')),
  });

  const openEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(value ?? '');
  };

  const saveEdit = () => {
    if (editingKey == null) return;
    updateMutation.mutate({ key: editingKey, value: String(editValue) });
  };

  const categories = Object.keys(grouped).sort();
  const systemCategories = categories;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('settings.title')}</h1>
        <p className="text-sm text-slate-500">{t('settings.controlDashboard')}</p>
      </div>

      {/* Dashboard control */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sliders className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">{t('settings.dashboardControl')}</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          {t('settings.subtitle', { defaultValue: 'Choose which sections appear in the sidebar and set the default table page size.' })}
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-slate-700">{t('settings.sidebarVisibility')}</h3>
            <div className="space-y-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{section.label}</p>
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => section.items.forEach((item) => setNavVisible(item.key, true))}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {isAr ? 'تحديد الكل' : 'All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => section.items.forEach((item) => setNavVisible(item.key, false))}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isAr ? 'إخفاء الكل' : 'None'}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {section.items.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={navVisibility[key] !== false}
                          onChange={(e) => setNavVisible(key, e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={resetNav}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="size-4" /> {t('settings.resetVisibility')}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">{t('settings.defaultPageSize')}</h3>
            <select
              value={defaultPageSize}
              onChange={(e) => setDefaultPageSize(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} {t('settings.perPage')}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="size-4" /> {t('settings.resetAll')}
            </button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">{t('settings.appearance')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">{t('settings.language')}</h3>
            <p className="mb-2 text-xs text-slate-500">{t('settings.languageSubtitle', 'لغة واجهة الداشبورد. يمكنك أيضاً التبديل من أيقونة اللغة في الهيدر.')}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('ar')}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  i18n.language === 'ar' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="size-4" /> {t('language.arabic')}
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  i18n.language === 'en' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="size-4" /> {t('language.english')}
              </button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">{t('settings.theme')}</h3>
            <div className="flex flex-wrap gap-3">
              {THEMES.map((themeOption) => {
                const ThemeIcon = themeOption.icon;
                return (
                  <button
                    key={themeOption.value}
                    type="button"
                    onClick={() => setTheme(themeOption.value)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      theme === themeOption.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ThemeIcon className="size-4" /> {themeOption.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">{t('settings.dateFormat')}</h3>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DATE_FORMATS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* System settings from API */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Database className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">{t('settings.systemSettings')}</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          {t('settings.systemSettingsSubtitle')}
        </p>

        {isLoading && (
          <div className="py-8 text-center text-sm text-slate-500">{t('common.loading')}</div>
        )}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message ?? t('common.error')}
          </div>
        )}
        {!isLoading && !isError && systemCategories.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            No system settings defined yet.
          </div>
        )}
        {!isLoading && !isError && systemCategories.length > 0 && (
          <div className="space-y-8">
            {systemCategories.map((category) => {
              const items = grouped[category] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {category}
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                            Key
                          </th>
                          <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                            Value
                          </th>
                          <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                            Description
                          </th>
                          <th className="w-24 px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((row) => (
                          <tr
                            key={row.key}
                            className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 last:border-0"
                          >
                            <td className="px-4 py-3 font-mono text-sm text-slate-700">{row.key}</td>
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {editingKey === row.key ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  className="w-full max-w-xs rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                />
                              ) : (
                                <span className="break-all">{String(row.value ?? '')}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {/* descriptionAr or descriptionEn based on locale? using fallback for now */}
                              {row.description ?? row.descriptionAr ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              {row.isEditable !== false ? (
                                editingKey === row.key ? (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={saveEdit}
                                      disabled={updateMutation.isPending}
                                      className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                                    >
                                      {t('settings.saveChanges')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setEditingKey(null); setEditValue(''); }}
                                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      {t('common.cancel')}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openEdit(row.key, row.value)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    {t('common.edit')}
                                  </button>
                                )
                              ) : (
                                <span className="text-xs text-slate-400">Read-only</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
