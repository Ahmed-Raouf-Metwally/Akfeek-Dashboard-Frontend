import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import { userService } from '../services/userService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24">
          <TableSkeleton rows={2} cols={2} />
        </div>
        <Card className="p-6">
          <TableSkeleton rows={6} cols={3} />
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">User not found or failed to load.</p>
          <Link to="/users" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Users
          </Link>
        </Card>
      </div>
    );
  }

  const name = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <Link to="/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          All Users
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <User className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{name}</h1>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {user.role ?? '—'}
              </span>
              <span
                className={
                  user.status === 'ACTIVE'
                    ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                    : user.status === 'SUSPENDED' || user.status === 'INACTIVE'
                      ? 'inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
                      : 'inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
                }
              >
                {user.status ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Full details</h2>
        <div className="space-y-0">
          <DetailRow label="Name" value={name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.profile?.phoneNumber ?? user.phone} />
          <DetailRow label="Role" value={user.role} />
          <DetailRow label="Status" value={user.status} />
          <DetailRow label="First name" value={user.profile?.firstName} />
          <DetailRow label="Last name" value={user.profile?.lastName} />
          <DetailRow label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : null} />
          <DetailRow label="Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : null} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/users" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
