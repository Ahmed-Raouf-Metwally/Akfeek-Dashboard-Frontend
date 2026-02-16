import { api } from './api';

export const notificationService = {
  getNotifications(params = {}) {
    return api.get('/notifications', { params }).then((r) => r.data);
  },
  getAdminNotifications(params = {}) {
    return api.get('/notifications/admin/all', { params }).then((r) => r.data);
  },
  markAsRead(id) {
    return api.patch(`/notifications/${id}/read`).then((r) => r.data);
  },
  markAllAsRead() {
    return api.patch('/notifications/read-all').then((r) => r.data);
  },
};
