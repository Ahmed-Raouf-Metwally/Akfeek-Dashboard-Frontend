import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, CalendarCheck, FileText, Wrench, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';

const MOCK_LOGS = [
  { id: '1', action: 'user.login', entity: 'User', entityId: 'u1', userId: 'admin', userName: 'Admin', createdAt: new Date().toISOString(), meta: {} },
  { id: '2', action: 'booking.created', entity: 'Booking', entityId: 'b1', userId: 'u2', userName: 'Customer', createdAt: new Date(Date.now() - 3600000).toISOString(), meta: { bookingNumber: 'BK-001' } },
  { id: '3', action: 'service.updated', entity: 'Service', entityId: 's1', userId: 'admin', userName: 'Admin', createdAt: new Date(Date.now() - 7200000).toISOString(), meta: { name: 'Oil Change' } },
  { id: '4', action: 'invoice.issued', entity: 'Invoice', entityId: 'i1', userId: 'system', userName: 'System', createdAt: new Date(Date.now() - 86400000).toISOString(), meta: {} },
  { id: '5', action: 'user.status_changed', entity: 'User', entityId: 'u3', userId: 'admin', userName: 'Admin', createdAt: new Date(Date.now() - 172800000).toISOString(), meta: { status: 'ACTIVE' } },
];

const ACTION_ICONS = {
  'user.login': User,
  'user.status_changed': User,
  'booking.created': CalendarCheck,
  'service.updated': Wrench,
  'invoice.issued': FileText,
};

const PAGE_SIZE = 10;

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? MOCK_LOGS.filter(
        (l) =>
          l.action.toLowerCase().includes(filter.toLowerCase()) ||
          (l.userName && l.userName.toLowerCase().includes(filter.toLowerCase()))
      )
    : MOCK_LOGS;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Activity & logs</h2>
        <div className="relative flex items-center">
          <Filter className="absolute left-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by action or user..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((log, i) => {
                  const Icon = ACTION_ICONS[log.action] || Activity;
                  const time = log.createdAt
                    ? new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                    : '—';
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
                      <td className="px-4 py-3 text-sm text-slate-600">{log.userName || log.userId || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{time}</td>
                    </motion.tr>
                  );
                })}
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
              />
            </div>
          )}
        </Card>
      </motion.div>

      <p className="text-sm text-slate-500">
        Activity feed is currently using sample data. Connect to an audit-log API or database for production.
      </p>
    </div>
  );
}
