import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Circle, FileText, SkipForward, Link2, Loader2 } from 'lucide-react';
import { akfeekJourneyAdminService } from '../services/akfeekJourneyAdminService';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';

function outcomeIcon(outcome) {
  switch (outcome) {
    case 'SKIPPED':
    case 'RETURN_DECLINED':
      return SkipForward;
    case 'BOOKING':
    case 'WORKSHOP_PAID':
    case 'WORKSHOP_PENDING_PAYMENT':
    case 'DOCS_COMPLETED':
      return Link2;
    case 'IN_PROGRESS':
    case 'PENDING':
      return Loader2;
    case 'NOT_YET':
      return Circle;
    default:
      return CheckCircle2;
  }
}

function outcomeStyle(outcome, isCurrent) {
  if (isCurrent && (outcome === 'IN_PROGRESS' || outcome === 'WORKSHOP_PENDING_PAYMENT')) {
    return 'border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30';
  }
  if (outcome === 'SKIPPED' || outcome === 'RETURN_DECLINED') {
    return 'border-slate-200 bg-slate-50/80 dark:border-slate-600 dark:bg-slate-800/40';
  }
  if (outcome === 'NOT_YET') {
    return 'border-slate-100 bg-white/50 opacity-70 dark:border-slate-700 dark:bg-slate-900/20';
  }
  return 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20';
}

export default function AkfeekJourneyDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { fmt, fmtDT } = useDateFormat();
  const isAr = i18n.language === 'ar';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-akfeek-journey', id],
    queryFn: () => akfeekJourneyAdminService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const openDocument = async (documentId) => {
    try {
      const blob = await akfeekJourneyAdminService.downloadDocumentFile(id, documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
      toast.error(e?.message || (isAr ? 'تعذر فتح الملف' : 'Could not open file'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Link
          to="/akfeek-journeys"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('akfeekJourney.backToList', 'Back to journeys')}
        </Link>
        <p className="text-slate-500">{t('common.loading', 'Loading…')}</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Link
          to="/akfeek-journeys"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('akfeekJourney.backToList', 'Back to journeys')}
        </Link>
        <Card className="p-6 text-red-600">{error?.message || t('common.error')}</Card>
      </div>
    );
  }

  const { journey, steps = [], workshopInvoice, workshopInvoicePaid } = data;
  const c = journey.customer;
  const name =
    [c?.profile?.firstName, c?.profile?.lastName].filter(Boolean).join(' ') || null;
  const v = journey.vehicle;
  const vehicleLine =
    v &&
    [v.vehicleModel?.brand?.nameAr || v.vehicleModel?.brand?.name, v.vehicleModel?.nameAr || v.vehicleModel?.name, v.plateDigits]
      .filter(Boolean)
      .join(' · ');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/akfeek-journeys"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('akfeekJourney.backToList', 'Back to journeys')}
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t('akfeekJourney.detailTitle', 'Journey details')}
        </h1>
        <p className="mt-1 font-mono text-xs text-slate-500" title={journey.id}>
          {journey.id}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('bookings.customer', 'Customer')}
          </h2>
          {name && <p className="text-sm text-slate-700 dark:text-slate-300">{name}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-400">{c?.email || '—'}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{c?.phone || '—'}</p>
          <Link
            to={`/users/${c?.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {t('akfeekJourney.openUser', 'Open user profile')}
          </Link>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('common.vehicle', 'Vehicle')}
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">{vehicleLine || '—'}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span>
              {t('common.status', 'Status')}:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{journey.status}</strong>
            </span>
            <span>·</span>
            <span>
              {t('akfeekJourney.currentStep', 'Current step')}:{' '}
              <strong className="font-mono text-slate-700 dark:text-slate-300">{journey.currentStep}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('akfeekJourney.created', 'Created')}: {fmtDT(journey.createdAt)} · {t('bookings.date', 'Updated')}:{' '}
            {fmtDT(journey.updatedAt)}
          </p>
        </Card>
      </div>

      {journey.workshopBookingId && (
        <Card className="space-y-2 p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('akfeekJourney.workshopBookingSection', 'Workshop booking')}
          </h2>
          {workshopInvoice ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {workshopInvoice.invoiceNumber != null && (
                <>
                  #{workshopInvoice.invoiceNumber} ·{' '}
                </>
              )}
              {t('common.status', 'Status')}: {workshopInvoice.status}
              {workshopInvoicePaid
                ? ` · ${t('akfeekJourney.invoicePaid', 'Paid')}`
                : ` · ${t('akfeekJourney.invoiceNotPaid', 'Not fully paid')}`}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{t('akfeekJourney.noInvoiceYet', 'No invoice record yet')}</p>
          )}
          <Link
            to={`/bookings/${journey.workshopBookingId}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {t('akfeekJourney.openWorkshopBooking', 'Open workshop booking')}
          </Link>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {t('akfeekJourney.stepsTimeline', 'Steps — what was done and what was skipped')}
        </h2>
        <ul className="space-y-3">
          {steps.map((s) => {
            const Icon = outcomeIcon(s.outcome);
            const current = s.isCurrent;
            return (
              <li
                key={s.key}
                className={`flex gap-3 rounded-xl border p-4 ${outcomeStyle(s.outcome, current)}`}
              >
                <Icon
                  className={`mt-0.5 size-5 shrink-0 ${
                    s.outcome === 'NOT_YET' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'
                  } ${s.outcome === 'IN_PROGRESS' ? 'animate-spin' : ''}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {t(`akfeekJourney.steps.${s.key}`, s.key)}
                    </span>
                    {current && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {t('akfeekJourney.currentBadge', 'Current')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t(`akfeekJourney.outcome.${s.outcome}`, s.outcome)}
                  </p>
                  {s.bookingId && (
                    <Link
                      to={`/bookings/${s.bookingId}`}
                      className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      {t('akfeekJourney.openLinkedBooking', 'Open linked booking')}:{' '}
                      <span className="font-mono">{s.bookingId.slice(0, 8)}…</span>
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <FileText className="size-4" />
          {t('akfeekJourney.documents', 'Documents')}
        </h2>
        {!journey.documents?.length ? (
          <p className="text-sm text-slate-500">{t('akfeekJourney.noDocuments', 'No documents uploaded')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {journey.documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{doc.label}</p>
                  <p className="text-xs text-slate-500">{fmt(doc.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openDocument(doc.id)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {t('akfeekJourney.openFile', 'Open file')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
