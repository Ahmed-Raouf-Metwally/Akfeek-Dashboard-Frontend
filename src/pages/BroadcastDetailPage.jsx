import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Radio, MapPin, Clock, DollarSign, User, CalendarCheck } from 'lucide-react';
import { broadcastService } from '../services/broadcastService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useDateFormat } from '../hooks/useDateFormat';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-40 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value != null ? value : '—'}</span>
    </div>
  );
}

function customerLabel(b) {
  const p = b.customer?.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
  return b.customer?.email || b.customer?.phone || '—';
}

function statusBadge(status) {
  const colors = {
    BROADCASTING: 'bg-blue-100 text-blue-800',
    OFFERS_RECEIVED: 'bg-amber-100 text-amber-800',
    TECHNICIAN_SELECTED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-slate-100 text-slate-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status?.replace(/_/g, ' ') ?? '—'}
    </span>
  );
}

export default function BroadcastDetailPage() {
  const { fmt, fmtDT } = useDateFormat();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: broadcast, isLoading, isError } = useQuery({
    queryKey: ['broadcast', id],
    queryFn: () => broadcastService.getBroadcastById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24">
          <TableSkeleton rows={2} cols={2} />
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={3} />
        </Card>
      </div>
    );
  }

  if (isError || !broadcast) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">Broadcast not found or failed to load.</p>
          <Link to="/broadcasts" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Broadcasts
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <Link to="/broadcasts" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          All Broadcasts
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Radio className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">Broadcast #{broadcast.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-slate-500">{customerLabel(broadcast)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusBadge(broadcast.status)}
              {broadcast.booking && (
                <Link
                  to={`/bookings/${broadcast.bookingId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <CalendarCheck className="size-3" />
                  {broadcast.booking.bookingNumber}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Broadcast Information</h2>
          <div className="space-y-0">
            <DetailRow label="Status" value={broadcast.status?.replace(/_/g, ' ')} />
            <DetailRow label="Urgency" value={broadcast.urgency || '—'} />
            <DetailRow
              label="Estimated budget"
              value={broadcast.estimatedBudget != null ? `${Number(broadcast.estimatedBudget).toFixed(2)} SAR` : '—'}
            />
            <DetailRow label="Radius" value={broadcast.radiusKm != null ? `${broadcast.radiusKm} km` : '—'} />
            <DetailRow label="Broadcast until" value={fmtDT(broadcast.broadcastUntil)} />
            <DetailRow label="Created" value={fmtDT(broadcast.createdAt)} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Location & Customer</h2>
          <div className="space-y-0">
            <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
              <span className="w-40 shrink-0 text-sm text-slate-500">Location</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                <MapPin className="size-4 text-slate-400" />
                <span>{broadcast.locationAddress || '—'}</span>
              </div>
            </div>
            <DetailRow label="Coordinates" value={`${broadcast.latitude?.toFixed(6)}, ${broadcast.longitude?.toFixed(6)}`} />
            <DetailRow label="Customer" value={customerLabel(broadcast)} />
            <DetailRow label="Customer email" value={broadcast.customer?.email} />
            <DetailRow label="Customer phone" value={broadcast.customer?.phone} />
          </div>
        </Card>
      </div>

      {broadcast.description && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{broadcast.description}</p>
        </Card>
      )}

      {broadcast.offers && broadcast.offers.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Technician Offers ({broadcast.offers.length})</h2>
          </div>
          <div className="space-y-3">
            {broadcast.offers.map((offer) => {
              const techName = offer.technician?.profile
                ? [offer.technician.profile.firstName, offer.technician.profile.lastName].filter(Boolean).join(' ')
                : offer.technician?.email || '—';
              return (
                <div
                  key={offer.id}
                  className={`rounded-lg border p-4 ${offer.isSelected ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{techName}</span>
                        {offer.isSelected && (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-3.5" />
                          {Number(offer.bidAmount).toFixed(2)} SAR
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {offer.estimatedArrival} min
                        </span>
                        <span>Distance: {offer.distanceKm?.toFixed(1)} km</span>
                      </div>
                      {offer.message && <p className="mt-2 text-sm text-slate-500">{offer.message}</p>}
                    </div>
                    <span className="text-xs text-slate-400">{fmt(offer.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/broadcasts" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
