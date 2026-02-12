import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { LayoutProvider, useLayout } from '../contexts/LayoutContext';

function getTitleForPath(pathname, t) {
  const ROUTE_TITLES = {
    '/dashboard': [t('nav.dashboard', 'Dashboard'), t('dashboard.overview', 'Overview and stats')],
    '/analytics': [t('nav.analytics', 'Analytics'), t('dashboard.analyticsSubtitle', 'Platform metrics and performance')],
    '/profile': [t('nav.profile', 'Profile'), t('common.yourAccount', 'Your account')],
    '/users': [t('nav.users', 'Users'), t('common.managePlatformUsers', 'Manage platform users')],
    '/roles': [t('nav.roles', 'Roles & Permissions'), t('common.rolesAndAccess', 'Roles and access control')],
    '/notifications': [t('nav.notifications', 'Notifications'), t('common.viewManageNotifications', 'View and manage notifications')],
    '/activity': [t('nav.activity', 'Activity / Logs'), t('common.auditLog', 'Audit and activity log')],
    '/feedback': [t('nav.feedback', 'Complaints & Suggestions'), t('feedback.subtitle', 'Manage customer feedback')],
    '/services': [t('nav.services', 'Services'), t('common.serviceCatalog', 'Service catalog')],
    '/services/new': [t('common.createService', 'Create service'), t('common.addNewService', 'Add a new service')],
    '/brands': [t('nav.brands', 'Vehicle Brands'), t('common.manageBrands', 'Manage brands')],
    '/models': [t('nav.models', 'Vehicle Models'), t('common.manageModels', 'Manage models')],
    '/bookings': [t('nav.bookings', 'Bookings'), t('common.manageBookings', 'Manage bookings')],
    '/products': [t('nav.products', 'Products'), t('common.productCatalog', 'Product catalog')],
    '/invoices': [t('nav.invoices', 'Invoices'), t('common.viewInvoices', 'View invoices')],
    '/settings': [t('nav.settings', 'Settings'), t('common.appSettings', 'App settings')],
    '/vendors': [t('nav.vendors', 'Vendors'), t('common.manageVendors', 'Manage auto parts vendors')],
    '/vendors/new': [t('common.addVendor', 'Add Vendor'), t('common.createVendorProfile', 'Create new vendor profile')],
    '/auto-parts': [t('nav.auto-parts', 'Auto Parts'), t('common.managePartsCatalog', 'Manage parts catalog')],
    '/auto-parts/new': [t('common.addAutoPart', 'Add Auto Part'), t('common.createPartListing', 'Create new part listing')],
    '/auto-part-categories': [t('nav.auto-part-categories', 'Categories'), t('common.manageCategories', 'Manage auto part categories')],
  };

  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/services/') && pathname !== '/services/new') return [t('common.serviceDetails', 'Service details'), ''];
  if (pathname.startsWith('/users/')) return [t('common.userDetails', 'User details'), ''];
  if (pathname.startsWith('/bookings/')) return [t('common.bookingDetails', 'Booking details'), ''];
  if (pathname.startsWith('/brands/')) return [t('common.brandDetails', 'Brand details'), ''];
  if (pathname.startsWith('/models/')) return [t('common.modelDetails', 'Model details'), ''];
  if (pathname.startsWith('/products/')) return [t('common.productDetails', 'Product details'), ''];
  if (pathname.startsWith('/invoices/')) return [t('common.invoiceDetails', 'Invoice details'), ''];
  if (pathname.startsWith('/vendors/')) return [t('common.vendorProfile', 'Vendor Profile'), t('common.manageVendorCatalog', 'Manage vendor and catalog')];
  if (pathname.startsWith('/auto-parts/')) return [t('common.autoPartDetails', 'Auto Part Details'), t('common.managePartListing', 'Manage part listing')];
  return ['', ''];
}

function AdminLayoutInner() {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const { setHeader, sidebarCollapsed, toggleSidebar, openMobileMenu, closeMobileMenu, mobileMenuOpen } = useLayout();
  const [title, subtitle] = getTitleForPath(location.pathname, t);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    setHeader(title, subtitle);
  }, [title, subtitle, setHeader]);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />
      <div
        className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${isRTL
            ? (sidebarCollapsed ? 'lg:mr-[72px]' : 'lg:mr-64')
            : (sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64')
          }`}
      >
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={openMobileMenu}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="min-h-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <LayoutProvider>
      <AdminLayoutInner />
    </LayoutProvider>
  );
}
