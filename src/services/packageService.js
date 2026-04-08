import api from './api';

export const packageService = {
  getAllPackages: () => api.get('/packages'),
  
  getPackageById: (id) => api.get(`/packages/${id}`),
  
  getAllServices: () => api.get('/packages/services'),
  
  getEligiblePackages: (serviceIds) => api.get(`/packages/eligible?serviceIds=${serviceIds.join(',')}`),
  
  createPackage: (data) => api.post('/packages', data),
  
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  
  deletePackage: (id) => api.delete(`/packages/${id}`),
  
  purchasePackage: (packageId) => api.post('/user-packages/purchase', { packageId }),
  
  getUserPackages: (includeExpired = false) => api.get(`/user-packages/my-packages?includeExpired=${includeExpired}`),
  
  getUserPackageById: (id) => api.get(`/user-packages/${id}`),
  
  getUserEligiblePackages: (serviceIds) => api.get(`/user-packages/eligible?serviceIds=${serviceIds.join(',')}`),
  
  applyPackageToBooking: (bookingId, userPackageId, serviceId) => 
    api.post('/bookings/apply-package', { bookingId, userPackageId, serviceId }),
};

export default packageService;
