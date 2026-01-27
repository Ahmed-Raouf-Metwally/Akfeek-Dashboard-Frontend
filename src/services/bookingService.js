import api from './api';

/**
 * Bookings API. Backend may still be "Coming soon".
 */
export const bookingService = {
  async getBookings(params = {}) {
    const { data } = await api.get('/bookings', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load bookings');
    return { list: Array.isArray(data.data) ? data.data : [], message: data.message };
  },
};

export default bookingService;
