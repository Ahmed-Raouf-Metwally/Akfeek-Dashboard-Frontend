import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Car,
  User,
  MapPin,
  FileText,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import technicalSupportService from '../services/technicalSupportService';
import socketService from '../services/socketService';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import DetailModal from '../components/ui/DetailModal';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

function AssignModal({ open, onClose, requestId, onSuccess }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [technicianId, setTechnicianId] = useState('');

  const {
    data: techniciansList,
    isLoading: techniciansLoading,
    isError: techniciansError,
    error: techniciansQueryError,
    refetch: refetchTechnicians,
  } = useQuery({
    queryKey: ['technical-support-technicians'],
    queryFn: () => technicalSupportService.getTechnicians(),
    enabled: open,
  });
  const technicians = Array.isArray(techniciansList) ? techniciansList : [];

  const assignMutation = useMutation({
    mutationFn: (id) => technicalSupportService.assignTechnician(id, { technicianId }),
    onSuccess: () => {
      toast.success(t('technicalSupport.assignedSuccess', 'تم تعيين الفني بنجاح'));
      queryClient.invalidateQueries({ queryKey: ['technical-support-requests'] });
      onSuccess?.();
      onClose();
      setTechnicianId('');
    },
    onError: (err) => toast.error(err?.message || err?.normalized?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!technicianId) {
      toast.error(t('technicalSupport.selectTechnician', 'اختر فني من القائمة'));
      return;
    }
    assignMutation.mutate(requestId);
  };

  const getTechnicianName = (u) =>
    u.profile && (u.profile.firstName || u.profile.lastName)
      ? [u.profile.firstName, u.profile.lastName].filter(Boolean).join(' ')
      : u.email;

  return (
    <DetailModal
      title={t('technicalSupport.assignTechnician', 'تعيين فني')}
      open={open}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          {t('technicalSupport.chooseTechnicianFromList', 'اختر فني من القائمة ثم اضغط تعيين')}
        </p>

        {techniciansLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : techniciansError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 py-6 text-center text-sm text-red-800">
            <AlertCircle className="mx-auto mb-2 size-8 text-red-500" />
            <p className="font-medium">
              {t('technicalSupport.loadError', 'فشل تحميل قائمة الفنيين')}
            </p>
            <p className="mt-1 text-xs text-red-600">
              {techniciansQueryError?.response?.data?.errorAr ||
                techniciansQueryError?.response?.data?.error ||
                techniciansQueryError?.message}
            </p>
            <p className="mt-2 text-xs text-red-600">
              {t('technicalSupport.checkAdminAndBackend', 'تأكد من تسجيل الدخول كأدمن وأن الباكند يعمل.')}
            </p>
            <button
              type="button"
              onClick={() => refetchTechnicians()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {t('common.retry', 'إعادة المحاولة')}
            </button>
          </div>
        ) : technicians.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 py-6 text-center text-sm text-amber-800">
            <Wrench className="mx-auto mb-2 size-8 text-amber-500" />
            <p>
              {t('technicalSupport.noTechnicians', 'لا يوجد فنيون مسجلون. أضف مستخدمين بدور «فني» من صفحة المستخدمين.')}
            </p>
            <p className="mt-2 text-xs">
              {t('technicalSupport.seedHint', 'أو شغّل في مجلد الباكند: npm run prisma:seed:technicians')}
            </p>
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
            {technicians.map((u) => {
              const name = getTechnicianName(u);
              const isSelected = technicianId === u.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setTechnicianId(u.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-start transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                        : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{name}</div>
                      <div className="truncate text-xs text-slate-500">{u.email}</div>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                        {t('common.selected', 'محدد')}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('common.cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            disabled={assignMutation.isPending || technicians.length === 0 || !technicianId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {assignMutation.isPending ? t('common.loading', 'جاري...') : t('common.assign', 'تعيين')}
          </button>
        </div>
      </form>
    </DetailModal>
  );
}

export default function TechnicalSupportRequestsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [assignRequestId, setAssignRequestId] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['technical-support-requests', page, statusFilter],
    queryFn: () =>
      technicalSupportService.getList({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      }),
    enabled: isAdmin,
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['technical-support-request-detail', selectedId],
    queryFn: () => technicalSupportService.getById(selectedId),
    enabled: !!selectedId,
  });

  const list = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };
  const detail = detailData;

  // تتبع الفني: جلب بيانات التتبع والاتصال بالسوكيت عند فتح طلب فيه فني (ASSIGNED / IN_PROGRESS)
  useEffect(() => {
    if (!selectedId || !detail || detail.id !== selectedId || !detail.technicianId) {
      setTrackData(null);
      setLiveLocation(null);
      return;
    }
    const status = detail.status;
    if (status !== 'ASSIGNED' && status !== 'IN_PROGRESS') {
      setTrackData(null);
      setLiveLocation(null);
      return;
    }
    let cancelled = false;
    technicalSupportService.getTrack(selectedId).then((d) => {
      if (!cancelled) setTrackData(d);
    }).catch(() => {});
    socketService.joinTSRRequest(selectedId);
    const onUpdate = (payload) => {
      if (payload.requestId === selectedId && payload.location) {
        setLiveLocation(payload.location);
      }
    };
    socketService.onTechnicianLocationUpdate(onUpdate);
    return () => {
      cancelled = true;
      socketService.leaveTSRRequest(selectedId);
      socketService.offTechnicianLocationUpdate();
      setTrackData(null);
      setLiveLocation(null);
    };
  }, [selectedId, detail?.id, detail?.technicianId, detail?.status]);

  const handleStatusChange = async (id, status) => {
    try {
      await technicalSupportService.updateStatus(id, { status });
      toast.success(t('common.updated', 'تم التحديث'));
      queryClient.invalidateQueries({ queryKey: ['technical-support-requests'] });
      if (selectedId === id) queryClient.invalidateQueries({ queryKey: ['technical-support-request-detail', id] });
    } catch (err) {
      toast.error(err?.message || err?.normalized?.message || t('common.error'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center">
        <AlertCircle className="size-12 text-amber-500" />
        <p className="text-slate-600">{t('common.accessDenied', 'غير مصرح')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('technicalSupport.title', 'طلبات الدعم الفني')}</h1>
          <p className="text-sm text-slate-500">{t('technicalSupport.subtitle', 'عرض الطلبات المقدمة وتعيين الفني')}</p>
        </div>
        <Card className="overflow-hidden p-0">
          <TableSkeleton rows={8} cols={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('technicalSupport.title', 'طلبات الدعم الفني')}</h1>
          <p className="text-sm text-slate-500">{t('technicalSupport.subtitle', 'عرض الطلبات المقدمة وتعيين الفني')}</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-600">{t('common.status', 'الحالة')}:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">{t('common.all', 'الكل')}</option>
            <option value="PENDING">{t('technicalSupport.status.PENDING', 'مقدم')}</option>
            <option value="ASSIGNED">{t('technicalSupport.status.ASSIGNED', 'تم التعيين')}</option>
            <option value="IN_PROGRESS">{t('technicalSupport.status.IN_PROGRESS', 'قيد التنفيذ')}</option>
            <option value="COMPLETED">{t('technicalSupport.status.COMPLETED', 'مكتمل')}</option>
            <option value="CANCELLED">{t('technicalSupport.status.CANCELLED', 'ملغي')}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('technicalSupport.number', 'الرقم')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('technicalSupport.customer', 'العميل')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('technicalSupport.plateNumber', 'رقم اللوحة')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('common.status', 'الحالة')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('technicalSupport.technician', 'الفني')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('common.createdAt', 'التاريخ')}
                </th>
                <th className="w-28 px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('common.actions', 'إجراءات')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    {t('technicalSupport.noRequests', 'لا توجد طلبات')}
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-sm text-slate-700">{item.number}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {item.customer?.profile
                          ? `${item.customer.profile.firstName} ${item.customer.profile.lastName}`
                          : item.customer?.email ?? '—'}
                      </div>
                      <div className="text-xs text-slate-500">{item.customer?.phone ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.plateNumber}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          STATUS_STYLES[item.status] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t(`technicalSupport.status.${item.status}`, item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.technician?.profile
                        ? `${item.technician.profile.firstName} ${item.technician.profile.lastName}`
                        : item.technician?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString(i18n.language, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title={t('common.view', 'عرض')}
                        >
                          <Eye className="size-4" />
                        </button>
                        {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => setAssignRequestId(item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            title={t('technicalSupport.assignTechnician', 'تعيين فني')}
                          >
                            <Wrench className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 p-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <DetailModal
        title={t('technicalSupport.requestDetail', 'تفاصيل الطلب')}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      >
        {detailLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-indigo-600">{detail.number}</span>
              <select
                value={detail.status}
                onChange={(e) => handleStatusChange(detail.id, e.target.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  STATUS_STYLES[detail.status] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                <option value="PENDING">{t('technicalSupport.status.PENDING')}</option>
                <option value="ASSIGNED">{t('technicalSupport.status.ASSIGNED')}</option>
                <option value="IN_PROGRESS">{t('technicalSupport.status.IN_PROGRESS')}</option>
                <option value="COMPLETED">{t('technicalSupport.status.COMPLETED')}</option>
                <option value="CANCELLED">{t('technicalSupport.status.CANCELLED')}</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <User className="size-5 text-slate-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {detail.customer?.profile
                      ? `${detail.customer.profile.firstName} ${detail.customer.profile.lastName}`
                      : detail.customer?.email}
                  </div>
                  <div className="text-xs text-slate-500">{detail.customer?.phone}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
                  <Car className="size-3.5" />
                  {t('technicalSupport.vehicleSerialNumber', 'الرقم التسلسلي')}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-800">{detail.vehicleSerialNumber}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="text-xs font-medium uppercase text-slate-400">
                  {t('technicalSupport.plateNumber', 'رقم اللوحة')}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-800">{detail.plateNumber}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <div className="text-xs font-medium uppercase text-slate-400">
                {t('technicalSupport.insurance', 'التأمين')}
              </div>
              <p className="mt-1 text-sm text-slate-800">
                {detail.hasInsurance ? (detail.insuranceCompany || t('common.yes')) : t('common.no')}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
                <MapPin className="size-3.5" />
                {t('technicalSupport.deliveryAddress', 'عنوان التسليم')}
              </div>
              <p className="mt-1 text-sm text-slate-800">{detail.deliveryAddress}</p>
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
                <FileText className="size-3.5" />
                {t('technicalSupport.accidentDamages', 'أضرار الحادث')}
              </div>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{detail.accidentDamages}</p>
            </div>

            {(detail.repairAuthUrl || detail.najmDocUrl || detail.trafficReportUrl) && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">
                <div className="text-xs font-medium uppercase text-indigo-600">{t('technicalSupport.documents', 'مستندات')}</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {detail.repairAuthUrl && (
                    <li>
                      <a href={detail.repairAuthUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {t('technicalSupport.repairAuth', 'إذن إصلاح')}
                      </a>
                    </li>
                  )}
                  {detail.najmDocUrl && (
                    <li>
                      <a href={detail.najmDocUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {t('technicalSupport.najmDoc', 'وثيقة نجم')}
                      </a>
                    </li>
                  )}
                  {detail.trafficReportUrl && (
                    <li>
                      <a href={detail.trafficReportUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {t('technicalSupport.trafficReport', 'تقرير مرور')}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {detail.technician && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="size-5 text-indigo-500" />
                </div>
                <div className="mt-2 text-sm font-medium text-slate-800">
                  {detail.technician.profile
                    ? `${detail.technician.profile.firstName} ${detail.technician.profile.lastName}`
                    : detail.technician.email}
                </div>
                <div className="text-xs text-slate-500">{detail.technician.email}</div>
              </div>
            )}

            {/* تتبع الفني — موقع الفني المباشر */}
            {detail.technician && (detail.status === 'ASSIGNED' || detail.status === 'IN_PROGRESS') && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <MapPin className="size-4" />
                  {t('technicalSupport.trackTechnician', 'تتبع الفني')}
                </div>
                {(() => {
                  const loc = liveLocation ?? trackData?.currentLocation;
                  if (!loc?.latitude || !loc?.longitude) {
                    return (
                      <p className="mt-2 text-sm text-slate-600">
                        {trackData ? t('technicalSupport.noLocationYet', 'لم يُرسل موقع بعد.') : t('common.loading', 'جاري التحميل...')}
                      </p>
                    );
                  }
                  const mapUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
                  return (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-700">
                        {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                        {loc.heading != null && (
                          <span className="ml-2 text-slate-500">° {loc.heading}</span>
                        )}
                      </p>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                      >
                        {t('technicalSupport.openInMaps', 'فتح في خرائط جوجل')}
                      </a>
                      {liveLocation && (
                        <span className="ml-2 text-xs text-emerald-600">{t('technicalSupport.live', 'مباشر')}</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {detail.status !== 'COMPLETED' && detail.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => {
                  setAssignRequestId(detail.id);
                  setSelectedId(null);
                }}
                className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
              >
                {t('technicalSupport.assignTechnician', 'تعيين فني')}
              </button>
            )}

            <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              {t('common.createdAt')}: {new Date(detail.createdAt).toLocaleString(i18n.language)}
            </div>
          </div>
        ) : null}
      </DetailModal>

      <AssignModal
        key={assignRequestId || 'closed'}
        open={!!assignRequestId}
        onClose={() => setAssignRequestId(null)}
        requestId={assignRequestId}
        onSuccess={() => setAssignRequestId(null)}
      />
    </div>
  );
}
