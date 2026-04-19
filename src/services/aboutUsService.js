import api from './api';

const BASE = '/api/admin/about-us';

/** GET about-us page content (admin) */
export async function fetchAboutUs() {
  const { data } = await api.get(BASE);
  return data.data;
}

/** PUT update page text fields */
export async function updateAboutUs(payload) {
  const { data } = await api.put(BASE, payload);
  return data.data;
}

/** POST upload logo — expects File */
export async function uploadAboutLogo(file) {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await api.post(`${BASE}/logo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

/** POST create core value */
export async function createCoreValue(payload) {
  const { data } = await api.post(`${BASE}/core-values`, payload);
  return data.data;
}

/** PUT update core value */
export async function updateCoreValue(id, payload) {
  const { data } = await api.put(`${BASE}/core-values/${id}`, payload);
  return data.data;
}

/** DELETE core value */
export async function deleteCoreValue(id) {
  const { data } = await api.delete(`${BASE}/core-values/${id}`);
  return data.data;
}

/** POST upload icon for core value */
export async function uploadCoreValueIcon(id, file) {
  const form = new FormData();
  form.append('icon', file);
  const { data } = await api.post(`${BASE}/core-values/${id}/icon`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
