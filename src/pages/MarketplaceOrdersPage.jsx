import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { marketplaceOrderService } from '../services/marketplaceOrderService';
import { useAuthStore } from '../store/authStore';
import { 
  Search, Filter, Package, Truck, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Eye 
} from 'lucide-react';
import { Link } from 'react-router-dom';


export default function MarketplaceOrdersPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const isVendor = user?.role === 'VENDOR';
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Determine which fetch function to use based on role
  const fetchOrders = async (params) => {
    if (isAdmin) return marketplaceOrderService.getAllOrders(params);
    if (isVendor) return marketplaceOrderService.getVendorOrders(params);
    return { data: [], pagination: {} };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace-orders', page, statusFilter, search, user.role],
    queryFn: () => fetchOrders({ page, limit: 10, status: statusFilter || undefined, search: search || undefined }),
    keepPreviousData: true
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-indigo-100 text-indigo-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAdmin ? t('marketplaceOrders.titleAdmin') : t('marketplaceOrders.titleVendor')}
          </h1>
          <p className="text-slate-500">{t('marketplaceOrders.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rtl:left-auto rtl:right-3" />
          <input 
            type="text"
            placeholder={t('marketplaceOrders.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 rtl:pl-4 rtl:pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-4 h-4" />
          <select 
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('common.status')}</option>
            <option value="PENDING">{t('finance.status.PENDING')}</option>
            <option value="CONFIRMED">{t('finance.status.CONFIRMED') || 'Confirmed'}</option>
            <option value="PROCESSING">{t('finance.status.PROCESSING')}</option>
            <option value="SHIPPED">{t('finance.status.SHIPPED') || 'Shipped'}</option>
            <option value="DELIVERED">{t('finance.status.DELIVERED') || 'Delivered'}</option>
            <option value="CANCELLED">{t('finance.status.CANCELLED')}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">{t('marketplaceOrders.noOrders')}</h3>
            <p className="text-slate-500">{t('marketplaceOrders.noOrdersDesc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">{t('marketplaceOrders.orderNumber')}</th>
                  <th className="px-6 py-4">{t('bookings.customer')}</th>
                  <th className="px-6 py-4">{t('bookings.date')}</th>
                  <th className="px-6 py-4">{t('bookings.totalPrice')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      {order.customer?.profile?.firstName} {order.customer?.profile?.lastName}
                      <div className="text-xs text-slate-400">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.totalAmount} SAR
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {t(`finance.status.${order.status}`) || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/marketplace-orders/${order.id}`} // Fixed path to match likely route
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <Eye className="w-4 h-4" /> {t('common.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination - Translating manually to keep logic simple */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t('pagination.previous')}
            </button>
            <span className="text-sm text-slate-500">
              {t('pagination.page')} {page} {t('pagination.of')} {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t('pagination.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
