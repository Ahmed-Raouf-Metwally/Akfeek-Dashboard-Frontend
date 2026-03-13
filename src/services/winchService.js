import api from './api';

/**
 * Winch (Towing) API
 * - أدمن: قائمة الوينشات GET /api/winches، تفاصيل، إنشاء، تحديث، حذف
 * - فيندور: /api/winches/my, /api/winches/my/broadcasts, /api/winches/my/jobs
 */
export const winchService = {
  /** [أدمن] قائمة الوينشات مع بحث وتصفية وصفحات */
  async getWinches(params = {}) {
    const { data } = await api.get('/winches', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load winches');
    return {
      winches: data.data ?? [],
      pagination: data.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  },

  /** [أدمن] تفاصيل ونش بالمعرف */
  async getWinch(id) {
    const { data } = await api.get(`/winches/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to load winch');
    return data.data;
  },

  /** [أدمن] إنشاء ونش */
  async createWinch(payload) {
    const { data } = await api.post('/winches', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create winch');
    return data.data;
  },

  /** [أدمن] تحديث ونش */
  async updateWinch(id, payload) {
    const { data } = await api.put(`/winches/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update winch');
    return data.data;
  },

  /** [أدمن] حذف ونش */
  async deleteWinch(id) {
    const { data } = await api.delete(`/winches/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete winch');
    return data.data;
  },

  /** بيانات ونشي المرتبط بحساب الفيندور */
  async getMyWinch() {
    const { data } = await api.get('/winches/my');
    if (!data.success) throw new Error(data.error || 'Failed to load winch');
    return data.data;
  },

  /** طلبات السحب القريبة من موقع الوينش (للمزايدة) */
  async getMyBroadcasts() {
    const { data } = await api.get('/winches/my/broadcasts');
    if (!data.success) throw new Error(data.error || 'Failed to load broadcasts');
    return data.data;
  },

  /** إرسال عرض على طلب سحب */
  async submitOffer(broadcastId, body = {}) {
    const { data } = await api.post(`/winches/my/broadcasts/${broadcastId}/offer`, body);
    if (!data.success) throw new Error(data.error || 'Failed to submit offer');
    return data.data;
  },

  /** المهام المعينة لوينشي (حجوزات قبل العميل عرضي) */
  async getMyJobs() {
    const { data } = await api.get('/winches/my/jobs');
    if (!data.success) throw new Error(data.error || 'Failed to load jobs');
    return data.data;
  },

  /** تحديث حالة المهمة: TECHNICIAN_EN_ROUTE | ARRIVED | IN_PROGRESS | COMPLETED */
  async updateJobStatus(jobId, status) {
    const { data } = await api.patch(`/winches/my/jobs/${jobId}/status`, { status });
    if (!data.success) throw new Error(data.error || 'Failed to update status');
    return data.data;
  },
};

export default winchService;
