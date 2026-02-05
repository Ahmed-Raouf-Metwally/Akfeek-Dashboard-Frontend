import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Clock, Wrench, Pencil } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

export default function MobileCarSubServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getServiceById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        <Card className="p-6">
          <TableSkeleton rows={6} cols={2} />
        </Card>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center">
        <Wrench className="mb-4 size-16 text-slate-300" />
        <p className="text-slate-600">Service not found.</p>
        <Link to="/mobile-car-service" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Back to Mobile Car Service
        </Link>
      </div>
    );
  }

  const isSubService = service.type === 'MOBILE_CAR_SERVICE' && service.parentServiceId;
  const parent = service.parentService;
  const pricing = service.pricing ?? [];

  return (
    <div className="space-y-8">
      {/* Back + parent breadcrumb */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/mobile-car-service')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" />
          {t('common.back')}
        </button>
        {parent && (
          <Link
            to="/mobile-car-service"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <Truck className="size-4" />
            {parent.nameAr || parent.name}
          </Link>
        )}
        <Link
          to={`/services/${service.id}`}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Pencil className="size-4" />
          {t('common.edit')}
        </Link>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
      >
        <div className="grid gap-0 sm:grid-cols-[280px_1fr]">
          <div className="relative aspect-[4/3] sm:aspect-square sm:min-h-[280px]">
            <ImageOrPlaceholder
              src={service.imageUrl || service.icon}
              alt={service.name}
              className="size-full object-cover"
              aspect="video"
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white backdrop-blur sm:bottom-4 sm:left-4">
              {service.category}
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {service.name}
            </h1>
            {service.nameAr && (
              <p className="mt-2 text-lg text-slate-600">{service.nameAr}</p>
            )}
            {service.description && (
              <p className="mt-4 max-w-xl text-slate-600">{service.description}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {service.estimatedDuration != null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Clock className="size-4" />
                  {service.estimatedDuration} min
                </span>
              )}
              {service.isActive !== false ? (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing */}
      {pricing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {t('services.price') || 'Pricing'} by vehicle type
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Vehicle type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Base (SAR)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discounted (SAR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((p) => (
                    <tr key={p.id ?? p.vehicleType} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {p.vehicleType ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.basePrice != null ? Number(p.basePrice).toFixed(2) : '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.discountedPrice != null ? Number(p.discountedPrice).toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Custom attributes (if any) */}
      {service.customAttributes && typeof service.customAttributes === 'object' && Object.keys(service.customAttributes).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Custom attributes</h2>
            <pre className="overflow-x-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {JSON.stringify(service.customAttributes, null, 2)}
            </pre>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
