import api from './api';

export const marketplaceOrderService = {
  // Create a new order (Customer)
  createOrder: async (data) => {
    const response = await api.post('/marketplace-orders', data);
    return response.data;
  },

  // Get my orders (Customer)
  getMyOrders: async (params) => {
    const response = await api.get('/marketplace-orders/my-orders', { params });
    return response.data;
  },

  // Get vendor orders (Vendor)
  getVendorOrders: async (params) => {
    const response = await api.get('/marketplace-orders/vendor-orders', { params });
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async (params) => {
    const response = await api.get('/marketplace-orders', { params });
    return response.data;
  },

  // Get order details (returns the order object; API wraps in { success, data })
  getOrderById: async (id) => {
    const response = await api.get(`/marketplace-orders/${id}`);
    return response.data?.data ?? response.data;
  },

  // Update global order status (Admin)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/marketplace-orders/${id}/status`, { status });
    return response.data;
  },

  // Update item status (Vendor)
  updateOrderItemStatus: async (orderId, itemId, status) => {
    const response = await api.put(`/marketplace-orders/${orderId}/items/${itemId}/status`, { status });
    return response.data;
  }
};
