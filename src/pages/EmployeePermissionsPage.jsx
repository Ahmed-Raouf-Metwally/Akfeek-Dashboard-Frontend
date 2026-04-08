import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesService } from '../services/employeesService';
import { Card } from '../components/ui/Card';

export default function EmployeePermissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(() => new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['employee-permissions', id],
    queryFn: () => employeesService.getEmployeePermissions(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (permissions) => employeesService.updateEmployeePermissions(id, permissions),
    onSuccess: () => {
      toast.success(i18n.language === 'ar' ? 'تم تحديث الصلاحيات' : 'Permissions updated');
      queryClient.invalidateQueries({ queryKey: ['employee-permissions', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.normalized?.message || err.message;
      toast.error(msg || (i18n.language === 'ar' ? 'فشل في تحديث الصلاحيات' : 'Failed to update permissions'));
    },
  });

  const employee = data?.data;
  const allKeys = data?.data?.allKeys ?? [];
  const labels = data?.data?.labels ?? {};

  useEffect(() => {
    if (employee?.permissions && Array.isArray(employee.permissions)) {
      setSelected(new Set(employee.permissions));
    }
  }, [employee?.permissions]);

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(allKeys));
  const clearAll = () => setSelected(new Set());

  const handleSave = () => {
    updateMutation.mutate(Array.from(selected));
  };

  const isAr = i18n.language === 'ar';

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-red-600 dark:text-red-400">{isAr ? 'لم يتم العثور على الموظف' : 'Employee not found'}</p>
        <Link to="/employees" className="text-indigo-600 hover:underline dark:text-indigo-400">
          {isAr ? 'رجوع للموظفين' : 'Back to employees'}
        </Link>
      </div>
    );
  }

  const name = [employee.profile?.firstName, employee.profile?.lastName].filter(Boolean).join(' ') || employee.email;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="size-4" />
          {isAr ? 'رجوع للموظفين' : 'Back to employees'}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
          <Shield className="size-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {isAr ? 'تحرير صلاحيات الموظف' : 'Edit employee permissions'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {name} — {employee.email}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {isAr
            ? 'حدد الأقسام التي يمكن للموظف رؤيتها في لوحة التحكم. التغيير ديناميكي ويُطبّق فوراً بعد الحفظ.'
            : 'Choose which sections the employee can see in the dashboard. Changes are dynamic and apply after save.'}
        </p>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isAr ? 'تحديد الكل' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isAr ? 'إلغاء الكل' : 'Clear all'}
          </button>
        </div>
        <ul className="space-y-2">
          {allKeys.map((key) => (
            <li key={key} className="flex items-center gap-3 rounded-lg border border-slate-100 py-2.5 pl-3 dark:border-slate-700">
              <input
                type="checkbox"
                id={`perm-${key}`}
                checked={selected.has(key)}
                onChange={() => toggle(key)}
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`perm-${key}`} className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                {labels[key] || key}
              </label>
            </li>
          ))}
        </ul>
        {allKeys.length === 0 && (
          <p className="py-4 text-sm text-slate-500">{isAr ? 'لا توجد صلاحيات معرّفة.' : 'No permissions defined.'}</p>
        )}
        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {updateMutation.isPending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الصلاحيات' : 'Save permissions')}
          </button>
          <Link
            to="/employees"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {i18n.t('common.cancel')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
