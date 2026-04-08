import React from 'react';
import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';

export default function SupplyRequestsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('services.supplyRequests')}</h1>
        <p className="text-sm text-slate-500">{t('supplyRequests.subtitle') || 'Manage technician supply requests and inventory replenishment.'}</p>
      </div>
      <Card className="p-12 text-center">
        <Package className="mx-auto mb-4 size-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('services.supplyRequests')}</h3>
        <p className="mb-4 text-sm text-slate-500">
          {t('supplyRequests.description') || 'This page will allow admins to view requests from technicians for new parts/supplies and approve/reject them.'}
        </p>
        <p className="text-xs text-slate-400">
          Backend API endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/supply-requests</code> (stub)
        </p>
      </Card>
    </div>
  );
}
