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

  /** alias — used by WinchDetailPage & CreateEditWinchPage */
  async getWinchById(id) {
    return this.getWinch(id);
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

  /** فيندور: إنشاء ونش جديد */
  async createMyWinch(payload) {
    const { data } = await api.post('/winches/my', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create winch');
    return data.data;
  },

  /** فيندور: تحديث بيانات ونشه */
  async updateMyWinch(payload) {
    const { data } = await api.put('/winches/my', payload);
    if (!data.success) throw new Error(data.error || 'Failed to update winch');
    return data.data;
  },

  /** فيندور: حذف ونشه */
  async deleteMyWinch() {
    const { data } = await api.delete('/winches/my');
    if (!data.success) throw new Error(data.error || 'Failed to delete winch');
    return data;
  },

  /** فيندور: رفع صورة ونشه */
  async uploadMyWinchImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post('/winches/my/upload-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return data.imageUrl;
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

  /** [أدمن] رفع صورة ونش بمعرفه */
  async uploadImage(id, file) {
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post(`/winches/${id}/upload-image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return data.imageUrl;
  },
};

export default winchService;
