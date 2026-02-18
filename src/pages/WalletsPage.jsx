import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  User,
  History,
  AlertCircle,
  Star,
  Award
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { walletService } from '../services/walletService';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import DetailModal from '../components/ui/DetailModal';
import ImageOrPlaceholder from '../components/ui/ImageOrPlaceholder';

export default function WalletsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isVendor = user?.role === 'VENDOR';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [historyModal, setHistoryModal] = useState({ open: false, walletId: null });

  // Fetch transactions only when modal is open
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions', historyModal.walletId],
    queryFn: () => walletService.getWalletTransactions(historyModal.walletId, { limit: 20 }),
    enabled: !!historyModal.walletId && historyModal.open,
  });

  const openHistoryModal = (walletId) => {
    setHistoryModal({ open: true, walletId });
  };

  const closeHistoryModal = () => {
    setHistoryModal({ open: false, walletId: null });
  };

  // Adjustment Modal State
  const [adjustmentModal, setAdjustmentModal] = useState({
    open: false,
    type: 'credit', // 'credit', 'debit', or 'points'
    user: null
  });
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  // Vendor: only their wallet (read-only). Admin: all wallets.
  const { data: myWalletData, isLoading: isLoadingMyWallet } = useQuery({
    queryKey: ['wallet-me'],
    queryFn: () => walletService.getMyWallet(),
    enabled: !!isVendor && !!user?.id,
  });

  const { data, isLoading: isLoadingAll, isError } = useQuery({
    queryKey: ['wallets', page, limit, search],
    queryFn: () => walletService.getAllWallets({ page, limit, search }),
    keepPreviousData: true,
    enabled: !isVendor,
  });

  const isLoading = isVendor ? isLoadingMyWallet : isLoadingAll;
  const walletsForDisplay = isVendor && myWalletData
    ? [{ id: myWalletData.id || 'me', user: { email: user?.email, role: user?.role, profile: user?.profile }, availableBalance: myWalletData.availableBalance ?? 0, pendingBalance: myWalletData.pendingBalance ?? 0, currency: myWalletData.currency ?? 'SAR', pointsBalance: myWalletData.pointsBalance ?? 0 }]
    : data?.wallets ?? [];

  // Credit Mutation
  const creditMutation = useMutation({
    mutationFn: (payload) => walletService.creditWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['wallets']);
      toast.success(t('finance.creditSuccess'));
      closeAdjustmentModal();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    }
  });

  // Debit Mutation
  const debitMutation = useMutation({
    mutationFn: (payload) => walletService.debitWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['wallets']);
      toast.success(t('finance.debitSuccess'));
      closeAdjustmentModal();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    }
  });

  // Points Adjustment Mutation
  const pointsMutation = useMutation({
    mutationFn: (payload) => walletService.adjustPoints(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['wallets']);
      toast.success(t('finance.pointsAdjustSuccess') || 'Points adjusted successfully');
      closeAdjustmentModal();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    }
  });

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error(t('validation.numberOnly'));
      return;
    }
    if (!reason) {
      toast.error(t('validation.required'));
      return;
    }

    const payload = {
      userId: adjustmentModal.user.id,
      amount: parseFloat(amount),
      reason
    };

    if (adjustmentModal.type === 'credit') {
      creditMutation.mutate(payload);
    } else if (adjustmentModal.type === 'debit') {
      debitMutation.mutate(payload);
    } else {
      pointsMutation.mutate({ ...payload, amount: parseInt(amount) });
    }
  };

  const openAdjustmentModal = (type, user) => {
    setAdjustmentModal({ open: true, type, user });
    setAmount('');
    setReason('');
  };

  const closeAdjustmentModal = () => {
    setAdjustmentModal({ open: false, type: 'credit', user: null });
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('finance.wallets')}</h1>
          <p className="text-sm text-slate-500">{isVendor ? (isAr ? 'رصيد المحفظة ونقاط الولاء الخاص بك' : 'Your wallet and loyalty points balance') : t('finance.manageWallets')}</p>
        </div>
      </div>

      {isVendor && myWalletData && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-100">
                <Wallet className="size-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{isAr ? 'رصيد المحفظة' : 'Wallet balance'}</p>
                <p className="text-2xl font-bold text-slate-900">{myWalletData.availableBalance ?? 0} {myWalletData.currency ?? 'SAR'}</p>
                {(myWalletData.pendingBalance ?? 0) > 0 && (
                  <p className="text-xs text-slate-500">{isAr ? 'معلق: ' : 'Pending: '}{myWalletData.pendingBalance} {myWalletData.currency ?? 'SAR'}</p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
                <Star className="size-8 text-amber-600 fill-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{isAr ? 'رصيد نقاط الولاء' : 'Loyalty points'}</p>
                <p className="text-2xl font-bold text-slate-900">{myWalletData.pointsBalance ?? 0} {isAr ? 'نقطة' : 'pts'}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!isVendor && (
      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('finance.searchUser')}
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">{t('finance.user')}</th>
                <th className="px-6 py-4 font-medium">{t('finance.availableBalance')}</th>
                <th className="px-6 py-4 font-medium">{t('finance.pendingBalance')}</th>
                <th className="px-6 py-4 font-medium">{t('finance.points')}</th>
                {!isVendor && <th className="px-6 py-4 font-medium text-right">{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-8 w-16 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : !isVendor && isError ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                    <AlertCircle className="mx-auto mb-2 size-8" />
                    {t('common.error')}
                  </td>
                </tr>
              ) : walletsForDisplay.length === 0 ? (
                <tr>
                  <td colSpan={isVendor ? 4 : 5} className="px-6 py-12 text-center text-slate-500">
                    <Wallet className="mx-auto mb-2 size-8 text-slate-300" />
                    {isVendor ? (t('finance.noWalletYet') || 'No wallet data yet') : t('common.noUsers')}
                  </td>
                </tr>
              ) : (
                walletsForDisplay.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ImageOrPlaceholder
                          src={wallet.user?.profile?.avatarUrl}
                          alt={wallet.user?.email}
                          className="size-8 rounded-full"
                          iconSize={16}
                        />
                        <div>
                          <p className="font-medium text-slate-900">{wallet.user?.email}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-tighter">{wallet.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {wallet.availableBalance} {wallet.currency}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {wallet.pendingBalance} {wallet.currency}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                        <Star className="size-4 fill-amber-600" />
                        {wallet.pointsBalance || 0}
                      </div>
                    </td>
                    {!isVendor && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openHistoryModal(wallet.id)}
                            className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            title={t('finance.history')}
                          >
                            <History className="size-3" />
                            {t('finance.history')}
                          </button>
                          <button
                            onClick={() => openAdjustmentModal('credit', wallet.user)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title={t('finance.credit')}
                          >
                            <Plus className="size-3" />
                            {t('finance.credit')}
                          </button>
                          <button
                            onClick={() => openAdjustmentModal('debit', wallet.user)}
                            className="flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                            title={t('finance.debit')}
                          >
                            <Minus className="size-3" />
                            {t('finance.debit')}
                          </button>
                          <button
                            onClick={() => openAdjustmentModal('points', wallet.user)}
                            className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-100 transition-colors"
                            title={t('finance.adjustPoints')}
                          >
                            <Award className="size-3" />
                            {t('finance.points')}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="border-t border-slate-100 p-4">
            <Pagination
              currentPage={page}
              totalPages={data.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
      )}

      {/* Credit/Debit Modal */}
      <DetailModal
        open={adjustmentModal.open}
        onClose={closeAdjustmentModal}
        title={
          adjustmentModal.type === 'credit' ? t('finance.creditWallet') :
            adjustmentModal.type === 'debit' ? t('finance.debitWallet') :
              t('finance.adjustPoints')
        }
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <ImageOrPlaceholder
              src={adjustmentModal.user?.profile?.avatarUrl}
              className="size-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{adjustmentModal.user?.email}</p>
              <p className="text-xs text-slate-500 uppercase">{adjustmentModal.user?.role}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {adjustmentModal.type === 'points' ? t('finance.points') : t('finance.amount')}
            </label>
            <div className="relative">
              <input
                type="number"
                step={adjustmentModal.type === 'points' ? "1" : "0.01"}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                {adjustmentModal.type === 'points' ? 'PTS' : 'SAR'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('finance.reason')}</label>
            <textarea
              required
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={adjustmentModal.type === 'credit' ? 'e.g. Refund, Bonus' : 'e.g. Withdrawal, Correction'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeAdjustmentModal}
              className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={creditMutation.isLoading || debitMutation.isLoading || pointsMutation.isLoading}
              className={`flex-1 rounded-lg py-2 text-sm font-medium text-white shadow-sm transition-colors ${adjustmentModal.type === 'credit'
                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                : adjustmentModal.type === 'debit'
                  ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                  : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300'
                }`}
            >
              {creditMutation.isLoading || debitMutation.isLoading || pointsMutation.isLoading ? t('common.loading') : t('common.confirm')}
            </button>
          </div>
        </form>
      </DetailModal>

      {/* History Modal */}
      <DetailModal
        open={historyModal.open}
        onClose={closeHistoryModal}
        title={t('finance.transactionHistory') || 'Transaction History'}
        className="max-w-7xl"
      >
        <div className="space-y-4">
          {isLoadingTransactions ? (
            <div className="flex justify-center p-8">
              <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : transactionsData?.transactions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <History className="mb-2 size-8 text-slate-300" />
              <p>{t('common.noData')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">{t('bookings.date')}</th>
                    <th className="px-4 py-2">{t('finance.type')}</th>
                    <th className="px-4 py-2">{t('finance.amount')}</th>
                    <th className="px-4 py-2">{t('common.status')}</th>
                    <th className="px-4 py-2">{t('finance.performedBy') || 'Performed By'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactionsData?.transactions?.map((txn) => (
                    <tr key={txn.id}>
                      <td className="px-4 py-2 text-slate-600">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {txn.type}
                        <p className="text-xs font-normal text-slate-500">{txn.description}</p>
                      </td>
                      <td className={`px-4 py-2 font-semibold ${Number(txn.amount) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {Number(txn.amount) > 0 ? '+' : ''}{Number(txn.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${txn.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          txn.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {txn.performedBy ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">
                              {txn.performedBy.profile?.firstName} {txn.performedBy.profile?.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">{txn.performedBy.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DetailModal>
    </div>
  );
}
