import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Car } from 'lucide-react';
import { modelService } from '../services/modelService';
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

export default function ModelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: model, isLoading, isError } = useQuery({
    queryKey: ['model', id],
    queryFn: () => modelService.getModelById(id),
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

  if (isError || !model) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">Model not found or failed to load.</p>
          <Link to="/models" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Models
          </Link>
        </Card>
      </div>
    );
  }

  const brandName = model.brand?.name ?? '—';

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
        <Link to="/models" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          All Models
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Car className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{brandName} {model.name}</h1>
            {model.nameAr && <p className="mt-1 text-sm text-slate-500">{model.nameAr}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {model.year ?? '—'}
              </span>
              {model.isActive !== false ? (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Inactive</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Full details</h2>
        <div className="space-y-0">
          <DetailRow label="Brand" value={brandName} />
          <DetailRow label="Name" value={model.name} />
          <DetailRow label="Name (Ar)" value={model.nameAr} />
          <DetailRow label="Year" value={model.year != null ? String(model.year) : null} />
          <DetailRow label="Size / Type" value={model.size ?? model.type} />
          <DetailRow label="Status" value={model.isActive !== false ? 'Active' : 'Inactive'} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/models" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
