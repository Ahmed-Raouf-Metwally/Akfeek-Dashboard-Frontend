import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getInvoices(),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const message = data?.message ?? '';
  const isPlaceholder = message?.toLowerCase().includes('coming soon') || (list.length === 0 && !isError);
  const { paginatedItems, totalPages, total } = useMemo(() => {
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = list.slice(start, start + PAGE_SIZE);
    return { paginatedItems, totalPages, total };
  }, [list, page]);

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

  if (isPlaceholder || list.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">View and manage invoices.</p>
        </div>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="mb-4 size-12 text-slate-400" />
          <h3 className="mb-2 text-base font-semibold text-slate-900">Invoices</h3>
          <p className="max-w-sm text-sm text-slate-500">
            This section is coming soon. The backend invoices API will power the list and status updates here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">View and manage invoices.</p>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" role="grid">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{i.invoiceNumber ?? i.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{i.customerId ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {i.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{i.totalAmount ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{i.issuedAt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>
    </div>
  );
}
