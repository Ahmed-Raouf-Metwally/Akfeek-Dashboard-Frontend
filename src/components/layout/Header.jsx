import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Bell, User, Settings, LogOut, PanelLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Header({ title, subtitle, onMenuClick, onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = user?.profile?.firstName || user?.email?.split('@')[0] || 'Admin';
  const initials = (name.slice(0, 2) || 'AD').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 transition-[padding] duration-200 sm:px-6">
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
        <Menu as="div" className="relative">
          <Menu.Button
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-medium text-white">3</span>
          </Menu.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-sm font-medium text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">You have 3 unread</p>
              </div>
              <div className="max-h-60 overflow-auto py-1">
                <div className="px-3 py-2 text-sm text-slate-500">No new notifications.</div>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 text-left transition-colors hover:bg-slate-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initials}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-medium text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role ?? 'Admin'}</p>
            </div>
          </Menu.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ close }) => (
                    <Link to="/settings" onClick={close} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                      <User className="size-4 shrink-0 text-slate-500" /> Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ close }) => (
                    <Link to="/settings" onClick={close} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                      <Settings className="size-4 shrink-0 text-slate-500" /> Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ close }) => (
                    <button type="button" onClick={() => { close(); handleLogout(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                      <LogOut className="size-4 shrink-0" /> Log out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
