import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Shield } from 'lucide-react';
import { employeesService } from '../services/employeesService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

export default function EmployeesPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['employees', { search, page, limit }],
    queryFn: () => employeesService.list({ search: search || undefined, page, limit }),
  });

  const employees = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
  const isAr = i18n.language === 'ar';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {isAr ? 'موظفون أكفيك' : 'Akfeek Employees'}
        </h1>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          <UserPlus className="size-5" />
          {isAr ? 'إضافة موظف' : 'Add Employee'}
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-700">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder={isAr ? 'بحث بالبريد أو الاسم...' : 'Search by email or name...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
          >
            {t('common.search')}
          </button>
        </form>

        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isAr ? 'الموظف' : 'Employee'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isAr ? 'الصلاحيات' : 'Permissions'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isAr ? 'لا يوجد موظفون. أضف موظفاً من الزر أعلاه.' : 'No employees. Add one using the button above.'}
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const name = [emp.profile?.firstName, emp.profile?.lastName].filter(Boolean).join(' ') || '—';
                    const permCount = (emp.permissions || []).length;
                    return (
                      <tr
                        key={emp.id}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                              {(name.slice(0, 2) || '?').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900 dark:text-slate-100">{name}</p>
                              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            <Shield className="size-3.5" />
                            {permCount} {isAr ? 'صلاحية' : 'permission(s)'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              emp.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/employees/${emp.id}/permissions`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                          >
                            <Shield className="size-4" />
                            {isAr ? 'تحرير الصلاحيات' : 'Edit permissions'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              totalItems={pagination.total}
              pageSize={pagination.limit}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
