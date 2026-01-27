import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-SA', { dateStyle: 'medium' });
}

function formatDateTime(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleString();
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
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

  if (isError || !booking) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">Booking not found or failed to load.</p>
          <Link to="/bookings" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to Bookings
          </Link>
        </Card>
      </div>
    );
  }

  const customerName = booking.customer?.profile
    ? [booking.customer.profile.firstName, booking.customer.profile.lastName].filter(Boolean).join(' ')
    : booking.customer?.email || booking.customer?.phone || '—';
  const vehicleLabel = booking.vehicle?.plateNumber
    ? `${booking.vehicle.plateNumber}${booking.vehicle.vehicleModel ? ` · ${booking.vehicle.vehicleModel.brand?.name ?? ''} ${booking.vehicle.vehicleModel?.name ?? ''}`.trim() : ''}`
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <Link to="/bookings" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          All Bookings
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarCheck className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{booking.bookingNumber ?? booking.id}</h1>
            <p className="mt-1 text-sm text-slate-500">{customerName}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {booking.status ?? '—'}
              </span>
              {booking.totalPrice != null && (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {Number(booking.totalPrice).toFixed(2)} SAR
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Full details</h2>
        <div className="space-y-0">
          <DetailRow label="Booking #" value={booking.bookingNumber ?? booking.id} />
          <DetailRow label="Status" value={booking.status} />
          <DetailRow label="Scheduled date" value={formatDate(booking.scheduledDate)} />
          <DetailRow label="Scheduled time" value={booking.scheduledTime} />
          <DetailRow label="Total price" value={booking.totalPrice != null ? `${Number(booking.totalPrice).toFixed(2)} SAR` : null} />
          <DetailRow label="Customer" value={customerName} />
          <DetailRow label="Customer email" value={booking.customer?.email} />
          <DetailRow label="Customer phone" value={booking.customer?.profile?.phoneNumber ?? booking.customer?.phone} />
          <DetailRow label="Vehicle" value={vehicleLabel} />
          <DetailRow label="Created" value={formatDateTime(booking.createdAt)} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/bookings" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
