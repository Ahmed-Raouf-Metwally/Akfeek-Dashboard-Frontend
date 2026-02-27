import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Filter,
    Eye,
    Trash2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Send,
    User,
    MessageCircle,
    Clock,
} from 'lucide-react';
import { useDateFormat } from '../hooks/useDateFormat';
import feedbackService from '../services/feedbackService';
import { Card } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import DetailModal from '../components/ui/DetailModal';
import { useAuthStore } from '../store/authStore';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';

const PAGE_SIZE = 10;

// Status colors and background
const STATUS_STYLES = {
    OPEN: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    RESOLVED: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    REJECTED: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    CLOSED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

// Priority styles
const PRIORITY_STYLES = {
    LOW: 'text-slate-500',
    MEDIUM: 'text-blue-600 font-medium',
    HIGH: 'text-orange-600 font-bold',
    URGENT: 'text-rose-600 animate-pulse font-extrabold flex items-center gap-1',
};

function StatCard({ icon: Icon, count, label, color }) {
    const colors = {
        rose: 'bg-rose-50 text-rose-600 ring-rose-100',
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    };
    return (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-2 ring-1 ${colors[color]}`}>
            <Icon className="size-5" />
            <div>
                <div className="text-lg font-bold leading-tight">{count}</div>
                <div className="text-[10px] font-medium uppercase tracking-tight opacity-70">{label}</div>
            </div>
        </div>
    );
}

function Header({ stats, isLoading }) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('feedback.title')}</h1>
                <p className="text-sm text-slate-500">{t('feedback.subtitle')}</p>
            </div>
            <div className="flex gap-2">
                <StatCard
                    icon={AlertTriangle}
                    count={stats?.urgentCount || 0}
                    label={t('feedback.urgent')}
                    color="rose"
                />
                <StatCard
                    icon={Clock}
                    count={stats?.pendingCount || 0}
                    label={t('feedback.pending')}
                    color="blue"
                />
            </div>
        </div>
    );
}


export default function FeedbackPage() {
    const { t, i18n } = useTranslation();
    const { fmt, fmtDT } = useDateFormat();
    const queryClient = useQueryClient();
    const isRTL = i18n.language === 'ar';

    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        category: '',
        priority: '',
        search: ''
    });

    const [selectedId, setSelectedId] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['feedback', page, filters],
        queryFn: () => feedbackService.getAll({
            page,
            limit: PAGE_SIZE,
            ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
        }),
        keepPreviousData: true
    });

    const { data: statsData, refetch: refetchStats } = useQuery({
        queryKey: ['feedback-stats'],
        queryFn: () => feedbackService.getStats(),
    });

    const stats = statsData?.data || { urgentCount: 0, pendingCount: 0 };

    const { data: detailData, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
        queryKey: ['feedback-detail', selectedId],
        queryFn: () => feedbackService.getById(selectedId),
        enabled: !!selectedId,
    });
    const list = data?.data ?? [];
    const pagination = data?.pagination ?? { total: 0, pages: 1, currentPage: 1 };
    const detail = detailData?.data;

    // Socket.io Real-time Integration
    useEffect(() => {
        if (!selectedId) return;

        // Join the feedback ticket room
        socketService.joinFeedbackTicket(selectedId);

        // Listen for new replies
        socketService.onNewReply((newReply) => {
            // Update the cache for the feedback details
            queryClient.setQueryData(['feedback-detail', selectedId], (oldData) => {
                if (!oldData?.data) return oldData;

                // Avoid duplicates if the reply was already added by the manual mutation
                const exists = oldData.data.replies?.some(r => r.id === newReply.id);
                if (exists) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        replies: [...(oldData.data.replies || []), newReply]
                    }
                };
            });

            // Refetch shared list to keep status updated
            refetch();
        });

        // Cleanup: Leave room and remove listener
        return () => {
            socketService.leaveFeedbackTicket(selectedId);
            socketService.offNewReply();
        };
    }, [selectedId, queryClient, refetch]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleStatusChange = async (id, status) => {
        try {
            await feedbackService.updateStatus(id, { status });
            toast.success(t('feedback.statusUpdated'));
            refetch();
            refetchStats();
            if (selectedId === id) refetchDetail();
        } catch (err) {
            toast.error(err.message || t('common.error'));
        }
    };

    const handlePriorityChange = async (id, priority) => {
        try {
            await feedbackService.updatePriority(id, priority);
            toast.success(t('feedback.priorityUpdated'));
            refetch();
            refetchStats();
            if (selectedId === id) refetchDetail();
        } catch (err) {
            toast.error(err.message || t('common.error'));
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;
        setIsSendingReply(true);
        try {
            await feedbackService.reply(selectedId, replyMessage);
            toast.success(t('feedback.replySuccess'));
            setReplyMessage('');
            refetchDetail();
            refetchStats();
            refetch(); // In case status changed to IN_PROGRESS
        } catch (err) {
            toast.error(err.message || t('common.error'));
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('common.confirmDelete', { name: t('feedback.feedbackItem') }))) return;
        try {
            await feedbackService.delete(id);
            toast.success(t('feedback.deletedSuccess'));
            refetch();
            refetchStats();
            if (selectedId === id) setSelectedId(null);
        } catch (err) {
            toast.error(err.message || t('common.error'));
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Header stats={stats} isLoading={true} />
                <Card className="overflow-hidden p-0">
                    <TableSkeleton rows={8} cols={6} />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Header stats={stats} />

            {/* Filters Bar */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search */}
                    <div className="relative">
                        <Search className={`absolute top-1/2 size-4 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <input
                            type="text"
                            placeholder={t('feedback.searchPlaceholder')}
                            className={`w-full rounded-lg border border-slate-200 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">{t('feedback.allStatuses')}</option>
                        <option value="OPEN">{t('feedback.status.OPEN')}</option>
                        <option value="IN_PROGRESS">{t('feedback.status.IN_PROGRESS')}</option>
                        <option value="RESOLVED">{t('feedback.status.RESOLVED')}</option>
                        <option value="REJECTED">{t('feedback.status.REJECTED')}</option>
                        <option value="CLOSED">{t('feedback.status.CLOSED')}</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">{t('feedback.allTypes')}</option>
                        <option value="COMPLAINT">{t('feedback.types.COMPLAINT')}</option>
                        <option value="SUGGESTION">{t('feedback.types.SUGGESTION')}</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">{t('feedback.allCategories')}</option>
                        <option value="DELIVERY">{t('feedback.categories.DELIVERY')}</option>
                        <option value="PAYMENT">{t('feedback.categories.PAYMENT')}</option>
                        <option value="PRODUCT">{t('feedback.categories.PRODUCT')}</option>
                        <option value="UI_UX">{t('feedback.categories.UI_UX')}</option>
                        <option value="OTHER">{t('feedback.categories.OTHER')}</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer"
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                        <option value="">{t('feedback.allPriorities')}</option>
                        <option value="LOW">{t('feedback.priorities.LOW')}</option>
                        <option value="MEDIUM">{t('feedback.priorities.MEDIUM')}</option>
                        <option value="HIGH">{t('feedback.priorities.HIGH')}</option>
                        <option value="URGENT">{t('feedback.priorities.URGENT')}</option>
                    </select>
                </div>
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('feedback.fields.subject')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('feedback.fields.user')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('feedback.fields.type')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('feedback.fields.priority')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.createdAt')}</th>
                                <th className="w-24 px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-500">{t('feedback.noFeedback')}</td>
                                </tr>
                            ) : (
                                list.map((item) => (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                                        <td className="px-4 py-4">
                                            <div className="max-w-xs space-y-0.5">
                                                <div className="truncate text-sm font-medium text-slate-900">{item.subject}</div>
                                                <div className="truncate text-xs text-slate-500">{item.message}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.isAnonymous ? (
                                                <span className="text-sm italic text-slate-400">{t('feedback.anonymous')}</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {item.user?.profile ? `${item.user.profile.firstName} ${item.user.profile.lastName}` : (item.user?.email || '—')}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">{item.user?.phone || ''}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-600">
                                                    {t(`feedback.types.${item.type}`)}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {t(`feedback.categories.${item.category}`)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none cursor-pointer ${STATUS_STYLES[item.status] || ''}`}
                                            >
                                                <option value="OPEN">{t('feedback.status.OPEN')}</option>
                                                <option value="IN_PROGRESS">{t('feedback.status.IN_PROGRESS')}</option>
                                                <option value="RESOLVED">{t('feedback.status.RESOLVED')}</option>
                                                <option value="REJECTED">{t('feedback.status.REJECTED')}</option>
                                                <option value="CLOSED">{t('feedback.status.CLOSED')}</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-xs">
                                            <select
                                                value={item.priority}
                                                onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                                                className={`bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer ${PRIORITY_STYLES[item.priority]}`}
                                            >
                                                <option value="LOW">{t('feedback.priorities.LOW')}</option>
                                                <option value="MEDIUM">{t('feedback.priorities.MEDIUM')}</option>
                                                <option value="HIGH">{t('feedback.priorities.HIGH')}</option>
                                                <option value="URGENT">{t('feedback.priorities.URGENT')}</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                                            {fmt(item.createdAt)}
                                        </td>
                                        <td className="px-4 py-4 text-end">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedId(item.id)}
                                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                    title={t('common.view')}
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination.pages > 1 && (
                    <div className="border-t border-slate-100 bg-white p-4">
                        <Pagination
                            page={page}
                            totalPages={pagination.pages}
                            total={pagination.total}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </Card>

            {/* Detail Modal */}
            <DetailModal
                title={t('feedback.details')}
                open={!!selectedId}
                onClose={() => {
                    setSelectedId(null);
                    setReplyMessage('');
                }}
            >
                {detailLoading ? (
                    <div className="space-y-4 py-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : detail ? (
                    <div className="space-y-6 py-2">
                        {/* Header Info */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-slate-900">{detail.subject}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{fmtDT(detail.createdAt)}</span>
                                    <span>•</span>
                                    <span className="font-medium text-indigo-600">{t(`feedback.categories.${detail.category}`)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[detail.status]}`}>
                                    {t(`feedback.status.${detail.status}`)}
                                </span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                    <User className="size-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {detail.isAnonymous ? t('feedback.anonymous') : (detail.user?.profile ? `${detail.user.profile.firstName} ${detail.user.profile.lastName}` : detail.user?.email)}
                                    </div>
                                    {!detail.isAnonymous && <div className="text-xs text-slate-500">{detail.user?.phone}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.description')}</label>
                            <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
                                {detail.message}
                            </div>
                        </div>

                        {/* Order Info if exists */}
                        {detail.order && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                                <div className="mb-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">{t('feedback.orderInfo')}</div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700">#{detail.order.orderNumber}</span>
                                    <span className="text-slate-500">{fmt(detail.order.createdAt)}</span>
                                </div>
                            </div>
                        )}

                        {/* Replies Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                                    <MessageCircle className="size-4 text-indigo-600" />
                                    {t('feedback.replies')}
                                </h4>
                                <span className="text-xs text-slate-400">{detail.replies?.length || 0}</span>
                            </div>

                            <div className="space-y-4">
                                {detail.replies && detail.replies.length > 0 ? (
                                    detail.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`flex flex-col gap-1 ${reply.senderType === 'ADMIN' ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${reply.senderType === 'ADMIN'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                                                }`}>
                                                {reply.message}
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {reply.senderType === 'ADMIN' ? t('common.admin') : t('feedback.anonymous')} • {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-sm text-slate-400 italic">
                                        {t('feedback.noReplies')}
                                    </div>
                                )}
                            </div>

                            {/* Reply Input */}
                            {detail.status === 'CLOSED' ? (
                                <div className="mt-6 rounded-xl bg-slate-100 p-4 text-center text-sm font-medium text-slate-500 border border-slate-200">
                                    <AlertTriangle className="size-4 mx-auto mb-2 text-slate-400" />
                                    {t('feedback.closedError')}
                                </div>
                            ) : (
                                <form onSubmit={handleReply} className="mt-6 flex items-end gap-2">
                                    <div className="relative flex-1">
                                        <textarea
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                            rows="2"
                                            placeholder={t('feedback.replyPlaceholder')}
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!replyMessage.trim() || isSendingReply}
                                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale"
                                    >
                                        <Send className={`size-5 ${isRTL ? 'rotate-180' : ''}`} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : null}
            </DetailModal>
        </div>
    );
}


