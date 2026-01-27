import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sliders, Database, RotateCcw, Palette, Sun, Moon, Monitor, Percent } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { useDashboardSettingsStore } from '../store/dashboardSettingsStore';
import { Card } from '../components/ui/Card';

const NAV_LABELS = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  users: 'Users',
  services: 'Services',
  brands: 'Vehicle Brands',
  models: 'Vehicle Models',
  bookings: 'Bookings',
  products: 'Products',
  invoices: 'Invoices',
  settings: 'Settings',
};

const PAGE_SIZES = [5, 10, 25, 50, 100];
const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];
const DATE_FORMATS = [
  { value: 'short', label: 'Short (e.g. 1/27/25)' },
  { value: 'medium', label: 'Medium (e.g. Jan 27, 2025)' },
  { value: 'long', label: 'Long (e.g. January 27, 2025)' },
];

// Business settings: commissions, tax, pricing — key -> { labelEn, labelAr, suffix }
const BUSINESS_KEYS = [
  { key: 'PLATFORM_COMMISSION_PERCENT', labelEn: 'Platform commission %', labelAr: 'نسبة عمولة المنصة %', type: 'NUMBER', suffix: '%' },
  { key: 'TECHNICIAN_COMMISSION_PERCENT', labelEn: 'Technician share %', labelAr: 'نسبة الفني من الحجز %', type: 'NUMBER', suffix: '%' },
  { key: 'VAT_PERCENT', labelEn: 'VAT / Tax %', labelAr: 'نسبة ضريبة القيمة المضافة %', type: 'NUMBER', suffix: '%' },
  { key: 'TAX_INCLUDED_IN_PRICE', labelEn: 'Prices include tax', labelAr: 'الأسعار تشمل الضريبة', type: 'BOOLEAN' },
  { key: 'SERVICE_DEFAULT_MARKUP_PERCENT', labelEn: 'Default service markup %', labelAr: 'نسبة الزيادة الافتراضية على أسعار الخدمات %', type: 'NUMBER', suffix: '%' },
  { key: 'MIN_BOOKING_AMOUNT_SAR', labelEn: 'Minimum booking amount', labelAr: 'الحد الأدنى لمبلغ الحجز', type: 'NUMBER', suffix: ' SAR' },
  { key: 'CURRENCY_DISPLAY', labelEn: 'Currency code', labelAr: 'رمز العملة', type: 'STRING' },
];

function findSetting(grouped, key) {
  for (const cat of Object.keys(grouped || {})) {
    const found = (grouped[cat] || []).find((r) => r.key === key);
    if (found) return found;
  }
  return null;
}

export default function SettingsPage() {
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
    compactMode,
    setCompactMode,
    resetNav,
    resetAll,
  } = useDashboardSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        theme === 'dark' ||
        (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    apply();
    const m = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    m?.addEventListener?.('change', apply);
    return () => m?.removeEventListener?.('change', apply);
  }, [theme]);

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: grouped = {}, isLoading, isError, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }) => settingsService.update(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(`Setting "${key}" updated`);
      setEditingKey(null);
      setEditValue('');
    },
    onError: (err) => toast.error(err?.message ?? 'Failed to update setting'),
  });

  const openEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(value ?? '');
  };

  const saveEdit = () => {
    if (editingKey == null) return;
    updateMutation.mutate({ key: editingKey, value: editValue });
  };

  const saveBusinessSetting = (key, value) => {
    updateMutation.mutate({ key, value: String(value) });
  };

  const categories = Object.keys(grouped).sort();
  const businessItems = BUSINESS_KEYS.map((def) => ({ ...def, row: findSetting(grouped, def.key) })).filter((x) => x.row);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Control dashboard behavior and system settings.</p>
      </div>

      {/* Dashboard control */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sliders className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Dashboard control</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Choose which sections appear in the sidebar and set the default table page size for list pages.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">Sidebar visibility</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(NAV_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={navVisibility[key] !== false}
                    onChange={(e) => setNavVisible(key, e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={resetNav}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="size-4" /> Reset visibility
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Default table page size</h3>
            <select
              value={defaultPageSize}
              onChange={(e) => setDefaultPageSize(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="size-4" /> Reset all dashboard settings
            </button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Appearance</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Theme, date format, and layout density. Dark mode follows system when set to System.
        </p>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">Theme</h3>
            <div className="flex flex-wrap gap-3">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    theme === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Date format</h3>
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
          <div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Compact mode</span>
              <span className="text-xs text-slate-500">Tighter spacing in tables and lists</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Commissions, tax & pricing — التحكم الكامل في العمولات والضرائب والأسعار */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Percent className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Commissions, tax & pricing <span className="text-slate-500 font-normal">/ العمولات والضرائب والأسعار</span>
          </h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Full control over platform commission, technician share, VAT, and service pricing rules. These values are saved on the server.
        </p>

        {isLoading && <div className="py-6 text-center text-sm text-slate-500">Loading…</div>}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message ?? 'Failed to load business settings.'}
          </div>
        )}
        {!isLoading && !isError && businessItems.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800">
            No commission/tax/pricing settings found. Run backend seed to create them: <code className="rounded bg-amber-100 px-1">npx prisma db seed</code>
          </div>
        )}
        {!isLoading && !isError && businessItems.length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {businessItems.map(({ key, labelEn, labelAr, type, suffix = '', row }) => {
                const isEditing = editingKey === key;
                const val = row.value ?? '';
                if (type === 'BOOLEAN') {
                  const checked = val === 'true';
                  return (
                    <div key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/30 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{labelEn}</p>
                        <p className="text-xs text-slate-500">{labelAr}</p>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => row.isEditable !== false && saveBusinessSetting(key, e.target.checked ? 'true' : 'false')}
                          disabled={row.isEditable === false}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{checked ? 'Yes / نعم' : 'No / لا'}</span>
                      </label>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/30 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{labelEn}</p>
                      <p className="text-xs text-slate-500">{labelAr}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type={type === 'NUMBER' ? 'number' : 'text'}
                            step={type === 'NUMBER' ? '0.01' : undefined}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="w-28 rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingKey(null); setEditValue(''); }}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-slate-900">
                            {val}
                            {suffix}
                          </span>
                          {row.isEditable !== false && (
                            <button
                              type="button"
                              onClick={() => openEdit(key, val)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* System settings from API */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Database className="size-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">System settings</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Backend configuration by category. Editable values are saved to the server.
        </p>

        {isLoading && (
          <div className="py-8 text-center text-sm text-slate-500">Loading system settings…</div>
        )}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message ?? 'Failed to load system settings.'}
          </div>
        )}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            No system settings defined yet. Add settings in the backend (SystemSettings) to manage them here.
          </div>
        )}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="space-y-8">
            {categories.map((category) => {
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
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Key
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Value
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
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
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setEditingKey(null); setEditValue(''); }}
                                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openEdit(row.key, row.value)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    Edit
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
