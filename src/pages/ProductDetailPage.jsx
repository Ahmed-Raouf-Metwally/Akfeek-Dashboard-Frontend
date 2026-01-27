import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import { productService } from '../services/productService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24">
          <TableSkeleton rows={2} cols={2} />
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={3} />
        </Card>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">Product not found or failed to load.</p>
          <Link to="/products" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Products
          </Link>
        </Card>
      </div>
    );
  }

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
        <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          All Products
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Package className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{product.name}</h1>
            {product.nameAr && <p className="mt-1 text-sm text-slate-500">{product.nameAr}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {product.isActive !== false ? (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Inactive</span>
              )}
              {product.isFeatured && (
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Featured</span>
              )}
              {product.category && (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{product.category}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Full details</h2>
        <div className="space-y-0">
          <DetailRow label="Name" value={product.name} />
          <DetailRow label="Name (Ar)" value={product.nameAr} />
          <DetailRow label="SKU" value={product.sku} />
          <DetailRow label="Category" value={product.category} />
          <DetailRow label="Brand" value={product.brand} />
          <DetailRow label="Price" value={product.price != null ? `${Number(product.price).toFixed(2)} SAR` : null} />
          <DetailRow label="Stock" value={product.stockQuantity != null ? String(product.stockQuantity) : null} />
          <DetailRow label="Status" value={product.isActive !== false ? 'Active' : 'Inactive'} />
          <DetailRow label="Featured" value={product.isFeatured ? 'Yes' : 'No'} />
          <DetailRow label="Created" value={product.createdAt ? new Date(product.createdAt).toLocaleString() : null} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/products" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
