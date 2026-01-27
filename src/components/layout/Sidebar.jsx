import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Car,
  CalendarCheck,
  Package,
  FileText,
  Settings,
  UserCircle,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Shield,
  Activity,
  CircleDot,
} from 'lucide-react';
import { useDashboardSettingsStore } from '../../store/dashboardSettingsStore';

const SECTIONS = [
  {
    key: 'main',
    labelEn: 'Main',
    labelAr: 'الرئيسية',
    items: [
      { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { key: 'profile', to: '/profile', icon: UserCircle, label: 'Profile' },
    ],
  },
  {
    key: 'management',
    labelEn: 'Management',
    labelAr: 'الإدارة',
    items: [
      { key: 'users', to: '/users', icon: Users, label: 'Users' },
      { key: 'roles', to: '/roles', icon: Shield, label: 'Roles & Permissions' },
      { key: 'notifications', to: '/notifications', icon: Bell, label: 'Notifications' },
      { key: 'activity', to: '/activity', icon: Activity, label: 'Activity / Logs' },
    ],
  },
  {
    key: 'services-vehicles',
    labelEn: 'Services & Vehicles',
    labelAr: 'الخدمات والمركبات',
    items: [
      { key: 'services', to: '/services', icon: Wrench, label: 'Services' },
      { key: 'brands', to: '/brands', icon: Car, label: 'Vehicle Brands' },
      { key: 'models', to: '/models', icon: CircleDot, label: 'Vehicle Models' },
    ],
  },
  {
    key: 'orders',
    labelEn: 'Orders & Finance',
    labelAr: 'الطلبات والمالية',
    items: [
      { key: 'bookings', to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
      { key: 'invoices', to: '/invoices', icon: FileText, label: 'Invoices' },
    ],
  },
  {
    key: 'catalog',
    labelEn: 'Catalog',
    labelAr: 'المنتجات',
    items: [{ key: 'products', to: '/products', icon: Package, label: 'Products' }],
  },
  {
    key: 'system',
    labelEn: 'System',
    labelAr: 'النظام',
    items: [{ key: 'settings', to: '/settings', icon: Settings, label: 'Settings' }],
  },
];

function SidebarLink({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
        ${active
          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
        ${collapsed ? 'justify-center px-2' : ''}
      `}
      title={collapsed ? label : undefined}
    >
      <Icon className="size-5 shrink-0 text-slate-500" aria-hidden />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="truncate whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navVisibility = useDashboardSettingsStore((s) => s.navVisibility);

  const panel = (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white
        transition-[width,transform] duration-200 ease-in-out
        w-64
        ${collapsed ? 'lg:w-[72px]' : ''}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 overflow-hidden rounded-md font-semibold text-slate-800 ${collapsed ? 'w-9 justify-center' : ''}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-sm font-bold text-white shadow-sm">
            A
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                Akfeek
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => navVisibility[item.key] !== false);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.key} className="space-y-1">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.labelEn}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <SidebarLink
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      active={location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
                      collapsed={collapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {collapsed && (
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="size-5" />
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onClick={onCloseMobile}
          onKeyDown={(e) => (e.key === 'Escape' ? onCloseMobile?.() : null)}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden"
        />
      )}
      {panel}
    </>
  );
}
