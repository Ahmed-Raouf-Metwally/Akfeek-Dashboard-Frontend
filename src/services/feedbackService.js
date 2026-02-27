import api from './api';

/**
 * Feedback Service
 * Handles admin-side operations for complaints and suggestions
 */
const feedbackService = {
    /**
     * Get feedback statistics (urgent, pending)
     */
    getStats: async () => {
        try {
            const response = await api.get('/admin/feedback/stats');
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * List all feedback entries with filters
     * @param {Object} params - Filter parameters (status, priority, type, userId, orderId, page, limit)
     */
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/admin/feedback', { params });
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * Get feedback details by ID
     * @param {string} id - Feedback ID
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/admin/feedback/${id}`);
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * Update feedback status
     * @param {string} id - Feedback ID
     * @param {Object} data - { status, notes }
     */
    updateStatus: async (id, data) => {
        try {
            const response = await api.patch(`/admin/feedback/${id}/status`, data);
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * Update feedback priority
     * @param {string} id - Feedback ID
     * @param {string} priority - New priority
     */
    updatePriority: async (id, priority) => {
        try {
            const response = await api.patch(`/admin/feedback/${id}/priority`, { priority });
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * Reply to feedback
     * @param {string} id - Feedback ID
     * @param {string} message - Reply message
     */
    reply: async (id, message) => {
        try {
            const response = await api.post(`/admin/feedback/${id}/reply`, { message });
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    },

    /**
     * Bulk delete or soft delete feedback
     * @param {string} id - Feedback ID
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/admin/feedback/${id}`);
            return response.data;
        } catch (error) {
            throw error.normalized || error;
        }
    }
};

export default feedbackService;
