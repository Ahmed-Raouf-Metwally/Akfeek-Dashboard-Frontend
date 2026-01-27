import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';

const PAGE_SIZE = 20;

function NotificationRow({ item, onMarkRead }) {
  const isRead = item.isRead ?? false;
  const type = item.type || 'MESSAGE';
  const title = item.title || '—';
  const message = item.message || '';
  const createdAt = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${!isRead ? 'bg-indigo-50/30' : ''}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
              isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <Bell className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-medium ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>{title}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{message}</p>
            <p className="mt-1 text-xs text-slate-400">{createdAt}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {type}
        </span>
      </td>
      <td className="w-24 px-4 py-3 text-right">
        {!isRead && (
          <button
            type="button"
            onClick={() => onMarkRead(item.id)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            <Check className="size-3.5" /> Mark read
          </button>
        )}
      </td>
    </motion.tr>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', page, unreadOnly],
    queryFn: () =>
      notificationService.getNotifications({
        page,
        limit: PAGE_SIZE,
        unreadOnly: unreadOnly ? 'true' : undefined,
      }),
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Marked as read');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to update'),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to update'),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages ?? 1;
  const total = pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Unread only
          </label>
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || items.every((i) => i.isRead)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {markAllRead.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
            Mark all read
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <p>Failed to load notifications.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Bell className="mb-3 size-12 text-slate-300" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Notification
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="w-24 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onMarkRead={(id) => markRead.mutate(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="border-t border-slate-200 px-4 py-3">
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
