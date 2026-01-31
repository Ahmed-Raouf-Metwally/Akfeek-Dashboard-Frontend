import api from './api';

export const autoPartCategoryService = {
  /**
   * Get all categories.
   */
  async getCategories(params = {}) {
    const { data } = await api.get('/auto-part-categories', { params });
    if (!data.success) {
      throw new Error(data.error || 'Failed to load categories');
    }
    return data.data;
  },

  /**
   * Get hierarchical category tree.
   */
  async getCategoryTree() {
    const { data } = await api.get('/auto-part-categories/tree');
    if (!data.success) {
      throw new Error(data.error || 'Failed to load category tree');
    }
    return data.data;
  },

  /**
   * Get category by ID.
   */
  async getCategoryById(id) {
    const { data } = await api.get(`/auto-part-categories/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to load category');
    }
    return data.data;
  },

  /**
   * Create category (Admin).
   */
  async createCategory(payload) {
    const { data } = await api.post('/auto-part-categories', payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to create category');
    }
    return data.data;
  },

  /**
   * Update category (Admin).
   */
  async updateCategory(id, payload) {
    const { data } = await api.put(`/auto-part-categories/${id}`, payload);
    if (!data.success) {
      throw new Error(data.error || 'Failed to update category');
    }
    return data.data;
  },

  /**
   * Delete category (Admin).
   */
  async deleteCategory(id) {
    const { data } = await api.delete(`/auto-part-categories/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete category');
    }
    return data;
  }
};

export default autoPartCategoryService;
