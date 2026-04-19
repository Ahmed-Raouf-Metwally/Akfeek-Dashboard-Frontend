import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Upload,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Shield,
  Star,
  ImagePlus,
} from 'lucide-react';
import {
  fetchAboutUs,
  updateAboutUs,
  uploadAboutLogo,
  createCoreValue,
  updateCoreValue,
  deleteCoreValue,
  uploadCoreValueIcon,
} from '../services/aboutUsService';
import { UPLOADS_BASE_URL } from '../config/env';

const ICON_OPTIONS = [
  { key: 'check_badge', label: 'Check Badge', Icon: CheckCircle2, color: 'text-green-500' },
  { key: 'sparkles',    label: 'Sparkles',    Icon: Sparkles,     color: 'text-yellow-400' },
  { key: 'shield',      label: 'Shield',      Icon: Shield,       color: 'text-blue-500' },
  { key: 'star',        label: 'Star',        Icon: Star,         color: 'text-purple-500' },
];

const apiImg = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${UPLOADS_BASE_URL}${url}`;
};

function IconPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ICON_OPTIONS.map(({ key, label, Icon, color }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            value === key
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          <Icon className={`size-4 ${color}`} />
          {label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-800';
const textareaCls = inputCls + ' resize-none';

export default function AppAboutPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ['about-us-admin'],
    queryFn: fetchAboutUs,
  });

  /* ── page form ────────────────────────────────────────── */
  const [form, setForm] = useState({
    brandNameAr: '',
    brandNameEn: '',
    introHeadingAr: '',
    introHeadingEn: '',
    introBodyAr: '',
    introBodyEn: '',
    valuesSectionTitleAr: '',
    valuesSectionTitleEn: '',
  });

  useEffect(() => {
    if (page) {
      setForm({
        brandNameAr: page.brandNameAr || '',
        brandNameEn: page.brandNameEn || '',
        introHeadingAr: page.introHeadingAr || '',
        introHeadingEn: page.introHeadingEn || '',
        introBodyAr: page.introBodyAr || '',
        introBodyEn: page.introBodyEn || '',
        valuesSectionTitleAr: page.valuesSectionTitleAr || '',
        valuesSectionTitleEn: page.valuesSectionTitleEn || '',
      });
    }
  }, [page]);

  const savePageMutation = useMutation({
    mutationFn: () => updateAboutUs(form),
    onSuccess: () => {
      toast.success('تم الحفظ بنجاح');
      qc.invalidateQueries({ queryKey: ['about-us-admin'] });
    },
    onError: () => toast.error('حدث خطأ أثناء الحفظ'),
  });

  /* ── logo upload ────────────────────────────────────────── */
  const logoInputRef = useRef(null);
  const uploadLogoMutation = useMutation({
    mutationFn: (file) => uploadAboutLogo(file),
    onSuccess: () => {
      toast.success('تم رفع الشعار');
      qc.invalidateQueries({ queryKey: ['about-us-admin'] });
    },
    onError: () => toast.error('فشل رفع الشعار'),
  });

  /* ── core value form state ────────────────────────────── */
  const emptyValue = {
    titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
    iconKey: 'sparkles', isActive: true,
  };
  const [valueForm, setValueForm] = useState(emptyValue);
  const [editingId, setEditingId] = useState(null);
  const [showValueForm, setShowValueForm] = useState(false);
  const iconInputRef = useRef(null);
  const [iconUploadId, setIconUploadId] = useState(null);

  const saveCoreValueMutation = useMutation({
    mutationFn: () =>
      editingId
        ? updateCoreValue(editingId, valueForm)
        : createCoreValue(valueForm),
    onSuccess: () => {
      toast.success(editingId ? 'تم التعديل' : 'تمت الإضافة');
      setShowValueForm(false);
      setValueForm(emptyValue);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['about-us-admin'] });
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteCoreValueMutation = useMutation({
    mutationFn: (id) => deleteCoreValue(id),
    onSuccess: () => {
      toast.success('تم الحذف');
      qc.invalidateQueries({ queryKey: ['about-us-admin'] });
    },
    onError: () => toast.error('فشل الحذف'),
  });

  const uploadIconMutation = useMutation({
    mutationFn: ({ id, file }) => uploadCoreValueIcon(id, file),
    onSuccess: () => {
      toast.success('تم رفع الأيقونة');
      setIconUploadId(null);
      qc.invalidateQueries({ queryKey: ['about-us-admin'] });
    },
    onError: () => toast.error('فشل رفع الأيقونة'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateCoreValue(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['about-us-admin'] }),
    onError: () => toast.error('حدث خطأ'),
  });

  function startEdit(cv) {
    setEditingId(cv.id);
    setValueForm({
      titleAr: cv.titleAr || '',
      titleEn: cv.titleEn || '',
      descriptionAr: cv.descriptionAr || '',
      descriptionEn: cv.descriptionEn || '',
      iconKey: cv.iconKey || 'sparkles',
      isActive: cv.isActive !== false,
    });
    setShowValueForm(true);
  }

  function cancelValueForm() {
    setShowValueForm(false);
    setValueForm(emptyValue);
    setEditingId(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Section: Brand + Logo ─────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
          الشعار واسم العلامة
        </h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* logo preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              {page?.logoUrl ? (
                <img src={apiImg(page.logoUrl)} alt="logo" className="size-full object-contain p-1" />
              ) : (
                <ImagePlus className="size-8 text-slate-300" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogoMutation.mutate(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadLogoMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-400"
            >
              <Upload className="size-3.5" />
              {uploadLogoMutation.isPending ? 'جاري الرفع…' : 'رفع الشعار'}
            </button>
          </div>

          {/* brand name */}
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            <Field label="اسم العلامة (عربي)">
              <input className={inputCls} value={form.brandNameAr}
                onChange={(e) => setForm((p) => ({ ...p, brandNameAr: e.target.value }))} />
            </Field>
            <Field label="Brand Name (English)">
              <input className={inputCls} dir="ltr" value={form.brandNameEn}
                onChange={(e) => setForm((p) => ({ ...p, brandNameEn: e.target.value }))} />
            </Field>
          </div>
        </div>
      </section>

      {/* ── Section: Intro Text ───────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
          نص المقدمة
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="العنوان (عربي)">
            <input className={inputCls} value={form.introHeadingAr}
              onChange={(e) => setForm((p) => ({ ...p, introHeadingAr: e.target.value }))} />
          </Field>
          <Field label="Heading (English)">
            <input className={inputCls} dir="ltr" value={form.introHeadingEn}
              onChange={(e) => setForm((p) => ({ ...p, introHeadingEn: e.target.value }))} />
          </Field>
          <Field label="النص الكامل (عربي)">
            <textarea rows={4} className={textareaCls} value={form.introBodyAr}
              onChange={(e) => setForm((p) => ({ ...p, introBodyAr: e.target.value }))} />
          </Field>
          <Field label="Body Text (English)">
            <textarea rows={4} className={textareaCls} dir="ltr" value={form.introBodyEn}
              onChange={(e) => setForm((p) => ({ ...p, introBodyEn: e.target.value }))} />
          </Field>
        </div>
      </section>

      {/* ── Section: Core Values Header ───────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
          عنوان قسم القيم
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="العنوان (عربي)">
            <input className={inputCls} value={form.valuesSectionTitleAr}
              onChange={(e) => setForm((p) => ({ ...p, valuesSectionTitleAr: e.target.value }))} />
          </Field>
          <Field label="Section Title (English)">
            <input className={inputCls} dir="ltr" value={form.valuesSectionTitleEn}
              onChange={(e) => setForm((p) => ({ ...p, valuesSectionTitleEn: e.target.value }))} />
          </Field>
        </div>
      </section>

      {/* ── Save page button ─────────────────────────────── */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => savePageMutation.mutate()}
          disabled={savePageMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save className="size-4" />
          {savePageMutation.isPending ? 'جاري الحفظ…' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* ── Section: Core Values ──────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            القيم الأساسية ({page?.coreValues?.length || 0})
          </h2>
          {!showValueForm && (
            <button
              type="button"
              onClick={() => { setShowValueForm(true); setEditingId(null); setValueForm(emptyValue); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              إضافة قيمة
            </button>
          )}
        </div>

        {/* value form */}
        {showValueForm && (
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800 dark:bg-indigo-900/20">
            <h3 className="mb-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {editingId ? 'تعديل القيمة' : 'إضافة قيمة جديدة'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="العنوان (عربي) *">
                <input className={inputCls} value={valueForm.titleAr}
                  onChange={(e) => setValueForm((p) => ({ ...p, titleAr: e.target.value }))} />
              </Field>
              <Field label="Title (English)">
                <input className={inputCls} dir="ltr" value={valueForm.titleEn}
                  onChange={(e) => setValueForm((p) => ({ ...p, titleEn: e.target.value }))} />
              </Field>
              <Field label="الوصف (عربي) *">
                <textarea rows={3} className={textareaCls} value={valueForm.descriptionAr}
                  onChange={(e) => setValueForm((p) => ({ ...p, descriptionAr: e.target.value }))} />
              </Field>
              <Field label="Description (English)">
                <textarea rows={3} className={textareaCls} dir="ltr" value={valueForm.descriptionEn}
                  onChange={(e) => setValueForm((p) => ({ ...p, descriptionEn: e.target.value }))} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="الأيقونة">
                <IconPicker value={valueForm.iconKey} onChange={(k) => setValueForm((p) => ({ ...p, iconKey: k }))} />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="cv-active"
                checked={valueForm.isActive}
                onChange={(e) => setValueForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="cv-active" className="text-sm text-slate-700 dark:text-slate-300">مفعّلة (تظهر في التطبيق)</label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => saveCoreValueMutation.mutate()}
                disabled={saveCoreValueMutation.isPending || !valueForm.titleAr || !valueForm.descriptionAr}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="size-4" />
                {saveCoreValueMutation.isPending ? 'جاري الحفظ…' : editingId ? 'تحديث' : 'إضافة'}
              </button>
              <button type="button" onClick={cancelValueForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* values list */}
        {!page?.coreValues?.length ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">لا توجد قيم بعد. اضغط «إضافة قيمة» للبدء.</p>
        ) : (
          <div className="space-y-3">
            {page.coreValues.map((cv) => {
              const iconOpt = ICON_OPTIONS.find((o) => o.key === cv.iconKey) || ICON_OPTIONS[0];
              const IconEl = iconOpt.Icon;
              return (
                <div
                  key={cv.id}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                    cv.isActive
                      ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                      : 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  {/* icon / custom image */}
                  <div className="relative flex-shrink-0">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                      {cv.iconUrl ? (
                        <img src={apiImg(cv.iconUrl)} alt="" className="size-full object-cover" />
                      ) : (
                        <IconEl className={`size-6 ${iconOpt.color}`} />
                      )}
                    </div>
                    {/* upload icon button */}
                    <input
                      ref={iconUploadId === cv.id ? iconInputRef : null}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadIconMutation.mutate({ id: cv.id, file: f });
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      title="رفع أيقونة مخصصة"
                      onClick={() => {
                        setIconUploadId(cv.id);
                        setTimeout(() => iconInputRef.current?.click(), 50);
                      }}
                      className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-slate-500 shadow hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-400"
                    >
                      <Upload className="size-3" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{cv.titleAr}</p>
                    {cv.titleEn && <p className="text-xs text-slate-400">{cv.titleEn}</p>}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{cv.descriptionAr}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {/* toggle active */}
                    <button
                      type="button"
                      title={cv.isActive ? 'إخفاء' : 'إظهار'}
                      onClick={() => toggleActiveMutation.mutate({ id: cv.id, isActive: !cv.isActive })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                    >
                      {cv.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    {/* edit */}
                    <button
                      type="button"
                      title="تعديل"
                      onClick={() => startEdit(cv)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"
                    >
                      <GripVertical className="size-4" />
                    </button>
                    {/* delete */}
                    <button
                      type="button"
                      title="حذف"
                      onClick={() => {
                        if (confirm('حذف هذه القيمة؟')) deleteCoreValueMutation.mutate(cv.id);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
