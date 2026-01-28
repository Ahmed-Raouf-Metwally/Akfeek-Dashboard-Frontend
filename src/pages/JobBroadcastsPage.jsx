import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Radio, Eye, MapPin, Clock, DollarSign } from 'lucide-react';
import { broadcastService } from '../services/broadcastService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const PAGE_SIZE = 10;

function formatDate(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-SA', { dateStyle: 'short' });
}

function formatDateTime(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleString('en-SA', { dateStyle: 'short', timeStyle: 'short' });
}

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || b.customerId || '—';
}

function statusBadge(status) {
  const colors = {
    BROADCASTING: 'bg-blue-100 text-blue-800',
    OFFERS_RECEIVED: 'bg-amber-100 text-amber-800',
    TECHNICIAN_SELECTED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-slate-100 text-slate-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status?.replace(/_/g, ' ') ?? '—'}
    </span>
  );
}

function urgencyBadge(urgency) {
  if (!urgency) return null;
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[urgency] || 'bg-slate-100 text-slate-700'}`}>
      {urgency}
    </span>
  );
}

export default function JobBroadcastsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['broadcasts', page, statusFilter],
    queryFn: () => broadcastService.getBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Job Broadcasts</h1>
          <p className="text-sm text-slate-500">Manage emergency service broadcasts and technician offers.</p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={5} cols={6} />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Job Broadcasts</h1>
          <p className="text-sm text-slate-500">Manage emergency service broadcasts and technician offers.</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message ?? 'Failed to load broadcasts.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Job Broadcasts</h1>
          <p className="text-sm text-slate-500">Manage emergency service broadcasts and technician offers.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="BROADCASTING">Broadcasting</option>
            <option value="OFFERS_RECEIVED">Offers received</option>
            <option value="TECHNICIAN_SELECTED">Technician selected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Radio className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">No broadcasts</h3>
            <p className="max-w-sm text-sm text-slate-500">No broadcasts match your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Booking #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Urgency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Offers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Expires</th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        {b.booking?.bookingNumber ? (
                          <Link to={`/bookings/${b.bookingId}`} className="text-sm font-medium text-indigo-600 hover:underline">
                            {b.booking.bookingNumber}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(b)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate max-w-[150px]" title={b.locationAddress}>
                            {b.locationAddress || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(b.status)}</td>
                      <td className="px-4 py-3">{urgencyBadge(b.urgency)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {b.estimatedBudget != null ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="size-3.5" />
                            {Number(b.estimatedBudget).toFixed(2)} SAR
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{b._count?.offers ?? 0}</span>
                          {b.offers && b.offers.length > 0 && (
                            <span className="text-xs text-slate-500">
                              ({b.offers.filter((o) => o.isSelected).length} selected)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="size-3.5 shrink-0" />
                          <span>{formatDateTime(b.broadcastUntil)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/broadcasts/${b.id}`}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title="View full details"
                          aria-label="View full details"
                        >
                          <Eye className="size-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
              disabled={isLoading}
            />
          </>
        )}
      </Card>
    </div>
  );
}
