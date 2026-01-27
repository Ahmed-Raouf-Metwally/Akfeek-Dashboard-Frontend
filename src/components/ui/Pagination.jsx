import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  disabled = false,
  pageSize,
}) {
  if (totalPages <= 1 && total <= (pageSize ?? 10)) return null;

  const start = total === 0 ? 0 : (page - 1) * (pageSize ?? 10) + 1;
  const end = Math.min(page * (pageSize ?? 10), total);

  return (
    <nav
      className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-3"
      aria-label="Table pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || disabled}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="text-sm text-slate-500">
        {total > 0
          ? `Page ${page} of ${totalPages}${total != null ? ` (${start}–${end} of ${total})` : ''}`
          : `Page ${page} of ${totalPages}`}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || disabled}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRight className="size-5" />
      </button>
    </nav>
  );
}
