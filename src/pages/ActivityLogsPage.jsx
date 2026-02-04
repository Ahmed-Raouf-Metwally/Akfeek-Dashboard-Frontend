import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, User, CalendarCheck, FileText, Wrench, Filter } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';

const ACTION_ICONS = {
  'user.login': User,
  'user.status_changed': User,
  'booking.created': CalendarCheck,
  'service.updated': Wrench,
  'invoice.issued': FileText,
};

const PAGE_SIZE = 10;

export default function ActivityLogsPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity', page, actionFilter],
    queryFn: () => dashboardService.getActivityLogs({ page, limit: PAGE_SIZE, action: actionFilter }),
    keepPreviousData: true,
  });

  const logs = data?.data?.data || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('activity.title')}</h2>
        <div className="relative flex items-center">
          <Filter className="absolute left-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('activity.filterPlaceholder')}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : isError ? (
            <div className="p-8 text-center text-red-500">{t('common.errorLoading')}</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">{t('common.noData')}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t('activity.action')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t('activity.entity')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t('common.user')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t('common.time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log, i) => {
                      const Icon = ACTION_ICONS[log.action] || Activity;
                      const time = log.createdAt
                        ? new Date(log.createdAt).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' })
                        : '—';
                        
                      const userName = log.user?.profile?.firstName 
                        ? `${log.user.profile.firstName} ${log.user.profile.lastName || ''}`
                        : log.user?.email || 'System';

                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.03 * i }}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Icon className="size-4" />
                              </span>
                              <span className="font-mono text-sm text-slate-800">{log.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {log.entity}
                            {log.entityId && <span className="text-slate-400"> #{log.entityId.slice(0, 8)}</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{userName}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{time}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="border-t border-slate-200 px-4 py-3">
                  <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
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
