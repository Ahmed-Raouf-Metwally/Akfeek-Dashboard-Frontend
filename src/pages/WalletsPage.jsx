import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet as WalletIcon, TrendingUp, Clock } from 'lucide-react';
import { walletService } from '../services/walletService';
import { Card } from '../components/ui/Card';

export default function WalletsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getMyWallet(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
          <p className="text-sm text-slate-500">View your wallet balance and transactions.</p>
        </div>
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
          <p className="text-sm text-slate-500">View your wallet balance and transactions.</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error?.message ?? 'Failed to load wallet.'}</p>
        </Card>
      </div>
    );
  }

  const balance = Number(data?.balance ?? 0);
  const pendingBalance = Number(data?.pendingBalance ?? 0);
  const currency = data?.currency || 'SAR';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
        <p className="text-sm text-slate-500">View your wallet balance and transactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Available Balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {balance.toFixed(2)} {currency}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100">
              <WalletIcon className="size-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pendingBalance.toFixed(2)} {currency}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="size-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-900">Transaction History</h3>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-8 text-center">
          <TrendingUp className="mx-auto mb-3 size-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Transaction history</p>
          <p className="mt-1 text-xs text-slate-400">
            Transaction history will be displayed here once the backend API is available.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Backend endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/transactions</code> (not implemented)
          </p>
        </div>
      </Card>
    </div>
  );
}
