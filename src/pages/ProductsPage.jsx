import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Package, Eye } from 'lucide-react';
import { productService } from '../services/productService';
import { TableSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', page, categoryFilter, activeOnly],
    queryFn: () =>
      productService.getProducts({
        page,
        limit: PAGE_SIZE,
        category: categoryFilter || undefined,
        activeOnly: activeOnly,
      }),
    staleTime: 60_000,
  });

  const list = data?.list ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: PAGE_SIZE };

  const CATEGORIES = [
    { value: '', label: t('common.all') },
    { value: 'OIL', label: t('products.categories.OIL') },
    { value: 'FILTER', label: t('products.categories.FILTER') },
    { value: 'BRAKE_PAD', label: t('products.categories.BRAKE_PAD') },
    { value: 'BATTERY', label: t('products.categories.BATTERY') },
    { value: 'TIRE', label: t('products.categories.TIRE') },
    { value: 'FLUID', label: t('products.categories.FLUID') },
    { value: 'ACCESSORY', label: t('products.categories.ACCESSORY') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('products.title')}</h1>
          <p className="text-sm text-slate-500">{t('common.productCatalog')}</p>
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
          <h1 className="text-xl font-semibold text-slate-900">{t('products.title')}</h1>
          <p className="text-sm text-slate-500">{t('common.productCatalog')}</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message ?? t('common.error')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('products.title')}</h1>
          <p className="text-sm text-slate-500">{t('common.productCatalog')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => { setActiveOnly(e.target.checked); setPage(1); }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t('products.activeOnly')}</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">{t('services.category')}</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.value || 'all'} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Package className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-base font-semibold text-slate-900">{t('products.noProducts')}</h3>
            <p className="max-w-sm text-sm text-slate-500">{t('products.noProductsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('products.name')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('products.sku')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.brand')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('services.category')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('products.price')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('products.stock')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.featured')}</th>
                    <th className="w-20 px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ImageOrPlaceholder
                            src={p.imageUrl}
                            alt={p.name}
                            className="size-12 shrink-0"
                            aspect="square"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{p.name ?? '—'}</p>
                            {p.nameAr && <p className="text-sm text-slate-500">{p.nameAr}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{p.brand ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                           {t(`products.categories.${p.category}`) || p.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {p.price != null ? Number(p.price).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{p.stockQuantity ?? '—'}</td>
                      <td className="px-4 py-3">
                        {p.isFeatured ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">{t('common.featured')}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/products/${p.id}`}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title={t('common.viewDetails')}
                          aria-label={t('common.viewDetails')}
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
