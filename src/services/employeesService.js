import { api } from './api';

/**
 * خدمة إدارة موظفي أكفيك والصلاحيات (ديناميكية).
 * جميع الاستدعاءات تتطلب دور أدمن.
 */
export const employeesService = {
  /**
   * قائمة الموظفين مع ترقيم الصفحات
   * @param {{ page?: number, limit?: number, search?: string }}
   */
  async list(params = {}) {
    const { data } = await api.get('/admin/employees', { params });
    return data;
  },

  /**
   * إضافة موظف جديد
   * @param {{ email: string, password: string, firstName: string, lastName: string, phone?: string }}
   */
  async create(payload) {
    const { data } = await api.post('/admin/employees', payload);
    return data;
  },

  /**
   * قائمة مفاتيح الصلاحيات المتاحة (للعرض عند تحرير صلاحيات موظف)
   */
  async getPermissionKeys() {
    const { data } = await api.get('/admin/employees/permission-keys');
    return data;
  },

  /**
   * صلاحيات موظف معيّن + مفاتيح الصلاحيات والترجمات
   * @param {string} id - معرف الموظف
   */
  async getEmployeePermissions(id) {
    const { data } = await api.get(`/admin/employees/${id}/permissions`);
    return data;
  },

  /**
   * تحديث صلاحيات موظف
   * @param {string} id - معرف الموظف
   * @param {{ permissions: string[] }}
   */
  async updateEmployeePermissions(id, permissions) {
    const { data } = await api.put(`/admin/employees/${id}/permissions`, { permissions });
    return data;
  },
};

export default employeesService;
