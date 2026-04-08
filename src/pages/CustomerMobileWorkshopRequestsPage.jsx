import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Truck, ArrowRight, CalendarCheck } from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useDateFormat } from '../hooks/useDateFormat';

export default function CustomerMobileWorkshopRequestsPage() {
  const { i18n } = useTranslation();
  const { fmtDT } = useDateFormat();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer-mobile-workshop-requests'],
    queryFn: () => mobileWorkshopService.getMyRequestsAsCustomer(),
    staleTime: 30_000,
  });

  const requests = data?.data ?? [];
  const isAr = i18n.language === 'ar';

  if (user?.role !== 'CUSTOMER') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            {isAr ? 'هذه الصفحة للعملاء لعرض طلبات الورش المتنقلة.' : 'This page is for customers to view their mobile workshop requests.'}
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{error?.message || (isAr ? 'فشل تحميل الطلبات' : 'Failed to load requests')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Truck className="size-6 text-indigo-600" />
          {isAr ? 'طلبات الورش المتنقلة' : 'My Mobile Workshop Requests'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAr ? 'عرض طلباتك والورش التي وافقت عليها (مع السعر والتفاصيل)' : 'View your requests and workshops that approved with price and details'}
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          {isAr ? 'لا توجد طلبات.' : 'No requests yet.'}
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const offersCount = req.offers?.length ?? 0;
            return (
              <Link
                key={req.id}
                to={`/my-mobile-workshop-requests/${req.id}`}
                className="block"
              >
                <Card className="p-4 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <CalendarCheck className="size-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {req.requestNumber || req.id?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {req.workshopType?.nameAr || req.workshopType?.name} — {fmtDT(req.createdAt)}
                      </p>
                      {offersCount > 0 && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {isAr ? `${offersCount} ورشة وافقت` : `${offersCount} workshop(s) approved`}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-slate-400" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
