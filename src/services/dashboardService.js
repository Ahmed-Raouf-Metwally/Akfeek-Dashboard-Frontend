import api from './api';

export const dashboardService = {
  /**
   * Get dashboard statistics (users, bookings, revenue, chart data, recent activity)
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get analytics for admin: time series (bookings/revenue per day) and category breakdown
   * @param {string} range - '7d' | '30d' | '90d'
   */
  async getAnalytics(range = '7d') {
    const response = await api.get('/dashboard/analytics', { params: { range } });
    return response.data;
  },

  /**
   * كل الخدمات الفرعية: الورش المعتمدة، ورش الغسيل، العناية الشاملة، الوينشات، الورش المتنقلة (عرض فقط)
   */
  async getAllSubServices() {
    const response = await api.get('/dashboard/all-sub-services');
    if (!response.data?.success) throw new Error(response.data?.error || 'Failed to load services');
    return response.data.data;
  },

  /**
   * Get activity logs with pagination and filtering
   */
  async getActivityLogs({ page = 1, limit = 10, action, userId } = {}) {
    const params = new URLSearchParams({
      page,
      limit,
    });
    if (action) params.append('action', action);
    if (userId) params.append('userId', userId);

    const response = await api.get(`/activity?${params.toString()}`);
    return response;
  },
};
