import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function InspectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Inspection Reports</h1>
        <p className="text-sm text-slate-500">View and manage vehicle inspection reports and quotes.</p>
      </div>
      <Card className="p-12 text-center">
        <ClipboardCheck className="mx-auto mb-4 size-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Inspections Page</h3>
        <p className="mb-4 text-sm text-slate-500">
          This page will display vehicle inspection reports, inspection items, quotes, and customer responses.
        </p>
        <p className="text-xs text-slate-400">
          Backend API endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/inspections</code> (stub)
        </p>
      </Card>
    </div>
  );
}
