import api from './api';

export const vendorService = {
  /**
   * Get all vendors with filters (status, search, etc.)
   */
  async getVendors(params = {}) {
    const { data } = await api.get('/vendors', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendors');
    }
    // Return both data array and pagination metadata
    return {
      vendors: data.data ?? [],
      pagination: data.pagination ?? null,
    };
  },

  /**
   * Get vendor by ID (includes parts preview)
   */
  async getVendorById(id) {
    const { data } = await api.get(`/vendors/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendor details');
    }
    return data.data;
  },

  /**
   * Get current user's vendor profile
   */
  async getMyVendorProfile() {
    const { data } = await api.get('/vendors/profile/me');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load your vendor profile');
    }
    return data.data;
  },

  /**
   * كوبونات الفيندور — تظهر للعميل عند الحجز وتطبق على خدمات هذا الفيندور فقط
   */
  async getMyCoupons(params = {}) {
    const { data } = await api.get('/vendors/profile/me/coupons', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load coupons');
    return data.data ?? [];
  },

  /**
   * Get all coupons (Admin)
   */
  async getAllCoupons(params = {}) {
    const { data } = await api.get('/vendors/coupons', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load all coupons');
    return data.data ?? [];
  },

  async createCoupon(payload) {
    const { data } = await api.post('/vendors/profile/me/coupons', payload);
    if (!data.success) throw new Error(data.error || 'Failed to create coupon');
    return data.data;
  },

  async updateCoupon(id, payload) {
    const { data } = await api.patch(`/vendors/profile/me/coupons/${id}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update coupon');
    return data.data;
  },

  async deleteCoupon(id) {
    const { data } = await api.delete(`/vendors/profile/me/coupons/${id}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete coupon');
    return data;
  },

  /**
   * Get comprehensive care bookings for current vendor (مواعيد الحجوزات)
   */
  async getMyComprehensiveCareBookings(params = {}) {
    const { data } = await api.get('/vendors/profile/me/comprehensive-care-bookings', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load bookings');
    return { list: data.data ?? [], pagination: data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 } };
  },

  /**
   * Create new vendor profile
   */
  async createVendor(payload) {
    const { data } = await api.post('/vendors', payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to create vendor profile');
    }
    return data.data;
  },

  /**
   * Update vendor profile
   */
  async updateVendor(id, payload) {
    const { data } = await api.put(`/vendors/${id}`, payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update vendor');
    }
    return data.data;
  },

  /**
   * Update vendor status (Admin only)
   */
  async updateVendorStatus(id, status) {
    const { data } = await api.put(`/vendors/${id}/status`, { status });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update vendor status');
    }
    return data.data;
  },

  /**
   * Get vendor statistics
   */
  async getVendorStats(id) {
    const { data } = await api.get(`/vendors/${id}/stats`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load vendor statistics');
    }
    return data.data;
  },

  /**
   * Get vendor reviews (تقييمات الفيندور)
   */
  async getVendorReviews(id, params = {}) {
    const { data } = await api.get(`/vendors/${id}/reviews`, { params });
    if (!data.success) throw new Error(data.error || 'Failed to load reviews');
    return {
      reviews: data.data ?? [],
      pagination: data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
      averageRating: data.averageRating ?? 0,
      totalReviews: data.totalReviews ?? 0,
    };
  },

  /**
   * Submit or update my rating for a vendor (1-5 stars)
   */
  async submitVendorReview(id, payload) {
    const { data } = await api.post(`/vendors/${id}/reviews`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to submit rating');
    return data;
  },

  /**
   * Vendor Onboarding: Register a new vendor (Public/System)
   */
  async registerVendor(payload) {
    const { data } = await api.post('/vendor-onboarding/register', payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to submit vendor registration');
    }
    return data.data;
  },

  /**
   * Vendor Onboarding: List registration requests (Admin)
   */
  async getOnboardingRequests(status) {
    const params = status && status !== 'ALL' ? { status } : {};
    const { data } = await api.get('/vendor-onboarding/admin/list', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load onboarding requests');
    }
    return data.data;
  },

  /**
   * Vendor Onboarding: Update request status (Admin)
   */
  async updateOnboardingStatus(id, status) {
    const { data } = await api.patch(`/vendor-onboarding/admin/${id}/status`, { status });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update request status');
    }
    return data.data;
  },

  /**
   * Delete vendor
   */
  async deleteVendor(id) {
    const { data } = await api.delete(`/vendors/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete vendor');
    }
    return data;
  },

  // ── Documents ─────────────────────────────────────────────────────────────
  async getDocuments(vendorId) {
    const { data } = await api.get(`/vendors/${vendorId}/documents`);
    return data.data ?? [];
  },

  async uploadDocument(vendorId, file, docType, name) {
    const form = new FormData();
    form.append('file', file);
    form.append('docType', docType);
    form.append('name', name || file.name);
    const { data } = await api.post(`/vendors/${vendorId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async deleteDocument(vendorId, docId) {
    const { data } = await api.delete(`/vendors/${vendorId}/documents/${docId}`);
    return data;
  },

  // ── Vendor Services Management ─────────────────────────────────────────────
  async getVendorServices(vendorId) {
    const { data } = await api.get(`/vendors/${vendorId}/services`);
    return data.data ?? [];
  },

  async addVendorService(vendorId, payload) {
    const { data } = await api.post(`/vendors/${vendorId}/services`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to add service');
    return data.data;
  },

  async updateVendorService(vendorId, serviceId, payload) {
    const { data } = await api.put(`/vendors/${vendorId}/services/${serviceId}`, payload);
    if (!data.success) throw new Error(data.error || 'Failed to update service');
    return data.data;
  },

  async deleteVendorService(vendorId, serviceId) {
    const { data } = await api.delete(`/vendors/${vendorId}/services/${serviceId}`);
    if (!data.success) throw new Error(data.error || 'Failed to delete service');
    return data;
  },
};

export default vendorService;
