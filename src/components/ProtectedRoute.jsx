import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, requireAdmin = true }) {
  const location = useLocation();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAdmin = user?.role === 'ADMIN';

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-4 h-48 w-full max-w-md animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="mb-4 text-slate-600">{t('error.permissionDenied')}</p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('error.backToLogin')}
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {t('error.goToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
