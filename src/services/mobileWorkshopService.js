import api from './api';
import { invoiceService } from './invoiceService';

const mobileWorkshopService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/mobile-workshops', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return { items: data.data ?? [], pagination: data.pagination ?? null };
  },

  /** Vendor (MOBILE_WORKSHOP): ورشتي المتنقلة */
  getMyWorkshop: async () => {
    const { data } = await api.get('/mobile-workshops/my');
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data;
  },

  /** Vendor: طلبات ورشتي (للرد بعروض) */
  getMyRequests: async (params = {}) => {
    const res = await api.get('/mobile-workshops/my/requests', { params });
    const data = res.data;
    if (!data.success) throw new Error(data.error || 'Failed to load requests');
    return {
      data: data.data ?? [],
      myWorkshopId: data.myWorkshopId ?? null,
      pagination: data.pagination ?? { page: 1, total: 0, totalPages: 0 },
    };
  },

  /** Vendor: إرسال عرض لطلب (موافق + سعر وتفاصيل) */
  submitOffer: async (workshopId, requestId, payload) => {
    const { data } = await api.post(`/mobile-workshops/${workshopId}/requests/${requestId}/offer`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to submit offer');
    return data.data ?? data;
  },

  /** Vendor: رفض الطلب (لا يظهر في قائمة طلباتي بعد ذلك) */
  rejectRequest: async (workshopId, requestId) => {
    const { data } = await api.post(`/mobile-workshops/${workshopId}/requests/${requestId}/reject`);
    if (!data.success) throw new Error(data.error || 'Failed to reject');
    return data;
  },

  /** Vendor: jobs where customer selected offer (built from vendor invoices) */
  getMyJobs: async () => {
    const { list } = await invoiceService.getMyInvoicesAsVendor({ limit: 100 });
    const jobs = (list || [])
      .map((inv) => ({
        id: inv.booking?.id,
        bookingNumber: inv.booking?.bookingNumber,
        status: inv.booking?.status,
        customer: inv.customer,
        agreedPrice: inv.effectiveTotal ?? inv.totalAmount,
        currency: 'SAR',
        pickupAddress: inv.booking?.pickupAddress ?? null,
        pickupLat: inv.booking?.pickupLat ?? null,
        pickupLng: inv.booking?.pickupLng ?? null,
        destinationAddress: inv.booking?.destinationAddress ?? null,
        scheduledDate: inv.booking?.scheduledDate ?? null,
        scheduledTime: inv.booking?.scheduledTime ?? null,
        notes: inv.booking?.notes ?? null,
      }))
      .filter((j) => j.id && ['TECHNICIAN_ASSIGNED', 'TECHNICIAN_EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(j.status));
    return { jobs };
  },

  /** Vendor: update mobile workshop booking status */
  updateBookingStatus: async (bookingId, status, reason) => {
    const { data } = await api.patch(`/bookings/${bookingId}/mobile-workshop-status`, { status, reason });
    if (!data.success) throw new Error(data.error || 'Failed to update booking status');
    return data.data;
  },

  // ─── عميل: طلبات الورش المتنقلة (يرى كل الفيندورز اللي وافقوا + السعر والتفاصيل) ───
  /** Customer: قائمة طلباتي */
  getMyRequestsAsCustomer: async (params = {}) => {
    const { data } = await api.get('/mobile-workshop-requests', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return { data: data.data ?? [], pagination: data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },
  /** Customer: تفاصيل الطلب مع كل العروض (الفيندورز اللي وافقوا + سعر وتفاصيل كل واحد) */
  getRequestByIdAsCustomer: async (requestId) => {
    const { data } = await api.get(`/mobile-workshop-requests/${requestId}`);
    if (!data.success) throw new Error(data.error || 'Request not found');
    return data.data;
  },
  /** Customer: اختيار عرض (فيندور معين) → ينشئ الحجز والفاتورة */
  selectOfferAsCustomer: async (requestId, offerId, body = {}) => {
    const { data } = await api.post(`/mobile-workshop-requests/${requestId}/select-offer`, { offerId, ...body });
    if (!data.success) throw new Error(data.error || 'Failed to select offer');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/mobile-workshops/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to load');
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/mobile-workshops', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create');
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/mobile-workshops/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update');
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/mobile-workshops/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete');
    return data;
  },

  /** Vendor: إنشاء ورشتي */
  createMyWorkshop: async (payload) => {
    const { data } = await api.post('/mobile-workshops/my', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create workshop');
    return data.data;
  },

  /** Vendor: تحديث ورشتي */
  updateMyWorkshop: async (payload) => {
    const { data } = await api.put('/mobile-workshops/my', payload);
    if (!data.success) throw new Error(data.error || 'Failed to update workshop');
    return data.data;
  },

  /** Vendor: حذف ورشتي */
  deleteMyWorkshop: async () => {
    const { data } = await api.delete('/mobile-workshops/my');
    if (!data.success) throw new Error(data.error || 'Failed to delete workshop');
    return data;
  },

  /** Vendor: رفع صورة ورشتي */
  uploadMyWorkshopImage: async (file, type = 'logo') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    const { data } = await api.post('/mobile-workshops/my/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return { imageUrl: data.imageUrl, field: data.field };
  },

  addService: async (workshopId, payload) => {
    const { data } = await api.post(`/mobile-workshops/${workshopId}/services`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to add service');
    return data.data;
  },

  updateService: async (workshopId, svcId, payload) => {
    const { data } = await api.put(`/mobile-workshops/${workshopId}/services/${svcId}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update service');
    return data.data;
  },

  deleteService: async (workshopId, svcId) => {
    const { data } = await api.delete(`/mobile-workshops/${workshopId}/services/${svcId}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete service');
    return data;
  },

  /**
   * رفع صورة: صورة الفني/الشعار (type=logo) أو صورة المركبة (type=vehicle)
   * @param {string} id - Mobile workshop ID
   * @param {File} file - image file
   * @param {'logo'|'vehicle'} type
   */
  uploadImage: async (id, file, type = 'logo') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    const { data } = await api.post(`/mobile-workshops/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to upload image');
    return { imageUrl: data.imageUrl, field: data.field };
  },
};

export default mobileWorkshopService;
