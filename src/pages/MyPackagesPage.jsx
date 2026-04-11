import React from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Package, Calendar, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import packageService from '../services/packageService';

function UsageBar({ usage, total }) {
  const percentage = total ? (usage / total) * 100 : 0;
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{usage} / {total} used</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div 
          className={`h-full transition-all ${
            percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PackageUsageCard({ userPackage }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const pkg = userPackage.package;
  const isExpired = userPackage.isExpired;
  const remainingDays = userPackage.remainingDays;

  const totalUsage = pkg.usageCount;
  const usedUsage = userPackage.usages?.reduce((sum, u) => sum + u.usedCount, 0) || 0;

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${
      isExpired 
        ? 'border-red-200 dark:border-red-900/50' 
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isExpired 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {isExpired ? t('packages.expired', 'Expired') : t('packages.active', 'Active')}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isArabic && pkg.nameAr ? pkg.nameAr : pkg.name}
            </h3>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Calendar className="size-4" />
              <span>
                {isExpired 
                  ? t('packages.expiredOn', 'Expired on') + ' ' + new Date(userPackage.expiresAt).toLocaleDateString()
                  : remainingDays + ' ' + t('packages.daysLeft', 'days left')
                }
              </span>
            </div>
          </div>
        </div>
        
        {pkg.services && pkg.services.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('packages.services', 'Services')}:
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {pkg.services.map(ps => {
                const usage = userPackage.usages?.find(u => u.serviceId === ps.serviceId);
                const usedCount = usage?.usedCount || 0;
                
                return (
                  <div 
                    key={ps.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <Check className="size-3 text-green-500" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {isArabic && ps.service.nameAr ? ps.service.nameAr : ps.service.name}
                      </span>
                    </div>
                    {!isExpired && totalUsage && (
                      <UsageBar usage={usedCount} total={totalUsage} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {!isExpired && !totalUsage && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 p-2 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="size-4" />
            <span>{t('packages.unlimitedUsage', 'Unlimited usage')}</span>
          </div>
        )}
        
        {isExpired && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="size-4" />
            <span>{t('packages.packageExpired', 'This package has expired')}</span>
          </div>
        )}
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('packages.purchasedOn', 'Purchased on')}: {new Date(userPackage.purchasedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default function MyPackagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['user-packages'],
    queryFn: async () => {
      const res = await packageService.getUserPackages(false);
      return res.data.data;
    }
  });

  const activePackages = packagesData?.filter(p => !p.isExpired) || [];
  const expiredPackages = packagesData?.filter(p => p.isExpired) || [];

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
            {t('packages.myPackages', 'My Packages')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.viewYourPackages', 'View and manage your purchased packages')}
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
            {t('packages.noPackagesPurchased', 'No packages purchased yet')}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('packages.browsePackages', 'Browse available packages and purchase one')}
          </p>
          <button
            onClick={() => navigate('/packages')}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {t('packages.browsePackages', 'Browse Packages')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activePackages.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('packages.activePackages', 'Active Packages')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activePackages.map(pkg => (
                  <PackageUsageCard key={pkg.id} userPackage={pkg} />
                ))}
              </div>
            </div>
          )}
          
          {expiredPackages.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('packages.expiredPackages', 'Expired Packages')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {expiredPackages.map(pkg => (
                  <PackageUsageCard key={pkg.id} userPackage={pkg} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
