import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function RatingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Ratings & Reviews</h1>
        <p className="text-sm text-slate-500">View and manage customer ratings and reviews.</p>
      </div>
      <Card className="p-12 text-center">
        <Star className="mx-auto mb-4 size-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Ratings Page</h3>
        <p className="mb-4 text-sm text-slate-500">
          This page will display customer ratings and reviews for bookings.
        </p>
        <p className="text-xs text-slate-400">
          Backend API endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/ratings</code> (stub)
        </p>
      </Card>
    </div>
  );
}
