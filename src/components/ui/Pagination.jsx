import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  disabled = false,
  pageSize,
}) {
  const { t } = useTranslation();
  
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
        aria-label={t('pagination.previous')}
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="text-sm text-slate-500">
        {total > 0
          ? `${t('pagination.page')} ${page} ${t('pagination.of')} ${totalPages}${total != null ? ` (${start}–${end} ${t('pagination.of')} ${total})` : ''}`
          : `${t('pagination.page')} ${page} ${t('pagination.of')} ${totalPages}`}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || disabled}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
        aria-label={t('pagination.next')}
      >
        <ChevronRight className="size-5" />
      </button>
    </nav>
  );
}
