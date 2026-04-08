import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';

/**
 * For vendor users: redirects to their vendor detail page (/vendors/:id).
 * Used by the sidebar link so each vendor can open their own store page.
 */
export default function MyVendorRedirectPage() {
  const user = useAuthStore((s) => s.user);
  const isVendor = user?.role === 'VENDOR';

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['vendor-profile-me'],
    queryFn: () => vendorService.getMyVendorProfile(),
    enabled: isVendor,
    staleTime: 60_000,
  });

  if (!isVendor) return <Navigate to="/dashboard" replace />;
  if (isError || !profile?.id) return <Navigate to="/dashboard" replace />;
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-slate-500">
        <span>جاري التوجيه...</span>
      </div>
    );
  }
  return <Navigate to={`/vendors/${profile.id}`} replace />;
}
