import api from './api';

export async function fetchAdminBanners(position) {
  const res = await api.get('/admin/banners', { params: position ? { position } : undefined });
  return res.data?.data || [];
}

export async function createBanner(payload) {
  const res = await api.post('/admin/banners', payload);
  return res.data?.data;
}

export async function updateBanner(id, payload) {
  const res = await api.put(`/admin/banners/${id}`, payload);
  return res.data?.data;
}

export async function deleteBanner(id) {
  const res = await api.delete(`/admin/banners/${id}`);
  return res.data;
}

export async function uploadBannerImages(bannerId, files, linkUrl) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('images', f));
  if (linkUrl) form.append('linkUrl', linkUrl);
  const res = await api.post(`/admin/banners/${bannerId}/images`, form);
  return res.data?.data;
}

export async function deleteBannerImage(bannerId, imageId) {
  const res = await api.delete(`/admin/banners/${bannerId}/images/${imageId}`);
  return res.data?.data;
}

