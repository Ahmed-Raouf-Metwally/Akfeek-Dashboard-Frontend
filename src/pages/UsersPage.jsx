import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Search, UserMinus, Check, Eye, Trash2, Car, MapPin, Pencil } from 'lucide-react';
import { userService } from '../services/userService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

function UserRow({ user, onStatusChange, onDelete, openConfirm, t }) {
  const name = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || '—';
  const email = user.email || '—';
  const role = t(`users.roles.${user.role}`) || user.role || '—';
  const statusLabel = t(`users.status.${user.status}`) || user.status || '—';

  const handleStatusClick = async (newStatus) => {
    const ok = await openConfirm({
      title: t('users.changeStatus', 'Change status'),
      message: t('users.confirmStatusChange', { status: newStatus }),
      confirmLabel: t('common.update'),
      variant: 'primary',
    });
    if (ok) await onStatusChange(user.id, newStatus);
  };

  const handleDeleteClick = async () => {
    const ok = await openConfirm({
      title: t('users.deleteUser', 'Delete user'),
      message: t('common.confirmDelete', { name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) await onDelete(user.id);
  };

  const statusClass =
    user.status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700'
      : user.status === 'SUSPENDED' || user.status === 'INACTIVE'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

  const iconBtn =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {(name.slice(0, 2) || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{name}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {role}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
            {statusLabel}
          </span>
          {user._count && (user._count.vehicles > 0 || user._count.addresses > 0) && (
            <div className="flex gap-2 text-xs text-slate-500">
              {user._count.vehicles > 0 && (
                <span className="flex items-center gap-1">
                  <Car className="size-3" />
                  {user._count.vehicles}
                </span>
              )}
              {user._count.addresses > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {user._count.addresses}
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            to={`/users/${user.id}`}
            className={iconBtn}
            title={t('common.viewDetails')}
            aria-label={t('common.viewDetails')}
          >
            <Eye className="size-5" />
          </Link>
          <Link
            to={`/users/${user.id}/edit`}
            className={iconBtn}
            title={t('common.edit')}
            aria-label={t('common.edit')}
          >
            <Pencil className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => handleStatusClick('ACTIVE')}
            className={iconBtn}
            title={t('users.setActive', 'Set Active')}
            aria-label={t('users.setActive', 'Set Active')}
          >
            <Check className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => handleStatusClick('SUSPENDED')}
            className={iconBtn}
            title={t('users.suspend', 'Suspend')}
            aria-label={t('users.suspend', 'Suspend')}
          >
            <UserMinus className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
            title={t('common.delete')}
            aria-label={t('common.delete')}
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const ROLES = [
    { value: '', label: t('common.all') },
    { value: 'CUSTOMER', label: t('users.roles.CUSTOMER') },
    { value: 'TECHNICIAN', label: t('users.roles.TECHNICIAN') },
    { value: 'SUPPLIER', label: t('users.roles.SUPPLIER') },
    { value: 'ADMIN', label: t('users.roles.ADMIN') },
  ];

  const STATUSES = [
    { value: '', label: t('common.all') },
    { value: 'ACTIVE', label: t('users.status.ACTIVE') },
    { value: 'PENDING_VERIFICATION', label: t('users.status.PENDING_VERIFICATION') },
    { value: 'SUSPENDED', label: t('users.status.SUSPENDED') },
    { value: 'INACTIVE', label: t('users.status.INACTIVE') },
  ];

  const params = useMemo(
    () => ({ search: search || undefined, role: role || undefined, status: status || undefined, page, limit }),
    [search, role, status, page, limit]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => userService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('common.success'));
    },
    onError: (err) => {
      toast.error(err?.normalized?.message || err.message || t('error.updateFailed'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('common.success'));
    },
    onError: (err) => {
      toast.error(err?.normalized?.message || err.message || t('error.deleteFailed'));
    },
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder={t('users.searchUsers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={t('users.searchUsers')}
            />
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by role"
          >
            {ROLES.map((r) => (
              <option key={r.value || 'all'} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value || 'all'} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {t('common.search')}
          </button>
        </form>

        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('users.name')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('users.role')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('common.status')}
                    </th>
                    <th className="w-32 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                        {t('users.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <UserRow
                        key={user.id}
                        t={t}
                        user={user}
                        onStatusChange={(id, s) => updateStatusMutation.mutateAsync({ id, status: s })}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                        openConfirm={openConfirm}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={limit}
              onPageChange={setPage}
              disabled={isFetching}
            />
          </>
        )}
      </Card>
    </div>
  );
}
