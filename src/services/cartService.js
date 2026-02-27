import api from './api';

/**
 * Cart API – for customer to manage cart and checkout.
 * Use same base URL and auth token as rest of app (e.g. mobile app or customer dashboard).
 */
export const cartService = {
  /** Get my cart with items */
  getCart: async () => {
    const { data } = await api.get('/cart');
    if (!data.success) throw new Error(data.error || 'Failed to load cart');
    return data.data;
  },

  /** Add item to cart. Body: { autoPartId, quantity? } */
  addItem: async (autoPartId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { autoPartId, quantity });
    if (!data.success) throw new Error(data.error || 'Failed to add to cart');
    return data.data;
  },

  /** Update cart item quantity. Body: { quantity } */
  updateItem: async (cartItemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${cartItemId}`, { quantity });
    if (!data.success) throw new Error(data.error || 'Failed to update cart');
    return data.data;
  },

  /** Remove item from cart */
  removeItem: async (cartItemId) => {
    const { data } = await api.delete(`/cart/items/${cartItemId}`);
    if (!data.success) throw new Error(data.error || 'Failed to remove from cart');
    return data.data;
  },

  /**
   * Checkout – create order from cart.
   * Body: { shippingAddress: { address, city, country?, name, phone }, paymentMethod? }
   */
  checkout: async (payload) => {
    const { data } = await api.post('/cart/checkout', payload);
    if (!data.success) throw new Error(data.error || 'Checkout failed');
    return data.data;
  },
};

export default cartService;
