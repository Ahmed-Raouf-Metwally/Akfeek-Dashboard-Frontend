import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Phone, CheckCircle, Building2, Star, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { workshopService } from '../services/workshopService';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import Pagination from '../components/ui/Pagination';
import { ImageOrPlaceholder } from '../components/ui/ImageOrPlaceholder';

function EntityCard({ item, t }) {
    const isWorkshop = !!item.services;
    const name = isWorkshop ? item.name : item.businessName;
    const nameAr = isWorkshop ? item.nameAr : item.businessNameAr;
    const phone = isWorkshop ? item.phone : item.contactPhone;
    const logo = item.logo;

    const mainImage = logo
        ? `${import.meta.env.VITE_API_URL}${logo}`
        : (isWorkshop && item.images && item.images.length > 0 ? `${import.meta.env.VITE_API_URL}${item.images[0]}` : null);

    const detailPath = isWorkshop ? `/workshops/${item.id}` : `/vendors/${item.id}`;

    return (
        <div>
            <Link
                to={detailPath}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10"
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <ImageOrPlaceholder
                        src={mainImage}
                        alt={name}
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                        placeholder={isWorkshop ? <Building2 className="size-10 text-slate-300" /> : <Store className="size-10 text-slate-300" />}
                    />
                    <div className="absolute left-3 top-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${isWorkshop ? 'bg-indigo-500/90 text-white' : 'bg-purple-500/90 text-white'}`}>
                            {isWorkshop ? t('workshops.certified') : t('nav.vendorServices', 'Comprehensive Care')}
                        </span>
                    </div>
                    <div className="absolute right-3 top-3">
                        {item.isVerified && (
                            <div className="rounded-full bg-white/90 p-1 backdrop-blur-sm" title={t('workshops.verified')}>
                                <CheckCircle className="size-4 text-green-600" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-5">
                    <div className="mb-2">
                        <h3 className="line-clamp-1 font-bold text-slate-900 group-hover:text-purple-600">{name}</h3>
                        {nameAr && <p className="line-clamp-1 text-sm text-slate-500">{nameAr}</p>}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-y-2 text-sm text-slate-600">
                        <div className="flex w-full items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-slate-400" />
                            <span className="line-clamp-1">{item.city}</span>
                        </div>
                        <div className="flex w-full items-center gap-1.5">
                            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-slate-900">{item.averageRating?.toFixed(1) || '0.0'}</span>
                            <span className="text-xs text-slate-400">({item.totalReviews || 0} {t('workshops.reviews')})</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-medium text-slate-500">{phone}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:gap-2">
                            {t('common.viewDetails')}
                            <ArrowRight className="size-4 transition-all group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function WorkshopsComprehensiveCarePage() {
    const { t, i18n } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'ADMIN';
    const PAGE_SIZE = 12;
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const isAr = i18n.language === 'ar';

    const { data: workshops = [], isLoading: loadingWorkshops } = useQuery({
        queryKey: ['workshops-admin-all'],
        queryFn: () => workshopService.getAllWorkshopsAdmin(),
        enabled: isAdmin,
    });

    const { data: careVendors = [], isLoading: loadingVendors } = useQuery({
        queryKey: ['vendors-comprehensive-care'],
        queryFn: () => vendorService.getVendors({ vendorType: 'COMPREHENSIVE_CARE' }),
        enabled: isAdmin,
    });

    const filteredEntities = useMemo(() => {
        // Certified workshops might also offer "comprehensive care" or "detailing"
        const filteredWorkshops = workshops.filter(w => {
            const services = String(w.services || '').toLowerCase();
            return services.includes('comprehensive') || services.includes('عناية') || services.includes('شاملة') || services.includes('care');
        });

        const merged = [...filteredWorkshops, ...careVendors];

        return merged.filter(item => {
            const name = item.name || item.businessName || '';
            const nameAr = item.nameAr || item.businessNameAr || '';
            return !search ||
                name.toLowerCase().includes(search.toLowerCase()) ||
                nameAr.toLowerCase().includes(search.toLowerCase());
        });
    }, [workshops, careVendors, search]);

    const { paginatedItems, totalPages, total } = useMemo(() => {
        const totalCount = filteredEntities.length;
        const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
        const effectivePage = Math.min(page, pages);
        const start = (effectivePage - 1) * PAGE_SIZE;
        return { paginatedItems: filteredEntities.slice(start, start + PAGE_SIZE), totalPages: pages, total: totalCount };
    }, [filteredEntities, page]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <Building2 className="mb-4 size-16 text-slate-200" />
                <h2 className="text-xl font-bold text-slate-900">{isAr ? 'صفحة إدارية' : 'Admin Page'}</h2>
                <p className="mt-2 text-slate-500">{isAr ? 'هذه الصفحة للمسؤولين فقط.' : 'This page is for administrators only.'}</p>
            </div>
        );
    }

    const isLoading = loadingWorkshops || loadingVendors;

    return (
        <div className="space-y-8">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 shadow-xl shadow-purple-500/20">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <ShieldCheck className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{isAr ? 'مقدمي العناية الشاملة' : 'Comprehensive Care Vendors'}</h1>
                            <p className="mt-2 max-w-xl text-purple-100/90">{isAr ? 'عرض كافة الفيندوز والورش التي توفر خدمات العناية الشاملة للسيارات.' : 'View all vendors and workshops providing comprehensive car care services.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input type="search" placeholder={t('workshops.searchWorkshops')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    </div>
                    <div className="text-sm text-slate-500">{isAr ? `تم العثور على ${total} كيان` : `Found ${total} entities`}</div>
                </div>

                {isLoading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />)}
                    </div>
                ) : paginatedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                        <ShieldCheck className="mb-4 size-14 text-slate-300" />
                        <p className="text-slate-600">{isAr ? 'لا توجد كيانات متوفرة حالياً' : 'No entities found'}</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedItems.map((item) => <EntityCard key={item.id} item={item} t={t} />)}
                    </div>
                )}

                <div className="mt-8">
                    <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} disabled={isLoading} />
                </div>
            </div>
        </div>
    );
}
