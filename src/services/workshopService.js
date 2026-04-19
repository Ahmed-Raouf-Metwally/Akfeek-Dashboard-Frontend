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
    /** Vendor: مستندات تأمين رحلة أكفيك المرتبطة بحجز الورشة */
    async getAkfeekJourneyDocuments(bookingId) {
        const { data } = await api.get(
            `/workshops/profile/me/bookings/${bookingId}/akfeek-journey/documents`
        );
        if (!data.success) throw new Error(data.error || 'Failed to load Akfeek documents');
        return data.data;
    },
    /** Vendor: تنزيل ملف مستند (blob) */
    async downloadAkfeekJourneyDocumentFile(bookingId, documentId) {
        const { data } = await api.get(
            `/workshops/profile/me/bookings/${bookingId}/akfeek-journey/documents/${documentId}/file`,
            { responseType: 'blob' }
        );
        return data;
    },
    /** Vendor: confirm a pending booking (PENDING → CONFIRMED) */
    async confirmBooking(bookingId) {
        const { data } = await api.patch(`/bookings/${bookingId}/confirm`);
        if (!data.success) throw new Error(data.error || 'Failed to confirm booking');
        return data.data;
    },
    /** Vendor: start booking (CONFIRMED → IN_PROGRESS) */
    async startBooking(bookingId) {
        const { data } = await api.patch(`/bookings/${bookingId}/start`);
        if (!data.success) throw new Error(data.error || 'Failed to start booking');
        return data.data;
    },
    /** Vendor: mark booking as completed */
    async completeBooking(bookingId) {
        const { data } = await api.patch(`/bookings/${bookingId}/complete`);
        if (!data.success) throw new Error(data.error || 'Failed to complete booking');
        return data.data;
    },

    // ── Vendor: إدارة الخدمات (مع الأسعار) ─────────────────────────────────────
    async getMyWorkshopServices() {
        const { data } = await api.get('/workshops/profile/me/services');
        if (!data.success) throw new Error(data.error || 'Failed to load services');
        return data.data ?? [];
    },
    async addMyWorkshopService(payload) {
        const { data } = await api.post('/workshops/profile/me/services', payload);
        if (!data.success) throw new Error(data.error || 'Failed to add service');
        return data.data;
    },
    async updateMyWorkshopService(svcId, payload) {
        const { data } = await api.put(`/workshops/profile/me/services/${svcId}`, payload);
        if (!data.success) throw new Error(data.error || 'Failed to update service');
        return data.data;
    },
    async deleteMyWorkshopService(svcId) {
        const { data } = await api.delete(`/workshops/profile/me/services/${svcId}`);
        if (!data.success) throw new Error(data.error || 'Failed to delete service');
        return data;
    },

    // ── Workshop Services (Pricing) — Admin ─────────────────────────────────────
    async getWorkshopServices(workshopId) {
        const { data } = await api.get(`/workshops/${workshopId}/services`);
        if (!data.success) throw new Error(data.error || 'Failed to load services');
        return data.data ?? [];
    },

    async addWorkshopService(workshopId, payload) {
        const { data } = await api.post(`/workshops/${workshopId}/services`, payload);
        if (!data.success) throw new Error(data.error || 'Failed to add service');
        return data.data;
    },

    async updateWorkshopService(workshopId, svcId, payload) {
        const { data } = await api.put(`/workshops/${workshopId}/services/${svcId}`, payload);
        if (!data.success) throw new Error(data.error || 'Failed to update service');
        return data.data;
    },

    async deleteWorkshopService(workshopId, svcId) {
        const { data } = await api.delete(`/workshops/${workshopId}/services/${svcId}`);
        if (!data.success) throw new Error(data.error || 'Failed to delete service');
        return data;
    },

    // ── Workshop Images (Admin) ──────────────────────────────────────────────────
    async uploadLogo(workshopId, file) {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await api.post(`/workshops/${workshopId}/logo`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!data.success) throw new Error(data.error || 'Failed to upload logo');
        return data.data;
    },

    async deleteLogo(workshopId) {
        const { data } = await api.delete(`/workshops/${workshopId}/logo`);
        if (!data.success) throw new Error(data.error || 'Failed to delete logo');
    },

    async uploadImages(workshopId, files) {
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append('files', f));
        const { data } = await api.post(`/workshops/${workshopId}/images`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!data.success) throw new Error(data.error || 'Failed to upload images');
        return data.data;
    },

    async deleteImage(workshopId, imageIndex) {
        const { data } = await api.delete(`/workshops/${workshopId}/images/${imageIndex}`);
        if (!data.success) throw new Error(data.error || 'Failed to delete image');
        return data.data;
    },
};

export default workshopService;
