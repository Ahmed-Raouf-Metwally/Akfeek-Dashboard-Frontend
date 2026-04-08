import api from './api';

const inspectionService = {
  getInspections: (params = {}) =>
    api.get('/inspections', { params }).then((r) => r.data),

  getInspectionById: (id) =>
    api.get(`/inspections/${id}`).then((r) => r.data),

  updateInspection: (id, data) =>
    api.put(`/inspections/${id}`, data).then((r) => r.data),
};

export default inspectionService;
