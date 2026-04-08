import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Truck, Plus, Search, X, Eye, Pencil, Trash2, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import winchService from '../services/winchService';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { useDateFormat } from '../hooks/useDateFormat';

const PAGE_SIZE = 12;

function AvailBadge({ v }) {
  return v
    ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><Wifi className="size-3" />متاح</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"><WifiOff className="size-3" />غير متاح</span>;
}

export default function WinchesPage() {
  const queryClient = useQueryClient();
  const { fmt } = useDateFormat();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [available, setAvailable]     = useState('');
  const [page, setPage]               = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data: result, isLoading, isFetching } = useQuery({
    queryKey: ['winches', { search, available, page }],
    queryFn: () => winchService.getWinches({
      search: search || undefined,
      available: available || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const winches    = result?.winches ?? [];
  const pagination = result?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id) => winchService.deleteWinch(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['winches'] }); toast.success('تم حذف الوينش'); },
    onError:   (err) => toast.error(err?.message || 'فشل الحذف'),
  });

  const toggleAvailMutation = useMutation({
    mutationFn: ({ id, val }) => winchService.updateWinch(id, { isAvailable: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['winches'] }),
    onError:   (err) => toast.error(err?.message || 'فشل التحديث'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="size-6 text-indigo-600" /> السحطه
          </h1>
          <p className="text-slate-500">إدارة سيارات السحب المرتبطة بالفيندورز</p>
        </div>
        <Link
          to="/winches/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="size-4" /> إضافة سطحه
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو اللوحة أو الموديل..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            value={available}
            onChange={(e) => { setAvailable(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">كل الحالات</option>
            <option value="true">متاح</option>
            <option value="false">غير متاح</option>
          </select>

          {isFetching && !isLoading && <span className="text-xs text-slate-400 animate-pulse">تحديث...</span>}
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : winches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <Truck className="mx-auto size-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">لا توجد سطحات</h3>
          <p className="text-slate-500 mt-1">أضف سطحه جديد واربطه بفيندور من نوع "سحب سطحه "</p>
          <Link to="/winches/new" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            إضافة سطحه
          </Link>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">الوينش</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">الفيندور</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">المدينة</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">الحالة</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">الرحلات</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {winches.map((w) => (
                    <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                            {w.imageUrl
                              ? <img src={w.imageUrl} alt="" className="w-full h-full object-cover" />
                              : <Truck className="size-5 text-indigo-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{w.name}</p>
                            <p className="text-xs text-slate-500">{w.plateNumber} {w.vehicleModel ? `· ${w.vehicleModel}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {w.vendor ? (
                          <Link to={`/vendors/${w.vendor.id}`} className="text-sm text-indigo-600 hover:underline">
                            {w.vendor.businessName}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">غير مرتبط</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{w.city || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailMutation.mutate({ id: w.id, val: !w.isAvailable })}
                          title="تغيير الحالة"
                        >
                          <AvailBadge v={w.isAvailable} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{w.totalTrips}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/winches/${w.id}`} className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                            <Eye className="size-4" />
                          </Link>
                          <Link to={`/winches/${w.id}/edit`} className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50">
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            onClick={() => window.confirm('حذف الوينش؟') && deleteMutation.mutate(w.id)}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Pagination
            page={page}
            totalPages={pagination?.totalPages ?? 1}
            total={pagination?.total ?? winches.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
