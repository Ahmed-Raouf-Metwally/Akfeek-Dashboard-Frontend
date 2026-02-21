import api from './api';

/**
 * Certified Workshops API Service
 * Customer endpoints + Admin endpoints for workshop management
 */
export const workshopService = {
    /**
     * Get workshops with optional filters (Customer view - only active & verified)
     * @param {{ city?: string, search?: string, isActive?: boolean, isVerified?: boolean }}
     */
    async getWorkshops(params = {}) {
        const { data } = await api.get('/workshops', { params });
        if (!data.success) {
            throw new Error(data.error || 'Failed to load workshops');
        }
        return data.data ?? [];
    },

    /**
     * Get workshop by ID
     * @param {string} id
     */
    async getWorkshopById(id) {
        const { data } = await api.get(`/workshops/${id}`);
        if (!data.success) {
            throw new Error(data.error || 'Workshop not found');
        }
        return data.data;
    },

    /** 
     * ==================== ADMIN ENDPOINTS ====================
     */

    /**
     * Get all workshops (Admin - includes inactive & unverified)
     * @param {{ city?: string, search?: string, isActive?: string, isVerified?: string }}
     */
    async getAllWorkshopsAdmin(params = {}) {
        const { data } = await api.get('/workshops/admin/all', { params });
        if (!data.success) {
            throw new Error(data.error || 'Failed to load workshops');
        }
        return data.data ?? [];
    },

    /**
     * Create new workshop (Admin only)
     * @param {Object} payload - Workshop data
     */
    async createWorkshop(payload) {
        const { data } = await api.post('/workshops/admin/workshops', payload);
        if (!data.success) {
            throw new Error(data.error || 'Failed to create workshop');
        }
        return data.data;
    },

    /**
     * Update workshop (Admin only)
     * @param {string} id
     * @param {Object} payload - Updated workshop data
     */
    async updateWorkshop(id, payload) {
        const { data } = await api.put(`/workshops/admin/workshops/${id}`, payload);
        if (!data.success) {
            throw new Error(data.error || 'Failed to update workshop');
        }
        return data.data;
    },

    /**
     * Toggle workshop verification (Admin only)
     * @param {string} id
     * @param {boolean} isVerified
     */
    async toggleVerification(id, isVerified) {
        const { data } = await api.patch(`/workshops/admin/workshops/${id}/verify`, { isVerified });
        if (!data.success) {
            throw new Error(data.error || 'Failed to update verification status');
        }
        return data.data;
    },

    /**
     * Delete workshop (Admin only)
     * @param {string} id
     */
    async deleteWorkshop(id) {
        const { data } = await api.delete(`/workshops/admin/workshops/${id}`);
        if (!data.success) {
            throw new Error(data.error || 'Failed to delete workshop');
        }
    },

    /** Vendor (CERTIFIED_WORKSHOP): my workshop & bookings */
    async getMyWorkshop() {
        const { data } = await api.get('/workshops/profile/me');
        if (!data.success) throw new Error(data.error || 'Failed to load workshop');
        return data.data;
    },
    /**
     * Create my workshop (Vendor – certified workshop only). Workshop is created unverified until admin approves.
     */
    async createMyWorkshop(payload) {
        const { data } = await api.post('/workshops/profile/me', payload);
        if (!data.success) throw new Error(data.error || 'Failed to create workshop');
        return data.data;
    },
    async updateMyWorkshop(payload) {
        const { data } = await api.put('/workshops/profile/me', payload);
        if (!data.success) throw new Error(data.error || 'Failed to update workshop');
        return data.data;
    },
    async getMyWorkshopBookings(params = {}) {
        const { data } = await api.get('/workshops/profile/me/bookings', { params });
        if (!data.success) throw new Error(data.error || 'Failed to load bookings');
        return { list: data.data ?? [], pagination: data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 } };
    },
};

export default workshopService;
