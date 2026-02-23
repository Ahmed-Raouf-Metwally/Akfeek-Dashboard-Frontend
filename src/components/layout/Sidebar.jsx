import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- motion.span used in JSX
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Wrench,
  Car,
  CalendarCheck,
  Package,
  FileText,
  Settings,
  UserCircle,
  PanelLeftClose,
  Bell,
  Shield,
  Activity,
  CircleDot,
  CreditCard,
  Wallet,
  Star,
  Radio,
  ClipboardCheck,
  PackageSearch,
  Store,
  ShoppingBag,
  Layers,
  Truck,
  Building2,
  MessageSquare,
  Headphones,
  Tag,
} from 'lucide-react';
import { useDashboardSettingsStore } from '../../store/dashboardSettingsStore';
import { useAuthStore } from '../../store/authStore';

/** ١ – فيندور قطع الغيار / المنتجات (بدون تقييمات أو Points Audit) */
const VENDOR_AUTO_PARTS_KEYS = new Set(['dashboard', 'analytics', 'myVendorDetail', 'vendorCoupons', 'auto-parts', 'marketplace-orders', 'wallets', 'invoices', 'payments', 'profile', 'settings']);
/** ٢ – فيندور العناية الشاملة */
const VENDOR_COMPREHENSIVE_CARE_KEYS = new Set(['dashboard', 'analytics', 'myVendorDetail', 'vendorCoupons', 'vendorMyServices', 'vendorBookings', 'wallets', 'invoices', 'payments', 'profile', 'settings']);
/** ٣ – فيندور الورش المعتمدة */
const VENDOR_WORKSHOP_KEYS = new Set(['dashboard', 'analytics', 'myVendorDetail', 'vendorCoupons', 'vendorMyWorkshop', 'vendorWorkshopBookings', 'wallets', 'invoices', 'payments', 'profile', 'settings']);
/** ٤ – فيندور خدمة الغسيل */
const VENDOR_CAR_WASH_KEYS = new Set(['dashboard', 'analytics', 'myVendorDetail', 'vendorCoupons', 'vendorMyServices', 'vendorBookings', 'wallets', 'invoices', 'payments', 'profile', 'settings']);

const SECTIONS = [
  {
    key: 'main',
    labelEn: 'Main',
    labelAr: 'الرئيسية',
    items: [
      { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { key: 'analytics', to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { key: 'myVendorDetail', to: '/my-vendor', icon: Store, label: 'My Store Page' },
      { key: 'vendorCoupons', to: '/vendor/coupons', icon: Tag, label: 'Coupons', labelAr: 'الكوبونات' },
    ],
  },

  {
    key: 'services-vehicles',
    labelEn: 'Services & Vehicles',
    labelAr: 'الخدمات والمركبات',
    items: [
      { key: 'services', to: '/services', icon: Wrench, label: 'Services' },
      { key: 'mobileCarService', to: '/mobile-car-service', icon: Truck, label: 'Mobile Car Service' },
      { key: 'workshops', to: '/workshops', icon: Building2, label: 'Workshops' },
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
      { key: 'broadcasts', to: '/broadcasts', icon: Radio, label: 'Broadcasts' },
      { key: 'inspections', to: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
      { key: 'supply-requests', to: '/supply-requests', icon: PackageSearch, label: 'Supply Requests' },
      { key: 'invoices', to: '/invoices', icon: FileText, label: 'Invoices' },
      { key: 'payments', to: '/payments', icon: CreditCard, label: 'Payments' },
      { key: 'wallets', to: '/wallets', icon: Wallet, label: 'Wallets' },
      { key: 'points', to: '/points', icon: Star, label: 'Points Audit' },
      { key: 'ratings', to: '/ratings', icon: Star, label: 'Ratings' },
    ],
  },
  {
    key: 'vendorServices',
    labelEn: 'Services',
    labelAr: 'الخدمات',
    items: [
      { key: 'vendorMyServices', to: '/vendor/comprehensive-care/services', icon: Wrench, label: 'My Services' },
      { key: 'vendorBookings', to: '/vendor/comprehensive-care/bookings', icon: CalendarCheck, label: 'Appointments' },
    ],
  },
  {
    key: 'vendorWorkshop',
    labelEn: 'Certified Workshop (Vendor)',
    labelAr: 'الورش المعتمدة',
    items: [
      { key: 'vendorMyWorkshop', to: '/vendor/workshop', icon: Building2, label: 'My Workshop' },
      { key: 'vendorWorkshopBookings', to: '/vendor/workshop/bookings', icon: CalendarCheck, label: 'Workshop Bookings' },
    ],
  },
  {
    key: 'marketplace',
    labelEn: 'Marketplace',
    labelAr: 'المتجر',
    items: [
      { key: 'vendors', to: '/vendors', icon: Store, label: 'Vendors' },
      { key: 'vendorRequests', to: '/vendors/onboarding', icon: ClipboardCheck, label: 'Vendor Requests' },
      { key: 'auto-part-categories', to: '/auto-part-categories', icon: Layers, label: 'Categories' },
      { key: 'auto-parts', to: '/auto-parts', icon: ShoppingBag, label: 'Auto Parts' },
      { key: 'marketplace-orders', to: '/marketplace-orders', icon: Package, label: 'Orders' },
    ],
  },
  {
    key: 'management',
    labelEn: 'Management',
    labelAr: 'الإدارة',
    items: [
      { key: 'users', to: '/users', icon: Users, label: 'Users' },
      { key: 'roles', to: '/roles', icon: Shield, label: 'Roles & Permissions' },
      { key: 'feedback', to: '/feedback', icon: MessageSquare, label: 'Feedback' },
      { key: 'technicalSupportRequests', to: '/technical-support-requests', icon: Headphones, label: 'Technical Support Requests' },
      { key: 'notifications', to: '/notifications', icon: Bell, label: 'Notifications' },
      { key: 'activity', to: '/activity', icon: Activity, label: 'Activity / Logs' },
    ],
  },
  {
    key: 'system',
    labelEn: 'System',
    labelAr: 'النظام',
    items: [{ key: 'settings', to: '/settings', icon: Settings, label: 'Settings' },
    { key: 'profile', to: '/profile', icon: UserCircle, label: 'Profile' },
    ],

  },
];

function SidebarLink({ to, icon, label, active, collapsed }) {
  const IconEl = icon;
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
      <IconEl className="size-5 shrink-0 text-slate-500" aria-hidden />
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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isVendor = user?.role === 'VENDOR';
  const navVisibility = useDashboardSettingsStore((s) => s.navVisibility);
  const isRTL = i18n.language === 'ar';

  const panel = (
    <aside
      className={`
        fixed inset-y-0 z-40 flex flex-col border-slate-200 bg-white
        transition-[width,transform] duration-200 ease-in-out
        w-64
        ${collapsed ? 'lg:w-[72px]' : ''}
        ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        ${mobileOpen ? 'translate-x-0' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:translate-x-0`}
      `}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 overflow-hidden rounded-md font-semibold text-slate-800 ${collapsed ? 'w-9 justify-center' : ''}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-indigo-500 text-sm font-bold text-white shadow-sm">
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
          let visibleItems = section.items.filter((item) => navVisibility[item.key] !== false);
          const vt = user?.vendorType;
          if (section.key === 'services-vehicles' && isVendor && vt === 'CERTIFIED_WORKSHOP') {
            // فيندور الورش المعتمدة يشوف قسم "الورش المعتمدة" فقط، مش "الخدمات والمركبات"
            visibleItems = [];
          }
          if (section.key === 'vendorServices') {
            // خدماتي ومواعيد الحجوزات لفيندور العناية الشاملة والغسيل فقط، مش للأدمن
            const showServicesSection = isVendor && (vt === 'COMPREHENSIVE_CARE' || vt === 'CAR_WASH');
            if (!showServicesSection) visibleItems = [];
          }
          if (section.key === 'vendorWorkshop') {
            // للأدمن: الورش تظهر مرة واحدة تحت "الخدمات والمركبات" فقط. هذا القسم لفيندور الورش فقط.
            if (!isVendor) visibleItems = [];
            else if (isVendor && vt !== 'CERTIFIED_WORKSHOP') visibleItems = [];
          }
          if (isVendor) {
            const vendorKeys =
              vt === 'COMPREHENSIVE_CARE' ? VENDOR_COMPREHENSIVE_CARE_KEYS
                : vt === 'CERTIFIED_WORKSHOP' ? VENDOR_WORKSHOP_KEYS
                  : vt === 'CAR_WASH' ? VENDOR_CAR_WASH_KEYS
                    : VENDOR_AUTO_PARTS_KEYS;
            visibleItems = visibleItems.filter((item) => vendorKeys.has(item.key));
          } else {
            // إخفاء "صفحة متجري" عن الأدمن — للفيندور فقط
            visibleItems = visibleItems.filter((item) => item.key !== 'myVendorDetail');
          }
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.key} className="space-y-1">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {isRTL ? section.labelAr : section.labelEn}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isMobileCar = item.key === 'mobileCarService';
                  // ✅ توجيه حجوزات فيندور الغسيل لصفحتها المخصصة
                  const resolvedTo = (item.key === 'vendorBookings' && isVendor && vt === 'CAR_WASH')
                    ? '/vendor/car-wash/bookings'
                    : item.to;
                  const active = isMobileCar
                    ? location.pathname.startsWith('/mobile-car-service')
                    : (location.pathname === resolvedTo || (resolvedTo !== '/dashboard' && location.pathname.startsWith(resolvedTo.split('?')[0])));
                  return (
                    <li key={resolvedTo}>
                      <SidebarLink
                        to={resolvedTo}
                        icon={item.icon}
                        label={t(`nav.${item.key}`, item.label)}
                        active={active}
                        collapsed={collapsed}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
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
