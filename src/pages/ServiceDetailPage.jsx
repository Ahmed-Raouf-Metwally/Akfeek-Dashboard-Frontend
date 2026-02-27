import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Wrench } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

const DAY_NAMES = [
  { key: 0, en: 'Sunday', ar: 'الأحد' },
  { key: 1, en: 'Monday', ar: 'الإثنين' },
  { key: 2, en: 'Tuesday', ar: 'الثلاثاء' },
  { key: 3, en: 'Wednesday', ar: 'الأربعاء' },
  { key: 4, en: 'Thursday', ar: 'الخميس' },
  { key: 5, en: 'Friday', ar: 'الجمعة' },
  { key: 6, en: 'Saturday', ar: 'السبت' },
];

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getServiceById(id),
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

  if (isError || !service) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">Service not found or failed to load.</p>
          <Link to="/services" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Services
          </Link>
        </Card>
      </div>
    );
  }

  const pricing = service.pricing ?? [];
  const addOns = service.parentAddOns ?? service.addOns ?? [];
  const subServices = service.subServices ?? [];
  const isMobileCarParent = service.type === 'MOBILE_CAR_SERVICE' && !service.parentServiceId;
  const parentService = service.parentService;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <Link to="/services" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            All Services
          </Link>
          {parentService && (
            <Link to={`/services/${parentService.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-700">
              ← {t('services.parentService')}: {parentService.nameAr || parentService.name}
            </Link>
          )}
        </div>
        {isMobileCarParent && (
          <Link
            to={`/services/new?parentId=${service.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            <Plus className="size-4" /> {t('services.addSubService')}
          </Link>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="aspect-square w-full max-w-[240px] shrink-0 sm:max-w-[200px]"
          >
            <ImageOrPlaceholder
              src={service.imageUrl || service.icon}
              alt={service.name}
              className="size-full"
              aspect="square"
            />
          </motion.div>
          <div className="flex min-w-0 flex-1 flex-col justify-center p-6 sm:p-6 sm:pl-0">
            <h1 className="text-2xl font-semibold text-slate-900">{service.name}</h1>
            {service.nameAr && <p className="mt-1 text-sm text-slate-500">{service.nameAr}</p>}
            {service.description && (
              <p className="mt-3 line-clamp-3 text-sm text-slate-600">{service.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {service.category ?? '—'}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {service.type ?? '—'}
              </span>
              {service.estimatedDuration != null && (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {service.estimatedDuration} min
                </span>
              )}
              {service.isActive !== false ? (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Inactive</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Details</h2>
        <div className="space-y-0">
          <DetailRow label="Name (EN)" value={service.name} />
          <DetailRow label="Name (AR)" value={service.nameAr} />
          <DetailRow label="Description" value={service.description} />
          <DetailRow label="Description (AR)" value={service.descriptionAr} />
          <DetailRow label="Category" value={service.category} />
          <DetailRow label="Type" value={service.type} />
          {parentService && (
            <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
              <span className="w-28 shrink-0 text-sm text-slate-500">{t('services.parentService')}</span>
              <Link to={`/services/${parentService.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                {parentService.nameAr || parentService.name}
              </Link>
            </div>
          )}
          <DetailRow label="Est. duration" value={service.estimatedDuration != null ? `${service.estimatedDuration} min` : null} />
          <DetailRow label="Status" value={service.isActive !== false ? 'Active' : 'Inactive'} />
          {service.imageUrl && (
            <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
              <span className="w-28 shrink-0 text-sm text-slate-500">Image URL</span>
              <a href={service.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                {service.imageUrl}
              </a>
            </div>
          )}
        </div>
      </Card>

      {(service.workingHours != null && Array.isArray(service.workingHours) && service.workingHours.length > 0) && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">{isAr ? 'أوقات العمل' : 'Working hours'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'اليوم' : 'Day'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'من' : 'From'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{isAr ? 'إلى' : 'To'}</th>
                </tr>
              </thead>
              <tbody>
                {service.workingHours
                  .filter((h) => h && (h.start != null || h.end != null))
                  .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0))
                  .map((h) => {
                    const day = DAY_NAMES.find((d) => Number(d.key) === Number(h.dayOfWeek));
                    return (
                      <tr key={h.dayOfWeek} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{day ? (isAr ? day.ar : day.en) : h.dayOfWeek}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{h.start ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{h.end ?? '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {service.slotDurationMinutes != null && (
            <div className="border-t border-slate-100 px-6 py-3 text-sm text-slate-500">
              {isAr ? `مدة الموعد: ${service.slotDurationMinutes} دقيقة` : `Slot duration: ${service.slotDurationMinutes} min`}
            </div>
          )}
        </Card>
      )}

      {pricing.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Pricing by vehicle type</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Vehicle type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Base price (SAR)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Discounted price (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((p) => (
                  <tr key={p.id ?? p.vehicleType} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {p.vehicleType ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{p.basePrice != null ? Number(p.basePrice).toFixed(2) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{p.discountedPrice != null ? Number(p.discountedPrice).toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isMobileCarParent && subServices.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">{t('services.subServices')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name (AR)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Duration</th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subServices.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{sub.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{sub.nameAr ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{sub.category ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{sub.estimatedDuration != null ? `${sub.estimatedDuration} min` : '—'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/services/${sub.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {addOns.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Add-ons</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Add-on service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name (AR)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Additional price (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm text-slate-900">{a.addOn?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{a.addOn?.nameAr ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{a.additionalPrice != null ? Number(a.additionalPrice).toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/services" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
