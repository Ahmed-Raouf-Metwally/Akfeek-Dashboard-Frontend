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
    return data.data;
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
  }
};

export default vendorService;
