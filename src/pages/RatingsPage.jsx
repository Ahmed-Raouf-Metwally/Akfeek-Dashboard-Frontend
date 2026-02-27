import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star, Search, AlertTriangle, User, BookOpen } from 'lucide-react';
import ratingService from '../services/ratingService';
import Pagination from '../components/ui/Pagination';

function StarDisplay({ score, small = false }) {
    return (
        <span className={`inline-flex items-center gap-0.5 ${small ? '' : 'gap-1'}`}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    className={`${small ? 'size-3' : 'size-4'} ${s <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
            ))}
        </span>
    );
}

function ScoreBar({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-xs text-slate-500">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(value / 5) * 100}%` }}
                />
            </div>
            <span className="w-4 text-right text-xs font-medium text-slate-600">{value}</span>
        </div>
    );
}

function RatingCard({ rating, isAr }) {
    const rater = rating.rater;
    const ratee = rating.ratee;
    const raterName = rater?.profile
        ? `${rater.profile.firstName} ${rater.profile.lastName}`
        : rater?.email || '—';
    const rateeName = ratee?.profile
        ? `${ratee.profile.firstName} ${ratee.profile.lastName}`
        : ratee?.email || '—';

    const hasDetailedRatings =
        rating.punctuality || rating.professionalism || rating.quality || rating.communication;

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            {/* Score Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <StarDisplay score={rating.score} />
                    <p className="mt-0.5 text-2xl font-bold text-slate-900">{rating.score}<span className="text-sm font-normal text-slate-400">/5</span></p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    #{rating.booking?.bookingNumber || rating.bookingId?.slice(0, 8)}
                </span>
            </div>

            {/* Review text */}
            {rating.review && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 italic">
                    "{rating.review}"
                </p>
            )}

            {/* Detailed scores */}
            {hasDetailedRatings && (
                <div className="space-y-1.5">
                    <ScoreBar label={isAr ? 'الالتزام' : 'Punctuality'} value={rating.punctuality} />
                    <ScoreBar label={isAr ? 'الاحترافية' : 'Professionalism'} value={rating.professionalism} />
                    <ScoreBar label={isAr ? 'الجودة' : 'Quality'} value={rating.quality} />
                    <ScoreBar label={isAr ? 'التواصل' : 'Communication'} value={rating.communication} />
                </div>
            )}

            {/* Rater / Ratee */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span className="font-medium">{raterName}</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-medium">{rateeName}</span>
                </div>
                <span>{new Date(rating.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
        </div>
    );
}

export default function RatingsPage() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [minScore, setMinScore] = useState('');
    const PAGE_SIZE = 12;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['ratings', page],
        queryFn: () => ratingService.getRatings({ page, limit: PAGE_SIZE }),
        keepPreviousData: true,
    });

    const allRatings = data?.data || [];
    const pagination = data?.pagination || {};

    const filtered = allRatings.filter((r) => {
        const raterName = r.rater?.profile
            ? `${r.rater.profile.firstName} ${r.rater.profile.lastName}`.toLowerCase()
            : '';
        const rateeName = r.ratee?.profile
            ? `${r.ratee.profile.firstName} ${r.ratee.profile.lastName}`.toLowerCase()
            : '';
        const matchesSearch = !search ||
            raterName.includes(search.toLowerCase()) ||
            rateeName.includes(search.toLowerCase()) ||
            (r.booking?.bookingNumber || '').toLowerCase().includes(search.toLowerCase());
        const matchesScore = !minScore || r.score >= parseInt(minScore);
        return matchesSearch && matchesScore;
    });

    // Stats
    const avgScore = allRatings.length
        ? (allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length).toFixed(1)
        : '—';
    const fiveStars = allRatings.filter((r) => r.score === 5).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 shadow-xl shadow-amber-500/20">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-5">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <Star className="size-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {isAr ? 'التقييمات والمراجعات' : 'Ratings & Reviews'}
                            </h1>
                            <p className="mt-1 text-orange-100/80">
                                {isAr ? 'تقييمات العملاء للفنيين وجودة الخدمة' : 'Customer ratings for technicians and service quality'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur">
                            <div className="flex items-center gap-1 text-2xl font-bold text-white">
                                <Star className="size-5 fill-white" />
                                {avgScore}
                            </div>
                            <p className="text-xs text-orange-100">{isAr ? 'متوسط التقييم' : 'Avg. Rating'}</p>
                        </div>
                        <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur">
                            <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
                            <p className="text-xs text-orange-100">{isAr ? 'إجمالي التقييمات' : 'Total Ratings'}</p>
                        </div>
                        <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur">
                            <div className="text-2xl font-bold text-white">{fiveStars}</div>
                            <p className="text-xs text-orange-100">{isAr ? '5 نجوم' : '5 Stars'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        placeholder={isAr ? 'ابحث بالاسم أو رقم الحجز...' : 'Search by name or booking number...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>
                <select
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                    <option value="">{isAr ? 'كل التقييمات' : 'All Scores'}</option>
                    {[5, 4, 3, 2, 1].map((s) => (
                        <option key={s} value={s}>{s} {isAr ? 'نجوم فأكثر' : '★ & above'}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-16 text-center">
                    <AlertTriangle className="mb-3 size-12 text-red-300" />
                    <p className="text-red-600">{isAr ? 'حدث خطأ في تحميل البيانات' : 'Failed to load data'}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <Star className="mb-3 size-14 text-slate-300" />
                    <p className="text-slate-500">{isAr ? 'لا توجد تقييمات بعد' : 'No ratings found'}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((rating) => (
                        <RatingCard key={rating.id} rating={rating} isAr={isAr} />
                    ))}
                </div>
            )}

            <Pagination
                page={page}
                totalPages={pagination.totalPages || 1}
                total={pagination.total || 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                disabled={isLoading}
            />
        </div>
    );
}
