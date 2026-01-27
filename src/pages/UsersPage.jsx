import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, UserMinus, Check, MoreHorizontal, Eye } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { userService } from '../services/userService';
import { useConfirm } from '../hooks/useConfirm';
import { TableSkeleton } from '../components/ui/Skeleton';
import DetailModal from '../components/ui/DetailModal';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_VERIFICATION', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function UserRow({ user, onStatusChange, onDelete, onView, openConfirm }) {
  const name = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || '—';
  const email = user.email || '—';
  const role = user.role ?? '—';
  const status = user.status ?? '—';

  const handleStatusClick = async (newStatus) => {
    const ok = await openConfirm({
      title: 'Change status',
      message: `Set user status to "${newStatus}"?`,
      confirmLabel: 'Update',
      variant: 'primary',
    });
    if (ok) await onStatusChange(user.id, newStatus);
  };

  const handleDeleteClick = async () => {
    const ok = await openConfirm({
      title: 'Delete user',
      message: `Permanently remove ${name}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (ok) await onDelete(user.id);
  };

  const statusClass =
    status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'SUSPENDED' || status === 'INACTIVE'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

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
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="w-14 px-4 py-3">
        <Menu as="div" className="relative">
          <MenuButton
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Actions"
          >
            <MoreHorizontal className="size-5" />
          </MenuButton>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 top-full z-50 mt-1 w-48 origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => onView?.(user.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-slate-50' : ''} text-slate-700`}
                  >
                    <Eye className="size-4" /> View
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => handleStatusClick('ACTIVE')}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-slate-50' : ''} text-slate-700`}
                  >
                    <Check className="size-4" /> Set Active
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => handleStatusClick('SUSPENDED')}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-slate-50' : ''} text-slate-700`}
                  >
                    <UserMinus className="size-4" /> Suspend
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${focus ? 'bg-red-50' : ''} text-red-600`}
                  >
                    <UserMinus className="size-4" /> Delete
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </td>
    </tr>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function UsersPage() {
  const [openConfirm, ConfirmModal] = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [viewUserId, setViewUserId] = useState(null);
  const limit = 10;

  const { data: viewUser, isLoading: viewLoading } = useQuery({
    queryKey: ['user', viewUserId],
    queryFn: () => userService.getUserById(viewUserId),
    enabled: !!viewUserId,
  });

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
      toast.success('Status updated');
    },
    onError: (err) => {
      toast.error(err?.normalized?.message || err.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (err) => {
      toast.error(err?.normalized?.message || err.message || 'Failed to delete user');
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
      <DetailModal title="User details" open={!!viewUserId} onClose={() => setViewUserId(null)}>
        {viewLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : viewUser ? (
          <>
            <DetailRow
              label="Name"
              value={[viewUser.profile?.firstName, viewUser.profile?.lastName].filter(Boolean).join(' ')}
            />
            <DetailRow label="Email" value={viewUser.email} />
            <DetailRow label="Phone" value={viewUser.profile?.phoneNumber ?? viewUser.phone} />
            <DetailRow label="Role" value={viewUser.role} />
            <DetailRow label="Status" value={viewUser.status} />
            <DetailRow
              label="Created"
              value={viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : null}
            />
          </>
        ) : (
          <p className="text-sm text-slate-500">User not found.</p>
        )}
      </DetailModal>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Search users"
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
            Search
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
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="w-14 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onView={setViewUserId}
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
