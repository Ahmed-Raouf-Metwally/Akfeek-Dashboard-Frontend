import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Package, Ban,
  CheckCircle, Star, Pencil, Percent, Truck, Wrench, Droplets,
  Clock, ChevronRight, ShieldCheck, Wifi, WifiOff, Weight,
  Building2, Plus, Trash2, X, Check,
} from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useConfirm } from '../hooks/useConfirm';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import ApprovalStatusBadge from '../components/marketplace/ApprovalStatusBadge';
import AutoPartCard from '../components/marketplace/AutoPartCard';
import RatingStars from '../components/common/RatingStars';
import { useDateFormat } from '../hooks/useDateFormat';
import VendorDocuments from '../components/VendorDocuments';
import VendorServicesSection from '../components/VendorServicesSection';
import { useTranslation } from 'react-i18next';
import Modal from '../components/ui/Modal';
import Input from '../components/Input';

export default function VendorDetailPage() {
  const { fmt } = useDateFormat();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [openConfirm, ConfirmModal] = useConfirm();
  const [reviewPage, setReviewPage] = useState(1);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorService.getVendorById(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['vendor-reviews', id, reviewPage],
    queryFn: () => vendorService.getVendorReviews(id, { page: reviewPage, limit: 5 }),
    enabled: !!id,
  });

  const submitRatingMutation = useMutation({
    mutationFn: (payload) => vendorService.submitVendorReview(id, { rating: payload.rating, comment: payload.comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', id] });
      setMyRating(0);
      setMyComment('');
      toast.success('شكراً على تقييمك');
    },
    onError: (err) => toast.error(err?.message || 'Failed to submit rating'),
  });

  const canRate = user && user.id !== vendor?.userId;
  const reviews = reviewsData?.reviews ?? [];
  const averageRating = reviewsData?.averageRating ?? vendor?.averageRating ?? 0;
  const totalReviews = reviewsData?.totalReviews ?? vendor?.totalReviews ?? 0;
  const pagination = reviewsData?.pagination;

  const isAutoParts     = vendor?.vendorType === 'AUTO_PARTS';
  const isWorkshop      = vendor?.vendorType === 'CERTIFIED_WORKSHOP';
  const isMobileWorkshop = vendor?.vendorType === 'MOBILE_WORKSHOP';
  const isService       = ['CAR_WASH', 'COMPREHENSIVE_CARE'].includes(vendor?.vendorType);
  const isTowing        = vendor?.vendorType === 'TOWING_SERVICE';

  const VENDOR_TYPE_LABELS = {
    AUTO_PARTS:         'قطع غيار',
    COMPREHENSIVE_CARE: 'عناية شاملة',
    CERTIFIED_WORKSHOP: 'ورشة معتمدة',
    CAR_WASH:           'غسيل سيارات',
    MOBILE_WORKSHOP:    'ورشة متنقلة',
    TOWING_SERVICE:     'سحب وونش',
  };

  const updateStatusMutation = useMutation({
    mutationFn: (status) => vendorService.updateVendorStatus(vendor.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success('Vendor status updated');
    },
    onError: (err) => toast.error(err?.message || 'Failed to update status'),
  });

  const deleteVendorMutation = useMutation({
    mutationFn: () => vendorService.deleteVendor(vendor.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['workshops-admin'] });
      toast.success('تم حذف الفيندور بنجاح');
      navigate('/vendors', { replace: true });
    },
    onError: (err) => toast.error(err?.message || 'فشل حذف الفيندور'),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading vendor details...</div>;
  if (!vendor) return <div className="p-8 text-center text-red-500">Vendor not found</div>;

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <div className="flex items-center gap-4">
        <Link to="/vendors" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{vendor.businessName}</h1>
          <p className="text-slate-500">Vendor Profile & Catalog</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <Link
              to={`/vendors/${vendor.id}/edit`}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="size-4" /> Edit
            </Link>
          )}
          <ApprovalStatusBadge status={vendor.status} />
          {vendor.status === 'PENDING_APPROVAL' && (
            <button
              onClick={async () => {
                const ok = await openConfirm({ title: 'Approve Vendor', message: 'Approve this vendor account?', variant: 'primary' });
                if (ok) updateStatusMutation.mutate('ACTIVE');
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              <CheckCircle className="size-4" /> Approve
            </button>
          )}
          {vendor.status === 'ACTIVE' && (
            <button
              onClick={async () => {
                const ok = await openConfirm({ title: 'Suspend Vendor', message: 'Suspend this vendor? They will not be able to sell.', variant: 'danger' });
                if (ok) updateStatusMutation.mutate('SUSPENDED');
              }}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
            >
              <Ban className="size-4" /> Suspend
            </button>
          )}
          {vendor.status === 'SUSPENDED' && (
            <button
              onClick={async () => {
                const ok = await openConfirm({
                  title: 'تفعيل الفيندور',
                  message: 'إرجاع هذا الفيندور إلى الحالة النشطة؟ سيتمكن من العمل والمبيعات مرة أخرى.',
                  variant: 'primary',
                });
                if (ok) updateStatusMutation.mutate('ACTIVE');
              }}
              disabled={updateStatusMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              <CheckCircle className="size-4" /> تفعيل الفيندور
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={async () => {
                const ok = await openConfirm({
                  title: 'حذف الفيندور',
                  message: `هل أنت متأكد من حذف الفيندور "${vendor.businessNameAr || vendor.businessName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                  variant: 'danger',
                });
                if (ok) deleteVendorMutation.mutate();
              }}
              disabled={deleteVendorMutation.isPending}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" /> {deleteVendorMutation.isPending ? 'جاري الحذف...' : 'حذف الفيندور'}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <div className="mb-6 flex justify-center">
              <div className="size-32 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-50">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.businessName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-300">
                    {vendor.businessName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">About</h3>
                <p className="text-sm text-slate-500">{vendor.description || 'No description provided.'}</p>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="size-4 text-slate-400" />
                  {vendor.contactEmail}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="size-4 text-slate-400" />
                  {vendor.contactPhone}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="size-4 text-slate-400" />
                  {vendor.address}, {vendor.city}, {vendor.country}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar className="size-4 text-slate-400" />
                  Joined {fmt(vendor.createdAt)}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="mb-2 font-semibold text-slate-900">Documents</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">License:</span>
                    <span className="font-medium">{vendor.commercialLicense || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax ID:</span>
                    <span className="font-medium">{vendor.taxNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Commission — Admin only */}
              {user?.role === 'ADMIN' && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-2 font-semibold text-slate-900 flex items-center gap-1.5">
                    <Percent className="size-4 text-amber-500" />
                    نسبة العمولة
                  </h3>
                  {vendor.commissionPercent != null ? (
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <span className="text-sm text-amber-700">عمولة مخصصة</span>
                      <span className="text-lg font-bold text-amber-700">
                        {Number(vendor.commissionPercent).toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                      <span className="text-sm text-slate-500">النسبة العامة للنظام</span>
                      <span className="text-sm font-medium text-slate-400">افتراضي</span>
                    </div>
                  )}
                  <Link
                    to={`/vendors/${vendor.id}/edit`}
                    className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    <Pencil className="size-3" /> تعديل النسبة
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-slate-900">الإحصائيات</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* First stat — dynamic by type */}
              {isAutoParts && (
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <Package className="mx-auto mb-1 size-5 text-indigo-600" />
                  <div className="text-lg font-bold text-indigo-700">{vendor._count?.parts || 0}</div>
                  <div className="text-xs text-indigo-600">قطعة</div>
                </div>
              )}
              {isService && (
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <Wrench className="mx-auto mb-1 size-5 text-indigo-600" />
                  <div className="text-lg font-bold text-indigo-700">{vendor._count?.comprehensiveCareServices || 0}</div>
                  <div className="text-xs text-indigo-600">خدمة</div>
                </div>
              )}
              {isTowing && (
                <div className="rounded-lg bg-indigo-50 p-3 text-center col-span-1">
                  <Truck className="mx-auto mb-1 size-5 text-indigo-600" />
                  <div className="text-lg font-bold text-indigo-700">{vendor.winch ? '1' : '0'}</div>
                  <div className="text-xs text-indigo-600">وينش</div>
                </div>
              )}
              {isWorkshop && (
                <div className="rounded-lg bg-indigo-50 p-3 text-center col-span-1">
                  <Building2 className="mx-auto mb-1 size-5 text-indigo-600" />
                  <div className="text-lg font-bold text-indigo-700">{vendor.workshop ? '1' : '0'}</div>
                  <div className="text-xs text-indigo-600">ورشة</div>
                </div>
              )}
              {isMobileWorkshop && (
                <div className="rounded-lg bg-indigo-50 p-3 text-center col-span-1">
                  <Wrench className="mx-auto mb-1 size-5 text-indigo-600" />
                  <div className="text-lg font-bold text-indigo-700">{vendor.mobileWorkshop ? '1' : '0'}</div>
                  <div className="text-xs text-indigo-600">ورشة متنقلة</div>
                </div>
              )}

              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <Award className="mx-auto mb-1 size-5 text-emerald-600" />
                <div className="text-lg font-bold text-emerald-700">{vendor.totalSales || 0}</div>
                <div className="text-xs text-emerald-600">مبيعات</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center col-span-2">
                <Star className="mx-auto mb-1 size-5 text-amber-600 fill-amber-500" />
                <div className="text-lg font-bold text-amber-700">{Number(averageRating).toFixed(1)} / 5</div>
                <div className="text-xs text-amber-600">متوسط التقييم ({totalReviews} تقييم)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Dynamic section by vendor type + Reviews */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─── AUTO_PARTS: قائمة قطع الغيار ─────────────────────────── */}
          {isAutoParts && (
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Package className="size-5 text-indigo-600" /> كتالوج قطع الغيار
                </h2>
                <span className="text-sm text-slate-500">{vendor._count?.parts || 0} قطعة</span>
              </div>

              {!vendor.parts || vendor.parts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
                  لا توجد قطع غيار مضافة بعد.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {vendor.parts.map(part => (
                      <AutoPartCard key={part.id} part={{ ...part, vendor: vendor }} />
                    ))}
                  </div>
                  {vendor._count?.parts > vendor.parts.length && (
                    <div className="mt-4 text-center">
                      <Link to={`/auto-parts?vendorId=${vendor.id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                        عرض كل {vendor._count.parts} قطعة <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {/* ─── SERVICE VENDORS: قائمة الخدمات ────────────────────────── */}
          {(isService || isWorkshop) && (
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Wrench className="size-5 text-indigo-600" /> الخدمات المقدّمة
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{vendor._count?.comprehensiveCareServices || 0} خدمة</span>
                </div>
              </div>

              {!vendor.comprehensiveCareServices || vendor.comprehensiveCareServices.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <Wrench className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-slate-500">لا توجد خدمات مضافة بعد.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vendor.comprehensiveCareServices.map(svc => (
                    <div key={svc.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="size-12 shrink-0 rounded-xl bg-indigo-100 overflow-hidden flex items-center justify-center">
                        {svc.imageUrl
                          ? <img src={svc.imageUrl} alt="" className="h-full w-full object-cover" />
                          : <Wrench className="size-5 text-indigo-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900 truncate">{svc.nameAr || svc.name}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {svc.isActive ? 'نشطة' : 'موقوفة'}
                          </span>
                        </div>
                        {svc.estimatedDuration && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="size-3" /> {svc.estimatedDuration} دقيقة
                          </p>
                        )}
                        {svc.pricing?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {svc.pricing.map((p, i) => (
                              <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {p.vehicleType}: {p.basePrice} ر.س
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ─── CERTIFIED_WORKSHOP: تفاصيل الورشة ─────────────────────── */}
          {isWorkshop && (
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Building2 className="size-5 text-indigo-600" /> الورشة المعتمدة
                </h2>
                {user?.role === 'ADMIN' && (
                  <Link
                    to={vendor.workshop ? `/workshops/${vendor.workshop.id}` : '/workshops/new'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="size-3.5" />
                    {vendor.workshop ? 'تفاصيل الورشة' : 'ربط ورشة'}
                  </Link>
                )}
              </div>

              {!vendor.workshop ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <Building2 className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-slate-500">لا توجد ورشة مرتبطة بهذا الفيندور.</p>
                  {user?.role === 'ADMIN' && (
                    <Link to="/workshops/new" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                      <Plus className="size-4" /> ربط ورشة
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="size-16 shrink-0 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                      {vendor.workshop.logo
                        ? <img src={vendor.workshop.logo} alt="" className="h-full w-full object-cover" />
                        : <Building2 className="size-7 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{vendor.workshop.name}</h3>
                        {vendor.workshop.nameAr && <span className="text-slate-500">/ {vendor.workshop.nameAr}</span>}
                        {vendor.workshop.isVerified && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <ShieldCheck className="size-3" /> معتمدة
                          </span>
                        )}
                        {!vendor.workshop.isActive && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">موقوفة</span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="size-3.5" />
                        {vendor.workshop.address}{vendor.workshop.city ? `, ${vendor.workshop.city}` : ''}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                        {vendor.workshop.phone && <span className="flex items-center gap-1"><Phone className="size-3.5" />{vendor.workshop.phone}</span>}
                        {vendor.workshop.email && <span className="flex items-center gap-1"><Mail className="size-3.5" />{vendor.workshop.email}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">إجمالي الحجوزات</p>
                      <p className="text-lg font-bold text-slate-800">{vendor.workshop.totalBookings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">متوسط التقييم</p>
                      <p className="text-lg font-bold text-amber-600">{Number(vendor.workshop.averageRating || 0).toFixed(1)} ⭐</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">التقييمات</p>
                      <p className="text-lg font-bold text-slate-800">{vendor.workshop.totalReviews}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to={`/workshops/${vendor.workshop.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Building2 className="size-4" /> عرض صفحة الورشة الكاملة <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ─── MOBILE_WORKSHOP: تفاصيل الورشة المتنقلة ───────────────── */}
          {isMobileWorkshop && (
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Wrench className="size-5 text-indigo-600" /> الورشة المتنقلة
                </h2>
                {user?.role === 'ADMIN' && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
                    <Pencil className="size-3.5" />
                    {vendor.mobileWorkshop ? 'تعديل (غير متاح)' : 'ربط ورشة (غير متاح)'}
                  </span>
                )}
              </div>

              {!vendor.mobileWorkshop ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <Wrench className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-slate-500">لا توجد ورشة متنقلة مرتبطة بهذا الفيندور.</p>
                  {user?.role === 'ADMIN' && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
                      <Plus className="size-4" /> ربط ورشة متنقلة (غير متاح)
                    </span>
                  )}
                </div>
              ) : (() => {
                const mw = vendor.mobileWorkshop;
                const services = Array.isArray(mw.servicesOffered) ? mw.servicesOffered : [];
                const SVC_LABELS = { OIL_CHANGE:'تغيير زيت', TIRE:'إطارات', BATTERY:'بطارية', BRAKE:'فرامل', AC:'تكييف', ELECTRICAL:'كهرباء', ENGINE:'محرك', SUSPENSION:'تعليق', DIAGNOSIS:'فحص', GENERAL:'صيانة' };
                return (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="size-16 shrink-0 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                        {mw.imageUrl ? <img src={mw.imageUrl} alt="" className="h-full w-full object-cover" /> : <Wrench className="size-7 text-slate-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900">{mw.name}</h3>
                          {mw.nameAr && <span className="text-slate-500">/ {mw.nameAr}</span>}
                          {mw.isVerified && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><ShieldCheck className="size-3" />موثّقة</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{mw.vehicleType || ''}{mw.vehicleModel ? ` · ${mw.vehicleModel}` : ''}{mw.year ? ` · ${mw.year}` : ''}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {mw.isAvailable
                            ? <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><Wifi className="size-3" />متاحة</span>
                            : <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"><WifiOff className="size-3" />غير متاحة</span>}
                          {mw.city && <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="size-3" />{mw.city}{mw.serviceRadius ? ` (${mw.serviceRadius} كم)` : ''}</span>}
                        </div>
                      </div>
                    </div>

                    {(mw.basePrice || mw.pricePerKm || mw.hourlyRate || mw.minPrice) && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="mb-2 text-xs font-semibold text-emerald-700">التسعير</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {mw.basePrice   != null && <span className="text-emerald-800"><span className="text-xs text-emerald-600">زيارة: </span><strong>{mw.basePrice}</strong> ر.س</span>}
                          {mw.pricePerKm  != null && <span className="text-emerald-800"><span className="text-xs text-emerald-600">/ كم: </span><strong>{mw.pricePerKm}</strong> ر.س</span>}
                          {mw.hourlyRate  != null && <span className="text-emerald-800"><span className="text-xs text-emerald-600">/ ساعة: </span><strong>{mw.hourlyRate}</strong> ر.س</span>}
                          {mw.minPrice    != null && <span className="text-emerald-800"><span className="text-xs text-emerald-600">أدنى: </span><strong>{mw.minPrice}</strong> ر.س</span>}
                        </div>
                      </div>
                    )}

                    {mw.services?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500">الخدمات ({mw.services.length})</p>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          {mw.services.slice(0, 5).map(svc => (
                            <div key={svc.id} className="flex items-center justify-between px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{svc.name}</p>
                                {svc.estimatedDuration && <p className="text-xs text-slate-400">{svc.estimatedDuration} دقيقة</p>}
                              </div>
                              <span className="text-sm font-bold text-emerald-700">{svc.price} ر.س</span>
                            </div>
                          ))}
                        </div>
                        {mw.services.length > 5 && <p className="mt-1.5 text-xs text-slate-400">+{mw.services.length - 5} خدمة أخرى</p>}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
                        <Wrench className="size-4" /> عرض الصفحة الكاملة (غير متاح)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* ─── TOWING_SERVICE: تفاصيل الوينش ─────────────────────────── */}
          {isTowing && (
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Truck className="size-5 text-indigo-600" /> الوينش / سيارة السحب
                </h2>
                {user?.role === 'ADMIN' && (
                  <Link
                    to={vendor.winch ? `/winches/${vendor.winch.id}/edit` : '/winches/new'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="size-3.5" />
                    {vendor.winch ? 'تعديل الوينش' : 'ربط وينش'}
                  </Link>
                )}
              </div>

              {!vendor.winch ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <Truck className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-slate-500">لا يوجد وينش مرتبط بهذا الفيندور.</p>
                  {user?.role === 'ADMIN' && (
                    <Link to="/winches/new" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                      <Truck className="size-4" /> إضافة وينش
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image + header */}
                  <div className="flex items-start gap-4">
                    <div className="size-20 shrink-0 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                      {vendor.winch.imageUrl
                        ? <img src={vendor.winch.imageUrl} alt="" className="h-full w-full object-cover" />
                        : <Truck className="size-8 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{vendor.winch.name}</h3>
                        {vendor.winch.nameAr && <span className="text-slate-500">/ {vendor.winch.nameAr}</span>}
                        {vendor.winch.isVerified && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <ShieldCheck className="size-3" /> موثّق
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{vendor.winch.vehicleModel || ''} {vendor.winch.year ? `· ${vendor.winch.year}` : ''}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {vendor.winch.isAvailable
                          ? <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"><Wifi className="size-3" />متاح الآن</span>
                          : <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"><WifiOff className="size-3" />غير متاح</span>}
                        {!vendor.winch.isActive && (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">موقوف</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  {(vendor.winch.basePrice || vendor.winch.pricePerKm || vendor.winch.minPrice) && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="mb-2 text-xs font-semibold text-emerald-700">التسعير</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {vendor.winch.basePrice != null && (
                          <span className="text-emerald-800">
                            <span className="text-xs text-emerald-600">أساسي: </span>
                            <strong>{vendor.winch.basePrice}</strong> ر.س
                          </span>
                        )}
                        {vendor.winch.pricePerKm != null && (
                          <span className="text-emerald-800">
                            <span className="text-xs text-emerald-600">/ كم: </span>
                            <strong>{vendor.winch.pricePerKm}</strong> ر.س
                          </span>
                        )}
                        {vendor.winch.minPrice != null && (
                          <span className="text-emerald-800">
                            <span className="text-xs text-emerald-600">أدنى: </span>
                            <strong>{vendor.winch.minPrice}</strong> ر.س
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">رقم اللوحة</p>
                      <p className="font-semibold text-slate-800">{vendor.winch.plateNumber}</p>
                    </div>
                    {vendor.winch.capacity && (
                      <div>
                        <p className="text-xs text-slate-400">طاقة السحب</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <Weight className="size-3.5 text-slate-400" />{vendor.winch.capacity} طن
                        </p>
                      </div>
                    )}
                    {vendor.winch.city && (
                      <div>
                        <p className="text-xs text-slate-400">المدينة</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="size-3.5 text-slate-400" />{vendor.winch.city}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">إجمالي الرحلات</p>
                      <p className="font-semibold text-slate-800">{vendor.winch.totalTrips}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">متوسط التقييم</p>
                      <p className="font-semibold text-slate-800">{Number(vendor.winch.averageRating || 0).toFixed(1)} / 5</p>
                    </div>
                  </div>

                  {vendor.winch.description && (
                    <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">{vendor.winch.description}</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* تقييمات العملاء - للمستخدم اختيار أفضل فيندور */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">تقييمات العملاء</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Star className="size-6 fill-amber-500 text-amber-500" />
                <span className="text-2xl font-bold text-slate-900">{Number(averageRating).toFixed(1)}</span>
              </div>
              <span className="text-slate-500">من 5 — {totalReviews} تقييم</span>
            </div>

            {canRate && (
              <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-2">قيّم هذا الفيندور (١–٥ نجوم)</p>
                <div className="flex flex-wrap items-center gap-4">
                  <RatingStars
                    rating={myRating}
                    interactive
                    onChange={setMyRating}
                    size={28}
                    showValue
                  />
                  <input
                    type="text"
                    placeholder="تعليق (اختياري)"
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={myRating < 1 || submitRatingMutation.isPending}
                    onClick={() => submitRatingMutation.mutate({ rating: myRating, comment: myComment })}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {submitRatingMutation.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">لا توجد تقييمات بعد. كن أول من يقيّم هذا الفيندور.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <li key={r.id} className="py-4 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <RatingStars rating={r.rating} size={16} />
                        {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                        <p className="mt-1 text-xs text-slate-400">
                          {r.user?.profile?.firstName || r.user?.email || 'مستخدم'} — {fmt(r.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={reviewPage <= 1}
                  onClick={() => setReviewPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="py-1 text-sm text-slate-600">{reviewPage} / {pagination.totalPages}</span>
                <button
                  type="button"
                  disabled={reviewPage >= pagination.totalPages}
                  onClick={() => setReviewPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </Card>

          {/* Documents — Admin only */}
          {isAdmin && (
            <VendorDocuments vendorId={id} />
          )}

          {/* Vendor Services — Admin only for CAR_WASH and COMPREHENSIVE_CARE */}
          {isAdmin && (vendor?.vendorType === 'CAR_WASH' || vendor?.vendorType === 'COMPREHENSIVE_CARE') && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Services</h3>
              </div>
              <VendorServicesSection vendorId={id} vendorType={vendor?.vendorType} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
s