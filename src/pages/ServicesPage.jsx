import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Wrench, Building2, Car, Truck, Droplets } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

const SOURCE_LABELS = {
  CERTIFIED_WORKSHOP: { ar: 'الورش المعتمدة', icon: Building2 },
  CAR_WASH: { ar: 'ورش الغسيل', icon: Droplets },
  COMPREHENSIVE_CARE: { ar: 'العناية الشاملة', icon: Car },
  WINCH: { ar: 'الوينشات', icon: Truck },
  MOBILE_WORKSHOP: { ar: 'الورش المتنقلة', icon: Wrench },
};

function ServiceCard({ item, sourceLabel }) {
  const Icon = sourceLabel?.icon || Wrench;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{item.nameAr || item.name}</p>
        {item.nameAr && item.name !== item.nameAr && (
          <p className="text-sm text-slate-500">{item.name}</p>
        )}
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {item.price != null && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
              {item.price} {item.currency || 'ر.س'}
            </span>
          )}
          {item.estimatedDuration != null && (
            <span className="text-xs text-slate-400">⏱ {item.estimatedDuration} دقيقة</span>
          )}
          {item.providerName && (
            <span className="text-xs text-slate-500">— {item.providerName}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ titleAr, items, icon: Icon, searchTerm }) {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const t = searchTerm.toLowerCase();
    return items.filter(
      (i) =>
        (i.name && i.name.toLowerCase().includes(t)) ||
        (i.nameAr && i.nameAr.includes(searchTerm)) ||
        (i.providerName && i.providerName.toLowerCase().includes(t))
    );
  }, [items, searchTerm]);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <Icon className="size-4" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-900">{titleAr}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-600">
          {filtered.length} خدمة
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ServiceCard key={item.id} item={item} sourceLabel={SOURCE_LABELS[item.source]} />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'all-sub-services'],
    queryFn: () => dashboardService.getAllSubServices(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64">
          <TableSkeleton rows={1} cols={2} />
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={3} />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{error?.message || t('error.loadFailed', 'فشل تحميل الخدمات')}</p>
        </Card>
      </div>
    );
  }

  const {
    certifiedWorkshop = [],
    carWash = [],
    comprehensiveCare = [],
    winches = [],
    mobileWorkshop = [],
  } = data;

  const totalCount =
    certifiedWorkshop.length +
    carWash.length +
    comprehensiveCare.length +
    winches.length +
    mobileWorkshop.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAr ? 'الخدمات' : 'Services'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? 'عرض كل الخدمات الفرعية: الورش المعتمدة، ورش الغسيل، العناية الشاملة، الوينشات، الورش المتنقلة'
              : 'All sub-services from certified workshops, car wash, comprehensive care, winches, mobile workshops'}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm font-medium text-slate-600">{totalCount}</span>
          <span className="text-sm text-slate-500">{isAr ? 'خدمة' : 'services'}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          placeholder={isAr ? 'بحث في الخدمات...' : 'Search services...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2.5 pr-10 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label={isAr ? 'بحث' : 'Search'}
        />
      </div>

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <SectionBlock
            titleAr="الورش المعتمدة"
            items={certifiedWorkshop}
            icon={Building2}
            searchTerm={search}
          />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <SectionBlock
            titleAr="ورش الغسيل"
            items={carWash}
            icon={Droplets}
            searchTerm={search}
          />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <SectionBlock
            titleAr="العناية الشاملة"
            items={comprehensiveCare}
            icon={Car}
            searchTerm={search}
          />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <SectionBlock
            titleAr="الوينشات"
            items={winches}
            icon={Truck}
            searchTerm={search}
          />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <SectionBlock
            titleAr="الورش المتنقلة"
            items={mobileWorkshop}
            icon={Wrench}
            searchTerm={search}
          />
        </motion.section>
      </div>

      {totalCount === 0 && (
        <Card className="p-12 text-center">
          <Wrench className="mx-auto size-12 text-slate-300" />
          <p className="mt-3 text-slate-500">{isAr ? 'لا توجد خدمات مسجّلة حالياً' : 'No services registered yet'}</p>
        </Card>
      )}
    </div>
  );
}
