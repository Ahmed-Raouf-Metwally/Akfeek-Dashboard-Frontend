import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function SupplyRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Supply Requests</h1>
        <p className="text-sm text-slate-500">Manage parts supply requests from technicians to suppliers.</p>
      </div>
      <Card className="p-12 text-center">
        <PackageSearch className="mx-auto mb-4 size-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Supply Requests Page</h3>
        <p className="mb-4 text-sm text-slate-500">
          This page will display supply requests, request items, delivery status, and supplier management.
        </p>
        <p className="text-xs text-slate-400">
          Backend API endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/supplies</code> (stub)
        </p>
      </Card>
    </div>
  );
}
