import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../hooks/useDateFormat';
import { Bell, Check, CheckCheck, Loader2, Info, AlertTriangle, Wallet, Calendar, Star, Users } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { useAuthStore } from '../store/authStore';

const PAGE_SIZE = 20;

function getTypeConfig(type) {
  switch (type) {
    case 'SYSTEM':
      return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'WALLET':
    case 'POINTS':
      return { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 'BOOKING':
      return { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' };
    case 'RATING':
      return { icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' };
    default:
      return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100' };
  }
}

function NotificationRow({ item, onMarkRead, t, i18n, isAdminView, fmtDT }) {
  const isRead = item.isRead ?? false;
  const type = item.type || 'SYSTEM';
  const { icon: Icon, color, bg } = getTypeConfig(type);

  const title = (i18n.language === 'ar' && item.titleAr) ? item.titleAr : (item.title || '—');
  const message = (i18n.language === 'ar' && item.messageAr) ? item.messageAr : (item.message || '');

  const createdAt = item.createdAt
    ? fmtDT(item.createdAt)
    : '—';

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${!isRead ? 'bg-indigo-50/20' : ''}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-start gap-4">
          <span
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${isRead ? 'bg-slate-100 text-slate-400' : `${bg} ${color}`
              }`}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isRead ? 'text-slate-600' : 'text-slate-900'}`}>{title}</p>
              {!isRead && <span className="flex size-2 rounded-full bg-indigo-600" />}
            </div>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{message}</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-[11px] font-medium text-slate-400">
                {createdAt}
              </p>
              {isAdminView && item.user && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  <Users className="size-3" /> {item.user.profile?.firstName || item.user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${isRead ? 'bg-slate-100 text-slate-500' : `${bg} ${color} opacity-80`
          }`}>
          {t(`services.types.${type}`, type)}
        </span>
      </td>
      <td className="w-32 px-6 py-4 text-right">
        {!isRead && (
          <button
            type="button"
            onClick={() => onMarkRead(item.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 transition-all hover:bg-indigo-50 hover:ring-indigo-300"
          >
            <Check className="size-3.5" /> {t('notifications.markRead')}
          </button>
        )}
      </td>
    </motion.tr>
  );
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const { fmtDT } = useDateFormat();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'all'
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', page, unreadOnly, viewMode],
    queryFn: () => {
      const params = { page, limit: PAGE_SIZE };
      if (viewMode === 'all' && isAdmin) {
        return notificationService.getAdminNotifications(params);
      }
      return notificationService.getNotifications({
        ...params,
        unreadOnly: unreadOnly ? 'true' : undefined,
      });
    },
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.response?.data?.error || t('common.error')),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.response?.data?.error || t('common.error')),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages ?? 1;
  const total = pagination.total ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('notifications.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('settings.viewManageNotifications')}</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="mr-4 flex rounded-xl bg-slate-100 p-1 shadow-inner">
              <button
                onClick={() => { setViewMode('personal'); setPage(1); }}
                className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${viewMode === 'personal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('notifications.myNotifications', 'Personal')}
              </button>
              <button
                onClick={() => { setViewMode('all'); setPage(1); }}
                className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('notifications.systemArchive', 'All Users')}
              </button>
            </div>
          )}
          <label className="relative inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              disabled={viewMode === 'all'}
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            {t('notifications.unreadOnly')}
          </label>
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || items.every((i) => i.isRead) || viewMode === 'all'}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {markAllRead.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
            {t('notifications.markAllRead')}
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
          {isLoading ? (
            <div className="space-y-4 p-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
                <AlertTriangle className="size-8" />
              </div>
              <p className="font-semibold text-slate-900">{t('common.error')}</p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">{t('error.somethingWentWrong')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
              <div className="p-6 rounded-3xl bg-slate-50 text-slate-300 mb-6">
                <Bell className="size-16" />
              </div>
              <p className="text-lg font-bold text-slate-900">{t('notifications.noNotifications')}</p>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">{t('notifications.allCaughtUp')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-start text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {t('notifications.notification')}
                      </th>
                      <th className="px-6 py-4 text-start text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {t('services.type')}
                      </th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        isAdminView={viewMode === 'all'}
                        onMarkRead={(id) => markRead.mutate(id)}
                        t={t}
                        i18n={i18n}
                        fmtDT={fmtDT}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                    disabled={isLoading}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}


