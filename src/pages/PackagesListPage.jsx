import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Package, Calendar, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import packageService from '../services/packageService';

function PackageCard({ pkg, onPurchase, isPurchasing }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isArabic && pkg.nameAr ? pkg.nameAr : pkg.name}
            </h3>
            {pkg.description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {isArabic && pkg.descriptionAr ? pkg.descriptionAr : pkg.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">{Number(pkg.price).toFixed(2)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400"> SAR</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Calendar className="size-4" />
            <span>{pkg.validityDays} {t('packages.days', 'days')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Package className="size-4" />
            <span>
              {pkg.usageCount === null || pkg.usageCount === undefined 
                ? t('packages.unlimited', 'Unlimited') 
                : `${pkg.usageCount} ${t('packages.uses', 'uses')}`}
            </span>
          </div>
        </div>
        
        {pkg.services && pkg.services.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('packages.includedServices', 'Included Services')}:
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {pkg.services.map(ps => (
                <span 
                  key={ps.id} 
                  className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  <Check className="size-3" />
                  {isArabic && ps.service.nameAr ? ps.service.nameAr : ps.service.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={() => onPurchase(pkg.id)}
          disabled={isPurchasing}
          className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPurchasing ? t('packages.purchasing', 'Purchasing...') : t('packages.purchaseNow', 'Purchase Now')}
        </button>
      </div>
    </div>
  );
}

export default function PackagesListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchasingId, setPurchasingId] = useState(null);

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await packageService.getAllPackages();
      return res.data.data;
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: packageService.purchasePackage,
    onMutate: (vars) => setPurchasingId(vars.packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-packages'] });
      toast.success(t('packages.purchased', 'Package purchased successfully!'));
      navigate('/my-packages');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('packages.purchaseError', 'Error purchasing package'));
    },
    onSettled: () => setPurchasingId(null)
  });

  const handlePurchase = (packageId) => {
    purchaseMutation.mutate(packageId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('packages.availablePackages', 'Available Packages')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.choosePackage', 'Choose a package that suits your needs')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : packagesData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="size-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('packages.noPackagesAvailable', 'No packages available')}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.checkLater', 'Check back later for available packages')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packagesData?.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onPurchase={handlePurchase}
              isPurchasing={purchasingId === pkg.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
