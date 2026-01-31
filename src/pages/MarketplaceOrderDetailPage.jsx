import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceOrderService } from '../services/marketplaceOrderService';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, Package, User, MapPin, CreditCard, 
  CheckCircle, Truck, AlertTriangle, Printer 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MarketplaceOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const isVendor = user?.role === 'VENDOR';

  const { data: order, isLoading } = useQuery({
    queryKey: ['marketplace-order', id],
    queryFn: () => marketplaceOrderService.getOrderById(id)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }) => marketplaceOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace-order', id]);
      toast.success('Order status updated');
    },
    onError: (err) => toast.error('Failed to update status')
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) => marketplaceOrderService.updateOrderItemStatus(id, itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace-order', id]);
      toast.success('Item status updated');
    },
    onError: (err) => toast.error('Failed to update item status')
  });

  if (isLoading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Order #{order.orderNumber}
            <span className={`text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium`}>
              {order.status}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          
          {isAdmin && (
            <select 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={order.status}
              onChange={(e) => updateStatusMutation.mutate({ status: e.target.value })}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s} className="text-black">{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> Order Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-slate-50">
                  <div className="w-20 h-20 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.autoPart.images?.[0]?.url ? (
                      <img src={item.autoPart.images[0].url} alt={item.autoPart.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-slate-800">{item.autoPart.name}</h3>
                      <span className="font-semibold text-slate-900">{item.totalPrice} SAR</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">SKU: {item.autoPart.sku}</p>
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-sm text-slate-600">
                        Qty: {item.quantity} × {item.unitPrice} SAR
                      </div>
                      
                      {/* Vendor Actions / Status Display */}
                      <div className="flex items-center gap-2">
                        {isVendor ? (
                          <select 
                            className="text-xs border rounded p-1"
                            value={item.status}
                            onChange={(e) => updateItemStatusMutation.mutate({ itemId: item.id, status: e.target.value })}
                          >
                             {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-white border rounded text-slate-600">
                             Item Status: {item.status}
                          </span>
                        )}
                        
                        {item.vendor && (
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {item.vendor.businessName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{order.subtotal} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{order.shippingCost} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (15%)</span>
                <span>{order.tax} SAR</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                <span>Total</span>
                <span>{order.totalAmount} SAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Customer & Shipping Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Customer Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-800">
                     {order.customer?.profile?.firstName} {order.customer?.profile?.lastName}
                   </p>
                   <p className="text-sm text-slate-500">{order.customer?.email}</p>
                   <p className="text-sm text-slate-500">{order.customer?.phone}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Shipping Address
            </h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">{order.recipientName || 'N/A'}</p>
              <p>{order.shippingAddress || 'No address provided'}</p>
              <p>{order.shippingCity}, {order.shippingCountry}</p>
              <p className="mt-2 text-slate-500">Phone: {order.recipientPhone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Info
            </h2>
            <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-500">Method</span>
                 <span className="font-medium translate-y-[1px]">{order.paymentMethod || 'Unknown'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500">Status</span>
                 <span className={`font-medium px-2 py-0.5 rounded text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                   {order.paymentStatus}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
