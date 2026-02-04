import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';

export default function RatingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('services.ratings')}</h1>
        <p className="text-sm text-slate-500">{t('ratings.subtitle') || 'View customer reviews and technician ratings.'}</p>
      </div>
      <Card className="p-12 text-center">
        <Star className="mx-auto mb-4 size-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('services.ratings')}</h3>
        <p className="mb-4 text-sm text-slate-500">
          {t('ratings.description') || 'This page will show a list of reviews/ratings for completed services.'}
        </p>
        <p className="text-xs text-slate-400">
          Backend API endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/ratings</code> (stub)
        </p>
      </Card>
    </div>
  );
}
