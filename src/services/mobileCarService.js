import api from './api';

/**
 * Mobile Car Service (خدمة الورش المتنقلة) – dedicated API for dashboard.
 * Uses backend /api/mobile-car-service and /api/services for sub-services.
 */
export const mobileCarServiceApi = {
  /** Get parent Mobile Car Service with sub-services */
  async getParentWithSubServices() {
    const { data } = await api.get('/mobile-car-service');
    if (!data.success) throw new Error(data.error || 'Failed to load Mobile Car Service');
    return data.data ?? null;
  },

  /** Get sub-services only (optional parentId) */
  async getSubServices(parentId = null) {
    const params = parentId ? { parentId } : {};
    const { data } = await api.get('/mobile-car-service/sub-services', { params });
    if (!data.success) throw new Error(data.error || 'Failed to load sub-services');
    return data.data ?? [];
  },
};

export default mobileCarServiceApi;
