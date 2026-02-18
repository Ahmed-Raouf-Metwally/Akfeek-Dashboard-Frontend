import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
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
  const invoiceRef = useRef(null);
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

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;
    const prevTitle = document.title;
    document.title = `Invoice-${orderData?.orderNumber ?? id}`;
    const clone = printContent.cloneNode(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print the invoice.');
      document.title = prevTitle;
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${document.documentElement.dir || 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>Invoice ${orderData?.orderNumber ?? id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; font-size: 14px; color: #1e293b; padding: 24px; line-height: 1.5; }
            .invoice { max-width: 800px; margin: 0 auto; }
            h1 { font-size: 22px; margin-bottom: 8px; color: #0f172a; }
            .meta { color: #64748b; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; }
            .totals { margin-top: 16px; border-top: 2px solid #e2e8f0; padding-top: 12px; }
            .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
            .totals .total { font-weight: 700; font-size: 16px; margin-top: 8px; }
            .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
            .section h3 { font-size: 14px; margin-bottom: 8px; color: #475569; }
          </style>
        </head>
        <body><div class="invoice">${clone.innerHTML}</div></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      document.title = prevTitle;
    }, 250);
  };

  if (isLoading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const orderData = order?.data ?? order;
  const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const items = orderData.items ?? orderData.orderItems ?? [];
  const customerName = [orderData.customer?.profile?.firstName, orderData.customer?.profile?.lastName].filter(Boolean).join(' ') || orderData.customer?.email || '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hidden invoice content for print */}
      <div
        ref={invoiceRef}
        className="absolute -left-[9999px] top-0 w-[800px]"
        aria-hidden
      >
        <h1>فاتورة / Invoice #{orderData.orderNumber}</h1>
        <p className="meta">التاريخ / Date: {new Date(orderData.createdAt).toLocaleString()} · الحالة / Status: {orderData.status}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المنتج / Item</th>
              <th>SKU</th>
              <th>الكمية / Qty</th>
              <th>السعر / Price</th>
              <th>المجموع / Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.autoPart?.name ?? '—'}</td>
                <td>{item.autoPart?.sku ?? '—'}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice} SAR</td>
                <td>{item.totalPrice} SAR</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals">
          <div className="row"><span>المجموع الفرعي / Subtotal</span><span>{orderData.subtotal ?? 0} SAR</span></div>
          <div className="row"><span>الشحن / Shipping</span><span>{orderData.shippingCost ?? 0} SAR</span></div>
          <div className="row"><span>الضريبة / Tax</span><span>{orderData.tax ?? 0} SAR</span></div>
          <div className="row total"><span>الإجمالي / Total</span><span>{orderData.totalAmount ?? 0} SAR</span></div>
        </div>
        <div className="section">
          <h3>العميل / Customer</h3>
          <p>{customerName}</p>
          <p>{orderData.customer?.email}</p>
          <p>{orderData.customer?.phone}</p>
        </div>
        <div className="section">
          <h3>عنوان الشحن / Shipping Address</h3>
          <p>{orderData.recipientName || '—'}</p>
          <p>{orderData.shippingAddress || '—'}</p>
          <p>{orderData.shippingCity ?? ''}, {orderData.shippingCountry ?? ''}</p>
          <p>هاتف / Phone: {orderData.recipientPhone || '—'}</p>
        </div>
        <div className="section">
          <h3>الدفع / Payment</h3>
          <p>{orderData.paymentMethod || '—'} · {orderData.paymentStatus ?? '—'}</p>
        </div>
      </div>

      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Order #{orderData.orderNumber}
            <span className={`text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium`}>
              {orderData.status}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Placed on {new Date(orderData.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> طباعة الفاتورة / Print Invoice
          </button>
          
          {isAdmin && (
            <select 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={orderData.status}
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
              <Package className="w-5 h-5 text-indigo-500" /> Order Items ({items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-slate-50">
                  <div className="w-20 h-20 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.autoPart?.images?.[0]?.url ? (
                      <img src={item.autoPart.images[0].url} alt={item.autoPart?.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-slate-800">{item.autoPart?.name ?? '—'}</h3>
                      <span className="font-semibold text-slate-900">{item.totalPrice} SAR</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">SKU: {item.autoPart?.sku ?? '—'}</p>
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
                <span>{orderData.subtotal ?? 0} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{orderData.shippingCost ?? 0} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (15%)</span>
                <span>{orderData.tax ?? 0} SAR</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                <span>Total</span>
                <span>{orderData.totalAmount ?? 0} SAR</span>
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
                     {orderData.customer?.profile?.firstName} {orderData.customer?.profile?.lastName}
                   </p>
                   <p className="text-sm text-slate-500">{orderData.customer?.email}</p>
                   <p className="text-sm text-slate-500">{orderData.customer?.phone}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Shipping Address
            </h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">{orderData.recipientName || 'N/A'}</p>
              <p>{orderData.shippingAddress || 'No address provided'}</p>
              <p>{orderData.shippingCity ?? ''}, {orderData.shippingCountry ?? ''}</p>
              <p className="mt-2 text-slate-500">Phone: {orderData.recipientPhone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Info
            </h2>
            <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-500">Method</span>
                 <span className="font-medium translate-y-[1px]">{orderData.paymentMethod || 'Unknown'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500">Status</span>
                 <span className={`font-medium px-2 py-0.5 rounded text-xs ${orderData.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                   {orderData.paymentStatus ?? '—'}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
