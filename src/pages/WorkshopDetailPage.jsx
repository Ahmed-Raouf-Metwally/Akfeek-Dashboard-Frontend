import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, Clock, Star } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: workshop, isLoading, isError } = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => workshopService.getWorkshopById(id),
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

  if (isError || !workshop) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">{t('workshops.notFound', 'Workshop not found or failed to load.')}</p>
          <Link to="/workshops" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            {t('workshops.backToList', 'Back to Workshops')}
          </Link>
        </Card>
      </div>
    );
  }

  const services = typeof workshop.services === 'string' 
    ? JSON.parse(workshop.services || '[]') 
    : workshop.services || [];

  const workingHours = workshop.workingHours || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" /> {t('common.back', 'Back')}
        </button>
        <Link to="/workshops" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {t('workshops.allWorkshops', 'All Workshops')}
        </Link>
      </div>

      <Card className="overflow-hidden p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{workshop.name}</h1>
              {workshop.isVerified && (
                <CheckCircle className="size-6 text-green-600" title={t('workshops.verified')} />
              )}
            </div>
            {workshop.nameAr && <p className="mt-1 text-sm text-slate-500">{workshop.nameAr}</p>}
            {workshop.description && (
              <p className="mt-3 text-sm text-slate-600">{workshop.description}</p>
            )}
            {workshop.descriptionAr && (
              <p className="mt-1 text-sm text-slate-500">{workshop.descriptionAr}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {workshop.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle className="size-3" />
                {t('workshops.verified')}
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                {t('workshops.unverified')}
              </span>
            )}
            {workshop.isActive ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {t('common.active')}
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                {t('common.inactive')}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact & Location */}
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.contactLocation', 'Contact & Location')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{workshop.address}</p>
                {workshop.addressAr && <p className="text-sm text-slate-500">{workshop.addressAr}</p>}
                <p className="mt-1 text-sm text-slate-600">
                  {workshop.city}{workshop.cityAr && ` (${workshop.cityAr})`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {workshop.latitude}, {workshop.longitude}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-slate-400" />
              <a href={`tel:${workshop.phone}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                {workshop.phone}
              </a>
            </div>
            {workshop.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-slate-400" />
                <a href={`mailto:${workshop.email}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                  {workshop.email}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.statistics', 'Statistics')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Star className="size-5" />
                <span className="text-2xl font-bold">{workshop.averageRating || 0}</span>
              </div>
              <p className="mt-1 text-xs text-amber-600">{t('workshops.averageRating', 'Average Rating')}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="size-5" />
                <span className="text-2xl font-bold">{workshop.totalBookings || 0}</span>
              </div>
              <p className="mt-1 text-xs text-blue-600">{t('workshops.totalBookings', 'Total Bookings')}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 col-span-2">
              <p className="text-sm font-medium text-purple-900">
                {workshop.totalReviews || 0} {t('workshops.reviews', 'Reviews')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Services Offered */}
      {services.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.servicesOffered', 'Services Offered')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {services.map((service, idx) => (
              <span
                key={idx}
                className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
              >
                {service}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Working Hours */}
      {Object.keys(workingHours).length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('workshops.workingHours', 'Working Hours')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium capitalize text-slate-700">{day}</span>
                <span className="text-sm text-slate-600">
                  {hours.open} - {hours.close}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Details */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">{t('common.details', 'Details')}</h2>
        <div className="space-y-0">
          <DetailRow label={t('workshops.name')} value={workshop.name} />
          <DetailRow label={t('common.nameAr')} value={workshop.nameAr} />
          <DetailRow label={t('common.description')} value={workshop.description} />
          <DetailRow label={t('common.descriptionAr')} value={workshop.descriptionAr} />
          <DetailRow label={t('workshops.city')} value={workshop.city} />
          <DetailRow label={t('workshops.address')} value={workshop.address} />
          <DetailRow label={t('workshops.phone')} value={workshop.phone} />
          <DetailRow label={t('workshops.email')} value={workshop.email} />
          <DetailRow label={t('workshops.verified')} value={workshop.isVerified ? t('common.yes') : t('common.no')} />
          <DetailRow label={t('common.status')} value={workshop.isActive ? t('common.active') : t('common.inactive')} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/workshops" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          {t('workshops.backToList', 'Back to list')}
        </Link>
      </div>
    </div>
  );
}
