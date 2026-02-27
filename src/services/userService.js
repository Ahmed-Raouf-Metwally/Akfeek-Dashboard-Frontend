import api from './api';

/**
 * User API service (Admin).
 * Backend returns { success, data, pagination? }.
 */
export const userService = {
  /**
   * Get paginated users. Admin only.
   * @param {{ role?: string, status?: string, search?: string, page?: number, limit?: number }}
   */
  async getUsers(params = {}) {
    const { data } = await api.get('/users', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load users');
    }
    return {
      users: data.data ?? [],
      pagination: data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  /**
   * Get user by ID. Admin only.
   */
  async getUserById(id) {
    const { data } = await api.get(`/users/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'User not found');
    }
    return data.data;
  },

  /**
   * Update user status. Admin only.
   * @param {string} id
   * @param {string} status - ACTIVE | PENDING_VERIFICATION | SUSPENDED | BANNED
   */
  async updateStatus(id, status) {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    if (!data.success) {
      throw new Error(data.error || 'Failed to update status');
    }
    return data.data;
  },

  /**
   * Update user details. Admin only.
   * @param {string} id
   * @param {Object} data - { firstName, lastName, bio, bioAr, avatar }
   */
  async updateUser(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update user');
    }
    return data.data;
  },

  /**
   * Delete user. Admin only.
   */
  async deleteUser(id) {
    const { data } = await api.delete(`/users/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }
  },
};

export default userService;
