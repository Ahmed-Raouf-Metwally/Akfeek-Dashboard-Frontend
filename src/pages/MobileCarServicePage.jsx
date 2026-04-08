import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Truck, Plus, Wrench, ArrowRight, Clock } from 'lucide-react';
import { mobileCarServiceApi } from '../services/mobileCarService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

export default function MobileCarServicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: parent, isLoading, isError } = useQuery({
    queryKey: ['mobileCarService'],
    queryFn: () => mobileCarServiceApi.getParentWithSubServices(),
    staleTime: 60_000,
  });

  const subServices = parent?.subServices ?? [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] space-y-6">
        <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        <TableSkeleton rows={6} cols={3} />
      </div>
    );
  }

  if (isError || (!parent && !isLoading)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center">
        <Truck className="mb-4 size-16 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-800">
          {t('services.mobileCarService') || 'خدمة الورش المتنقلة'}
        </h2>
        <p className="mt-2 max-w-md text-slate-600">
          {t('services.noMobileCarService') || 'لم يتم إعداد خدمة الورش المتنقلة بعد. أضفها من قائمة الخدمات الرئيسية.'}
        </p>
        <Link
          to="/services/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          <Plus className="size-5" />
          {t('services.addService')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero – Parent service */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-xl shadow-indigo-500/20"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Truck className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {parent.name}
              </h1>
              {parent.nameAr && (
                <p className="mt-1 text-lg text-indigo-100">{parent.nameAr}</p>
              )}
              {parent.description && (
                <p className="mt-3 max-w-2xl text-sm text-indigo-100/90">
                  {parent.description}
                </p>
              )}
            </div>
          </div>
          <Link
            to="/mobile-car-service/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            <Plus className="size-5" />
            {t('services.addSubService')}
          </Link>
        </div>
      </motion.div>

      {/* Sub-services grid */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {t('services.subServices')} ({subServices.length})
          </h2>
        </div>

        {subServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center"
          >
            <Wrench className="mb-4 size-14 text-slate-300" />
            <p className="text-slate-600">
              {t('services.noSubServices') || 'لا توجد خدمات فرعية بعد.'}
            </p>
            <Link
              to="/mobile-car-service/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="size-4" />
              {t('services.addSubService')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subServices.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/mobile-car-service/${sub.id}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <ImageOrPlaceholder
                      src={sub.imageUrl}
                      alt={sub.name}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                      aspect="video"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                      {sub.name}
                    </h3>
                    {sub.nameAr && (
                      <p className="mt-0.5 text-sm text-slate-500">{sub.nameAr}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Clock className="size-3.5" />
                        {sub.estimatedDuration != null ? `${sub.estimatedDuration} min` : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2">
                        {t('common.viewDetails') || 'عرض'}
                        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
