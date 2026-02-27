import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Save, Camera, Mail, Phone } from 'lucide-react';
import { userService } from '../services/userService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function EditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        avatar: '',
        bio: '',
        bioAr: '',
    });

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id),
        enabled: !!id,
        staleTime: 60_000,
    });

    useEffect(() => {
        if (user?.profile) {
            setForm({
                firstName: user.profile.firstName ?? '',
                lastName: user.profile.lastName ?? '',
                avatar: user.profile.avatar ?? '',
                bio: user.profile.bio ?? '',
                bioAr: user.profile.bioAr ?? '',
            });
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: (payload) => userService.updateUser(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            toast.success(t('common.success'));
            navigate('/users');
        },
        onError: (err) => {
            toast.error(err?.message || t('error.updateFailed'));
        },
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <TableSkeleton rows={8} cols={1} />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="space-y-6">
                <Card className="p-8 text-center">
                    <p className="mb-4 text-slate-600">{t('common.error')}</p>
                    <Link to="/users" className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                        {t('common.back')}
                    </Link>
                </Card>
            </div>
        );
    }

    const fullName = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                    <ArrowLeft className="size-4" /> {t('common.back')}
                </button>
                <h1 className="text-xl font-semibold text-slate-900">{t('users.editUser', 'Edit User')}</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* User Info Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                {form.avatar ? (
                                    <img
                                        src={form.avatar}
                                        alt={fullName}
                                        className="size-24 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '';
                                            e.target.classList.add('hidden');
                                        }}
                                    />
                                ) : (
                                    <div className="flex size-24 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
                                        {(fullName.slice(0, 2) || '?').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">{fullName}</h2>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                    {user.role}
                                </span>
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">{t('common.details')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="size-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{user.phone || '—'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
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
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate('/users')}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    <Save className="size-4" /> {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
