import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Package, Ban, CheckCircle, Star, Pencil } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { useConfirm } from '../hooks/useConfirm';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import ApprovalStatusBadge from '../components/marketplace/ApprovalStatusBadge';
import AutoPartCard from '../components/marketplace/AutoPartCard';
import RatingStars from '../components/common/RatingStars';
import { useDateFormat } from '../hooks/useDateFormat';

export default function VendorDetailPage() {
  const { fmt } = useDateFormat();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
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
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-indigo-50 p-3 text-center">
                <Package className="mx-auto mb-1 size-5 text-indigo-600" />
                <div className="text-lg font-bold text-indigo-700">{vendor._count?.parts || 0}</div>
                <div className="text-xs text-indigo-600">Parts</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <Award className="mx-auto mb-1 size-5 text-emerald-600" />
                <div className="text-lg font-bold text-emerald-700">{vendor.totalSales || 0}</div>
                <div className="text-xs text-emerald-600">Sales</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center col-span-2">
                <Star className="mx-auto mb-1 size-5 text-amber-600 fill-amber-500" />
                <div className="text-lg font-bold text-amber-700">{Number(averageRating).toFixed(1)} / 5</div>
                <div className="text-xs text-amber-600">متوسط التقييم ({totalReviews} تقييم)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Parts Catalog + Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Parts Catalog</h2>
              <div className="text-sm text-slate-500">{vendor.parts?.length || 0} items</div>
            </div>

            {!vendor.parts || vendor.parts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
                No parts added by this vendor yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {vendor.parts.map(part => (
                  <AutoPartCard key={part.id} part={{ ...part, vendor: vendor }} />
                ))}
              </div>
            )}
          </Card>

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
        </div>
      </div>
    </div>
  );
}
