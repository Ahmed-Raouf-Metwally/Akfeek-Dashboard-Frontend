import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  if (token && user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const next = {};
    if (!formData.identifier.trim()) next.identifier = t('auth.emailOrPhoneRequired', 'Email or phone is required');
    if (!formData.password) next.password = t('auth.passwordRequired', 'Password is required');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { user, token } = await authService.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      setAuth(user, token);
      toast.success(t('auth.signedInSuccessfully', 'Signed in successfully'));
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.normalized?.message || err?.message || t('auth.signInFailed', 'Sign-in failed');
      toast.error(msg);
      if (err?.response?.status === 401) {
        setErrors({ password: t('auth.invalidCredentials', 'Invalid credentials') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.signIn')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('auth.welcomeBack')}. {t('auth.enterDetailsTo Continue', 'Enter your details to continue')}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('auth.emailOrPhone', 'Email or phone')}
            type="text"
            placeholder={t('auth.emailOrPhonePlaceholder', 'you@example.com or +966...')}
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            autoComplete="username"
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? t('auth.signingIn', 'Signing in…') : t('auth.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            {t('auth.register', 'Register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
