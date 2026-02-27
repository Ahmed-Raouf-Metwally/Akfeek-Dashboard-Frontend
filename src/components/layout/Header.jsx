import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { Bell, User, Settings, LogOut, PanelLeft, Check, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useDashboardSettingsStore } from '../../store/dashboardSettingsStore';
import LanguageSwitcher from '../LanguageSwitcher';
import { notificationService } from '../../services/notificationService';

export default function Header({ title, subtitle, onMenuClick, onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = user?.profile?.firstName || user?.email?.split('@')[0] || 'Admin';
  const initials = (name.slice(0, 2) || 'AD').toUpperCase();

  // Fetch real unread notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 1, true], // Correct unreadOnly=true request
    queryFn: () => notificationService.getNotifications({ page: 1, limit: 5, unreadOnly: 'true' }),
    staleTime: 30_000,
  });

  const unreadCount = notificationsData?.pagination?.total || 0;
  const recentNotifications = notificationsData?.data || [];

  const markRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const isAr = i18n.language === 'ar';
  const theme = useDashboardSettingsStore((s) => s.theme);
  const setTheme = useDashboardSettingsStore((s) => s.setTheme);
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 transition-[padding] duration-200 sm:px-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open menu"
        >
          <PanelLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="size-5" />
        </button>
        <div className="min-w-0">
          {title && <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>}
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          aria-label={isDark ? t('settings.themes.light', 'وضع نهاري') : t('settings.themes.dark', 'وضع ليلي')}
          title={isDark ? t('settings.themes.light', 'وضع نهاري') : t('settings.themes.dark', 'وضع ليلي')}
        >
          {isDark
            ? <Sun  className="size-5 text-amber-400" />
            : <Moon className="size-5" />
          }
        </button>

        <Menu as="div" className="relative">
          <Menu.Button
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('nav.notifications')}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-medium text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Menu.Button>
            <Menu.Items
              transition
              dir={isAr ? 'rtl' : 'ltr'}
              className={`absolute top-full z-50 mt-2 w-80 min-w-0 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden transition ease-out data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 ${isAr ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
            >
              <div className={`flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t('nav.notifications')}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {unreadCount > 0 ? t('notifications.youHaveUnread', { count: unreadCount }) : t('notifications.allCaughtUp')}
                  </p>
                </div>
                <Menu.Item>
                  {({ close }) => (
                    <Link to="/notifications" onClick={close} className="shrink-0 text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
                      {t('common.viewAll')}
                    </Link>
                  )}
                </Menu.Item>
              </div>

              <div className="max-h-64 overflow-auto divide-y divide-slate-50">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => (
                    <div key={notif.id} className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="mt-1 flex size-2 shrink-0 rounded-full bg-indigo-500" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {isAr && notif.titleAr ? notif.titleAr : notif.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed break-words">
                          {isAr && notif.messageAr ? notif.messageAr : notif.message}
                        </p>
                      </div>
                      <button
                        onClick={() => markRead.mutate(notif.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all"
                        title={t('notifications.markRead')}
                      >
                        <Check className="size-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto mb-2 size-8 text-slate-200" />
                    <p className="text-xs text-slate-400">{t('notifications.noNotifications')}</p>
                  </div>
                )}
              </div>

              <Menu.Item>
                {({ close }) => (
                  <Link
                    to="/notifications"
                    onClick={close}
                    className="block border-t border-slate-100 px-4 py-2.5 text-center text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {t('notifications.seeAllHistory')}
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
        </Menu>

        <Menu as="div" className="relative">
          <Menu.Button className={`flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initials}
            </div>
            <div className={`hidden min-w-0 sm:block ${isAr ? 'text-right' : 'text-left'}`}>
              <p className="truncate text-sm font-medium text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role ?? 'Admin'}</p>
            </div>
          </Menu.Button>
            <Menu.Items
              transition
              dir={isAr ? 'rtl' : 'ltr'}
              className={`absolute top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none transition ease-out data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 ${isAr ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ close }) => (
                    <Link to="/profile" onClick={close} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <User className="size-4 shrink-0 text-slate-500" /> {t('nav.profile')}
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ close }) => (
                    <Link to="/settings" onClick={close} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <Settings className="size-4 shrink-0 text-slate-500" /> {t('nav.settings')}
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ close }) => (
                    <button type="button" onClick={() => { close(); handleLogout(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <LogOut className="size-4 shrink-0" /> {t('auth.logout')}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}

