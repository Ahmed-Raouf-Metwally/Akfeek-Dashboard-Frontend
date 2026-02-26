import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Lock, Save, Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { profileService } from '../services/profileService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';


function ChangePasswordCard({ t }) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const mutation = useMutation({
    mutationFn: () => profileService.changePassword(pw.current, pw.next),
    onSuccess: () => {
      toast.success(t('profile.passwordChanged', 'تم تغيير كلمة المرور بنجاح'));
      setPw({ current: '', next: '', confirm: '' });
    },
    onError: (err) => toast.error(err?.message ?? t('common.error')),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast.error(t('profile.passwordMismatch', 'كلمتا المرور غير متطابقتين'));
      return;
    }
    if (pw.next.length < 8) {
      toast.error(t('profile.passwordTooShort', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'));
      return;
    }
    mutation.mutate();
  };

  const field = (id, label, value, key) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show[key] ? 'text' : 'password'}
          value={value}
          onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
          id={id}
          autoComplete={key === 'current' ? 'current-password' : 'new-password'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pe-10 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
          className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
        >
          {show[key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
        <Lock className="size-5 text-indigo-600" /> {t('profile.changePassword')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {field('cur-pw',  t('profile.currentPassword', 'كلمة المرور الحالية'),  pw.current,  'current')}
        {field('new-pw',  t('profile.newPassword',     'كلمة المرور الجديدة'),  pw.next,     'next')}
        {field('conf-pw', t('profile.confirmPassword', 'تأكيد كلمة المرور'),    pw.confirm,  'confirm')}
        <p className="text-xs text-slate-400">{t('profile.passwordHint', 'على الأقل 8 أحرف')}</p>
        <div className="pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || !pw.current || !pw.next || !pw.confirm}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {mutation.isPending
              ? <Loader2 className="size-4 animate-spin" />
              : <Save className="size-4" />
            }
            {t('profile.changePassword', 'تغيير كلمة المرور')}
          </button>
        </div>
      </form>
    </Card>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      {Icon && (
        <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    bioAr: '',
  });

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.getProfile(),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const displayUser = profileUser ?? user;

  React.useEffect(() => {
    if (displayUser?.profile) {
      setForm((f) => ({
        ...f,
        firstName: displayUser.profile.firstName ?? '',
        lastName: displayUser.profile.lastName ?? '',
        bio: displayUser.profile.bio ?? '',
        bioAr: displayUser.profile.bioAr ?? '',
      }));
    }
  }, [displayUser?.profile]);

  const updateMutation = useMutation({
    mutationFn: (payload) => profileService.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAuth(updated, useAuthStore.getState().token);
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message ?? t('common.error')),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => profileService.uploadAvatar(file),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAuth(updated, useAuthStore.getState().token);
      setAvatarPreview(null);
      toast.success(t('profile.avatarUpdated', 'تم تحديث الصورة الشخصية'));
    },
    onError: (err) => toast.error(err?.message ?? t('common.error')),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    avatarMutation.mutate(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      bio: form.bio.trim() || undefined,
      bioAr: form.bioAr.trim() || undefined,
    });
  };

  const fullName = [displayUser?.profile?.firstName, displayUser?.profile?.lastName].filter(Boolean).join(' ') || displayUser?.email?.split('@')[0] || 'User';
  const initials = (fullName.slice(0, 2) || 'U').toUpperCase();

  if (isLoading && !displayUser) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <Card className="p-8">
          <div className="flex animate-pulse flex-col items-center gap-4 sm:flex-row">
            <div className="size-24 rounded-full bg-slate-200" />
            <div className="h-20 flex-1 space-y-2 rounded bg-slate-100" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('profile.title')}</h1>
        <p className="text-sm text-slate-500">{t('profile.manageAccount')}</p>
      </div>

      {/* Hero card */}
      <Card className="overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-indigo-500 sm:h-28" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative shrink-0 group">
              {(avatarPreview || displayUser?.profile?.avatar) ? (
                <img
                  src={avatarPreview || displayUser.profile.avatar}
                  alt=""
                  className="size-24 rounded-xl border-4 border-white object-cover shadow-lg sm:size-28"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-xl border-4 border-white bg-indigo-100 text-3xl font-semibold text-indigo-700 shadow-lg sm:size-28">
                  {initials}
                </div>
              )}
              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                title={t('profile.changeAvatar', 'تغيير الصورة')}
              >
                {avatarMutation.isPending
                  ? <Loader2 className="size-6 animate-spin text-white" />
                  : <Camera className="size-6 text-white" />
                }
                <span className="text-[11px] font-medium text-white">
                  {t('profile.changeAvatar', 'تغيير')}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-500">{displayUser?.email}</p>
              <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {displayUser?.role ?? 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Read-only details */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <User className="size-5 text-indigo-600" /> {t('profile.accountDetails')}
        </h3>
        <DetailRow label={t('common.email')} value={displayUser?.email} icon={Mail} />
        <DetailRow label={t('common.phone')} value={displayUser?.phone} icon={Phone} />
        <DetailRow label={t('roles.rolesTitle')} value={displayUser?.role} icon={User} />
        <DetailRow label={t('common.status')} value={displayUser?.status} icon={User} />
      </Card>

      {/* Edit profile form */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Camera className="size-5 text-indigo-600" /> {t('profile.editProfile')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('profile.firstName')}
              name="firstName"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder={t('profile.firstName')}
            />
            <Input
              label={t('profile.lastName')}
              name="lastName"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder={t('profile.lastName')}
            />
          </div>
          <Input
            label={t('profile.bioEn')}
            name="bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Short bio"
          />
          <Input
            label={t('profile.bioAr')}
            name="bioAr"
            value={form.bioAr}
            onChange={(e) => setForm((f) => ({ ...f, bioAr: e.target.value }))}
            placeholder="نبذة قصيرة"
          />
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" /> {t('settings.saveChanges')}
            </button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <ChangePasswordCard t={t} />
    </div>
  );
}
