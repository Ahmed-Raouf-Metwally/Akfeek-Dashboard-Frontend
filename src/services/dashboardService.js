import api from './api';

export const dashboardService = {
    /**
     * Get dashboard statistics (users, bookings, revenue, recent activity)
     */
    async getStats() {
        const response = await api.get('/dashboard/stats');
        return response.data;
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
