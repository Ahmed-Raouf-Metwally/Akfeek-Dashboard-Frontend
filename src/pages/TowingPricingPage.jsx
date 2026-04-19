import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { settingsService } from '../services/settingsService';
import { Card } from '../components/ui/Card';

export default function TowingPricingPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const isAr = i18n.language === 'ar';

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: grouped = {}, isLoading, isError, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 30_000,
  });

  const towingRows = useMemo(() => {
    const excludedKeys = new Set([
      'TOWING_NIGHT_SURGE',
      'TOWING_URGENT_SURGE',
      'TOWING_SEARCH_RADIUS',
      'TOWING_BROADCAST_TIMEOUT',
    ]);
    const items = (grouped?.TOWING ?? []).filter((x) => !excludedKeys.has(x.key));
    // We want admin-friendly ordering for the important knobs.
    const order = [
      'TOWING_BASE_PRICE',
      'TOWING_PRICE_PER_KM',
      'TOWING_MIN_PRICE',
      'TOWING_MINUTES_PER_KM',
      'TOWING_ADDITIONAL_MINUTES',
    ];
    return [...items].sort((a, b) => (order.indexOf(a.key) === -1 ? 999 : order.indexOf(a.key)) - (order.indexOf(b.key) === -1 ? 999 : order.indexOf(b.key)));
  }, [grouped]);

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

  const initMutation = useMutation({
    mutationFn: () => settingsService.initTowingSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(isAr ? 'تم تهيئة إعدادات السطحة' : 'Towing settings initialized');
    },
    onError: (err) => toast.error(err?.message ?? t('common.error')),
  });

  const openEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(value ?? '');
  };

  const saveEdit = () => {
    if (!editingKey) return;
    updateMutation.mutate({ key: editingKey, value: String(editValue) });
  };

  if (isLoading) {
    return (
      <div className="py-8 text-sm text-slate-500">
        {isAr ? 'جارٍ تحميل الإعدادات...' : 'Loading settings...'}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error?.message ?? t('common.error')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isAr ? 'تسعير السطحة' : 'Towing Pricing'}</h1>
          <p className="text-sm text-slate-500">
            {isAr ? 'إعدادات السعر والوقت التي تظهر للعميل قبل استلام عروض الوينش.' : 'Pricing & time settings shown to the customer before winch offers.'}
          </p>
        </div>

        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {isAr ? 'رجوع لإعدادات النظام' : 'Back to Settings'}
        </Link>
      </div>

      <Card className="p-6">
        {towingRows.length === 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-500">
              {isAr ? 'لا توجد إعدادات للسطحة.' : 'No towing settings found.'}
            </div>
            <button
              type="button"
              onClick={() => initMutation.mutate()}
              disabled={initMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isAr ? (initMutation.isPending ? 'جارٍ التهيئة...' : 'تهيئة إعدادات السطحة') : initMutation.isPending ? 'Initializing...' : 'Initialize towing settings'}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'المفتاح' : 'Key'}</th>
                  <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'القيمة' : 'Value'}</th>
                  <th className="px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'الوصف' : 'Description'}</th>
                  <th className="w-28 px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {towingRows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-0">
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
                      {isAr ? (row.descriptionAr ?? row.description ?? '—') : (row.description ?? row.descriptionAr ?? '—')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.isEditable !== false ? (
                        editingKey === row.key ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={updateMutation.isPending}
                              className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {isAr ? 'حفظ' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingKey(null);
                                setEditValue('');
                              }}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEdit(row.key, row.value)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            {isAr ? 'تعديل' : 'Edit'}
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">{isAr ? 'مقفل' : 'Read-only'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

