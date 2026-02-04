import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Globe, Lock, Save, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { profileService } from '../services/profileService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

const LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'AR', label: 'العربية' },
];

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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
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
        avatar: displayUser.profile.avatar ?? '',
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

  const languageMutation = useMutation({
    mutationFn: (lang) => profileService.updateLanguage(lang),
    onSuccess: (_, lang) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const u = useAuthStore.getState().user;
      if (u) setAuth({ ...u, preferredLanguage: lang }, useAuthStore.getState().token);
      toast.success(t('common.success'));
    },
    onError: (err) => toast.error(err?.message ?? 'Failed to update language'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      avatar: form.avatar.trim() || undefined,
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
            <div className="relative shrink-0">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt=""
                  className="size-24 rounded-xl border-4 border-white object-cover shadow-lg sm:size-28"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }}
                />
              ) : null}
              <div
                className={`flex size-24 items-center justify-center rounded-xl border-4 border-white bg-indigo-100 text-3xl font-semibold text-indigo-700 shadow-lg sm:size-28 ${form.avatar ? 'hidden' : ''}`}
              >
                {initials}
              </div>
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
            label={t('profile.avatarUrl')}
            name="avatar"
            value={form.avatar}
            onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
          />
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

      {/* Language */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Globe className="size-5 text-indigo-600" /> {t('common.language')}
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-slate-700">{t('common.language')}</label>
          <select
            value={displayUser?.preferredLanguage ?? 'AR'}
            onChange={(e) => languageMutation.mutate(e.target.value)}
            disabled={languageMutation.isPending}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            {LANGUAGES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Change password placeholder */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Lock className="size-5 text-indigo-600" /> {t('profile.changePassword')}
        </h3>
        <p className="text-sm text-slate-500">
          {t('profile.changePasswordDesc')}
        </p>
      </Card>
    </div>
  );
}
