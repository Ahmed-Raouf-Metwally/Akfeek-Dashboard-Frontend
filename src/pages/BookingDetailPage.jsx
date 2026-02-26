import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarCheck, Clock, Radio, ClipboardCheck, PackageSearch, FileText, Star, Wrench } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../hooks/useDateFormat';

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const { fmt, fmtDT } = useDateFormat();
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Booking Information</h2>
          <div className="space-y-0">
            <DetailRow label="Booking #" value={booking.bookingNumber ?? booking.id} />
            <DetailRow label="Status" value={booking.status} />
            <DetailRow label="Scheduled date" value={fmt(booking.scheduledDate)} />
            <DetailRow label="Scheduled time" value={booking.scheduledTime} />
            <DetailRow label="Total price" value={booking.totalPrice != null ? `${Number(booking.totalPrice).toFixed(2)} SAR` : null} />
            <DetailRow label="Subtotal" value={booking.subtotal != null ? `${Number(booking.subtotal).toFixed(2)} SAR` : null} />
            <DetailRow label="Labor fee" value={booking.laborFee != null ? `${Number(booking.laborFee).toFixed(2)} SAR` : null} />
            <DetailRow label="Delivery fee" value={booking.deliveryFee != null ? `${Number(booking.deliveryFee).toFixed(2)} SAR` : null} />
            <DetailRow label="Parts total" value={booking.partsTotal != null ? `${Number(booking.partsTotal).toFixed(2)} SAR` : null} />
            <DetailRow label="Tax" value={booking.tax != null ? `${Number(booking.tax).toFixed(2)} SAR` : null} />
            <DetailRow label="Discount" value={booking.discount != null ? `${Number(booking.discount).toFixed(2)} SAR` : null} />
            <DetailRow label="Created" value={fmtDT(booking.createdAt)} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Customer & Vehicle</h2>
          <div className="space-y-0">
            <DetailRow label="Customer" value={customerName} />
            <DetailRow label="Customer email" value={booking.customer?.email} />
            <DetailRow label="Customer phone" value={booking.customer?.profile?.phoneNumber ?? booking.customer?.phone} />
            <DetailRow label="Vehicle" value={vehicleLabel} />
            {booking.technician && (
              <>
                <DetailRow
                  label="Technician"
                  value={
                    booking.technician.profile
                      ? [booking.technician.profile.firstName, booking.technician.profile.lastName].filter(Boolean).join(' ')
                      : booking.technician.email || '—'
                  }
                />
                <DetailRow label="Technician email" value={booking.technician.email} />
              </>
            )}
          </div>
        </Card>
      </div>

      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Status History</h2>
          </div>
          <div className="space-y-3">
            {booking.statusHistory.map((history, idx) => (
              <div key={history.id} className="flex gap-3 border-l-2 border-slate-200 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {history.fromStatus ? `${history.fromStatus} → ${history.toStatus}` : history.toStatus}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(history.timestamp)}</span>
                  </div>
                  {history.reason && <p className="mt-1 text-sm text-slate-600">{history.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(booking.jobBroadcast || booking.inspectionReport || (booking.supplyRequests && booking.supplyRequests.length > 0)) && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Related Entities</h2>
          <div className="space-y-3">
            {booking.jobBroadcast && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <Radio className="size-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Job Broadcast</p>
                    <p className="text-xs text-slate-500">Status: {booking.jobBroadcast.status}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{fmt(booking.jobBroadcast.createdAt)}</span>
              </div>
            )}
            {booking.inspectionReport && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Inspection Report</p>
                    <p className="text-xs text-slate-500">
                      Status: {booking.inspectionReport.status} · Condition: {booking.inspectionReport.overallCondition || '—'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{fmt(booking.inspectionReport.createdAt)}</span>
              </div>
            )}
            {booking.supplyRequests && booking.supplyRequests.length > 0 && (
              <div className="space-y-2">
                {booking.supplyRequests.map((sr) => (
                  <div key={sr.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <PackageSearch className="size-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Supply Request {sr.requestNumber}</p>
                        <p className="text-xs text-slate-500">Status: {sr.status}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{fmt(sr.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {booking.invoice && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-blue-600" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">Invoice</h3>
                <p className="text-sm text-slate-500">
                  {booking.invoice.invoiceNumber} · {booking.invoice.status}
                </p>
              </div>
            </div>
            <Link
              to={`/invoices/${booking.invoice.id}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              View Invoice
            </Link>
          </div>
        </Card>
      )}

      {booking.rating && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Star className="size-5 text-amber-500" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">Rating & Review</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">{booking.rating.score}/5</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-4 ${star <= booking.rating.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              {booking.rating.review && <p className="mt-2 text-sm text-slate-600">{booking.rating.review}</p>}
            </div>
          </div>
        </Card>
      )}

      {(booking.services && booking.services.length > 0) && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="size-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Services</h2>
          </div>
          <div className="space-y-2">
            {booking.services.map((bs) => (
              <div key={bs.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{bs.service.name}</p>
                  <p className="text-xs text-slate-500">Qty: {bs.quantity} × {Number(bs.unitPrice).toFixed(2)} SAR</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{Number(bs.totalPrice).toFixed(2)} SAR</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/bookings" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
