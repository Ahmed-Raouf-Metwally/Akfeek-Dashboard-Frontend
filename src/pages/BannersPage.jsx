import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UPLOADS_BASE_URL } from '../config/env';
import {
  fetchAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImages,
  deleteBannerImage,
} from '../services/banners';

function BannerCard({ banner, onUpdate, onDelete, onUploadImages, onDeleteImage }) {
  const { t } = useTranslation();
  const [linkUrl, setLinkUrl] = useState('');
  const images = banner.images || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {banner.position}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">#{banner.id.slice(0, 8)}</span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('banners.titleLabel', 'Title')}</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={banner.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder={t('banners.optional', 'Optional')}
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('banners.titleArLabel', 'Title (AR)')}</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={banner.titleAr || ''}
                onChange={(e) => onUpdate({ titleAr: e.target.value })}
                placeholder={t('banners.optional', 'Optional')}
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('banners.sortOrder', 'Sort order')}</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                type="number"
                value={banner.sortOrder ?? 0}
                onChange={(e) => onUpdate({ sortOrder: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('banners.active', 'Active')}</span>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                value={banner.isActive ? 'true' : 'false'}
                onChange={(e) => onUpdate({ isActive: e.target.value === 'true' })}
              >
                <option value="true">{t('banners.active', 'Active')}</option>
                <option value="false">{t('banners.hidden', 'Hidden')}</option>
              </select>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30"
        >
          <Trash2 className="size-4" />
          {t('banners.delete', 'Delete')}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-slate-500 dark:text-slate-400" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('banners.images', { count: images.length })}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-900/40 sm:w-80"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={t('banners.optionalLinkUrl', 'Optional linkUrl (applies to uploaded images)')}
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Upload className="size-4" />
              {t('banners.upload', 'Upload')}
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
                  if (selectedFiles.length) onUploadImages(selectedFiles, linkUrl);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {images.length === 0 ? (
          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
            <div className="rounded-full bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <Upload className="size-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('banners.clickToUpload', 'Click to upload banner images')}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('banners.selectImagesHint', 'Select one or more images (JPG, PNG, WebP)')}
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => {
                const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
                if (selectedFiles.length) onUploadImages(selectedFiles, linkUrl);
                e.target.value = '';
              }}
            />
          </label>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={`${UPLOADS_BASE_URL}${img.imageUrl}`}
                  alt="banner"
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => onDeleteImage(img.id)}
                  className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                >
                  {t('banners.delete', 'Delete')}
                </button>
                {img.linkUrl ? (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1 text-[11px] text-white">
                    {img.linkUrl}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BannersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [newPosition, setNewPosition] = useState('TOP');

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => fetchAdminBanners(),
  });

  const grouped = useMemo(() => {
    const top = [];
    const bottom = [];
    const autoParts = [];
    const carWash = [];
    banners.forEach((b) => {
      if (b.position === 'BOTTOM') bottom.push(b);
      else if (b.position === 'AUTO_PARTS') autoParts.push(b);
      else if (b.position === 'CAR_WASH') carWash.push(b);
      else top.push(b);
    });
    return { top, bottom, autoParts, carWash };
  }, [banners]);

  const createMut = useMutation({
    mutationFn: (payload) => createBanner(payload),
    onSuccess: () => {
      toast.success(t('banners.createSuccess', 'Banner created'));
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => toast.error(e?.normalized?.message || t('banners.createFailed', 'Create failed')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateBanner(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
    onError: (e) => toast.error(e?.normalized?.message || t('banners.updateFailed', 'Update failed')),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteBanner(id),
    onSuccess: () => {
      toast.success(t('banners.deleted', 'Deleted'));
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => toast.error(e?.normalized?.message || t('banners.deleteFailed', 'Delete failed')),
  });

  const uploadMut = useMutation({
    mutationFn: ({ bannerId, files, linkUrl }) => uploadBannerImages(bannerId, files, linkUrl),
    onMutate: () => {
      const tid = toast.loading(t('banners.uploadingImages', 'Uploading images...'));
      return { tid };
    },
    onSuccess: (data, variables, context) => {
      toast.success(t('banners.uploadedSuccessfully', 'Uploaded successfully'), { id: context.tid });
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e, variables, context) => {
      console.error('[Upload Error Detail]:', e?.response?.data || e);
      const msg = e?.response?.data?.error || e?.normalized?.message || t('banners.uploadFailed', 'Upload failed');
      toast.error(msg, { id: context.tid });
    },
  });

  const deleteImageMut = useMutation({
    mutationFn: ({ bannerId, imageId }) => deleteBannerImage(bannerId, imageId),
    onSuccess: () => {
      toast.success('Image deleted');
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => toast.error(e?.normalized?.message || 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('banners.title', 'Banners')}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t('banners.subtitle', 'Manage top and bottom banners. Each banner can have multiple images.')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="TOP">{t('banners.top', 'الأعلى')}</option>
              <option value="BOTTOM">{t('banners.bottom', 'الأسفل')}</option>
              <option value="AUTO_PARTS">{t('banners.autoParts', 'قطع الغيار')}</option>
              <option value="CAR_WASH">{t('banners.carWash', 'غسيل السيارات')}</option>
            </select>
            <button
              type="button"
              onClick={() => createMut.mutate({ position: newPosition, isActive: true, sortOrder: 0 })}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={createMut.isPending}
            >
              <Plus className="size-4" />
              {t('banners.addBanner', 'Add banner')}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('banners.top', 'TOP')}</div>
            <div className="grid grid-cols-1 gap-4">
              {grouped.top.map((b) => (
                <BannerCard
                  key={b.id}
                  banner={b}
                  onUpdate={(payload) => updateMut.mutate({ id: b.id, payload })}
                  onDelete={() => deleteMut.mutate(b.id)}
                  onUploadImages={(files, linkUrl) => uploadMut.mutate({ bannerId: b.id, files, linkUrl })}
                  onDeleteImage={(imageId) => deleteImageMut.mutate({ bannerId: b.id, imageId })}
                />
              ))}
              {grouped.top.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {t('banners.noTopBanners', 'No TOP banners.')}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('banners.bottom', 'الأسفل')}</div>
            <div className="grid grid-cols-1 gap-4">
              {grouped.bottom.map((b) => (
                <BannerCard
                  key={b.id}
                  banner={b}
                  onUpdate={(payload) => updateMut.mutate({ id: b.id, payload })}
                  onDelete={() => deleteMut.mutate(b.id)}
                  onUploadImages={(files, linkUrl) => uploadMut.mutate({ bannerId: b.id, files, linkUrl })}
                  onDeleteImage={(imageId) => deleteImageMut.mutate({ bannerId: b.id, imageId })}
                />
              ))}
              {grouped.bottom.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {t('banners.noBottomBanners', 'No BOTTOM banners.')}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('banners.autoParts', 'قطع الغيار')}</div>
            <div className="grid grid-cols-1 gap-4">
              {grouped.autoParts.map((b) => (
                <BannerCard
                  key={b.id}
                  banner={b}
                  onUpdate={(payload) => updateMut.mutate({ id: b.id, payload })}
                  onDelete={() => deleteMut.mutate(b.id)}
                  onUploadImages={(files, linkUrl) => uploadMut.mutate({ bannerId: b.id, files, linkUrl })}
                  onDeleteImage={(imageId) => deleteImageMut.mutate({ bannerId: b.id, imageId })}
                />
              ))}
              {grouped.autoParts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {t('banners.noAutoParts', 'No AUTO_PARTS banners.')}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('banners.carWash', 'غسيل السيارات')}</div>
            <div className="grid grid-cols-1 gap-4">
              {grouped.carWash.map((b) => (
                <BannerCard
                  key={b.id}
                  banner={b}
                  onUpdate={(payload) => updateMut.mutate({ id: b.id, payload })}
                  onDelete={() => deleteMut.mutate(b.id)}
                  onUploadImages={(files, linkUrl) => uploadMut.mutate({ bannerId: b.id, files, linkUrl })}
                  onDeleteImage={(imageId) => deleteImageMut.mutate({ bannerId: b.id, imageId })}
                />
              ))}
              {grouped.carWash.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {t('banners.noCarWash', 'No CAR_WASH banners.')}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

