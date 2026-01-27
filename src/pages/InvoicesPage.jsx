import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const PAGE_SIZE = 10;

function formatDate(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-SA', { dateStyle: 'short' });
}

function customerLabel(i) {
  const p = i.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return i.customer?.email || i.customer?.phone || i.customerId || '—';
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', page, statusFilter],
    queryFn: () => invoiceService.getInvoices({ page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">View and manage invoices.</p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={5} cols={5} />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">View and manage invoices.</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message ?? 'Failed to load invoices.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">View and manage invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">No invoices</h3>
            <p className="max-w-sm text-sm text-slate-500">No invoices match your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Booking #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Issued</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Due</th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{i.invoiceNumber ?? i.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{i.booking?.bookingNumber ?? i.bookingId ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{customerLabel(i)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {i.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {i.totalAmount != null ? Number(i.totalAmount).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {i.paidAmount != null ? Number(i.paidAmount).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(i.issuedAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(i.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${i.id}`}
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
