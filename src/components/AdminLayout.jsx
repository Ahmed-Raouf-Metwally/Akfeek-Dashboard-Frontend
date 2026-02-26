import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { LayoutProvider, useLayout } from '../contexts/LayoutContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';

function getTitleForPath(pathname, t, user) {
  const isCarWash = user?.vendorType === 'CAR_WASH';
  const ROUTE_TITLES = {
    '/dashboard': [t('nav.dashboard', 'Dashboard'), t('dashboard.overview', 'Overview and stats')],
    '/analytics': [t('nav.analytics', 'Analytics'), t('dashboard.analyticsSubtitle', 'Platform metrics and performance')],
    '/profile': [t('nav.profile', 'Profile'), t('common.yourAccount', 'Your account')],
    '/users': [t('nav.users', 'Users'), t('common.managePlatformUsers', 'Manage platform users')],
    '/roles': [t('nav.roles', 'Roles & Permissions'), t('common.rolesAndAccess', 'Roles and access control')],
    '/notifications': [t('nav.notifications', 'Notifications'), t('common.viewManageNotifications', 'View and manage notifications')],
    '/activity': [t('nav.activity', 'Activity / Logs'), t('common.auditLog', 'Audit and activity log')],
    '/feedback': [t('nav.feedback', 'Complaints & Suggestions'), t('feedback.subtitle', 'Manage customer feedback')],
    '/technical-support-requests': [t('nav.technicalSupportRequests', 'طلبات الدعم الفني'), t('technicalSupport.subtitle', 'عرض الطلبات وتعيين الفني')],
    '/services': [t('nav.services', 'Services'), t('common.serviceCatalog', 'Service catalog')],
    '/services/new': [t('common.createService', 'Create service'), t('common.addNewService', 'Add a new service')],
    '/brands': [t('nav.brands', 'Vehicle Brands'), t('common.manageBrands', 'Manage brands')],
    '/models': [t('nav.models', 'Vehicle Models'), t('common.manageModels', 'Manage models')],
    '/bookings': [t('nav.bookings', 'Bookings'), t('common.manageBookings', 'Manage bookings')],
    '/broadcasts': [t('nav.broadcasts', 'Broadcasts'), t('broadcasts.subtitle', 'Manage emergency broadcasts')],
    '/towing-requests': [t('nav.towingRequests', 'Towing Requests'), t('towingRequests.subtitle', 'All towing requests and assigned driver')],
    '/invoices': [t('nav.invoices', 'Invoices'), t('common.viewInvoices', 'View invoices')],
    '/settings': [t('nav.settings', 'Settings'), t('common.appSettings', 'App settings')],
    '/vendors': [t('nav.vendors', 'Vendors'), t('common.manageVendors', 'Manage auto parts vendors')],
    '/vendors/new': [t('common.addVendor', 'Add Vendor'), t('common.createVendorProfile', 'Create new vendor profile')],
    '/auto-parts': [t('nav.auto-parts', 'Auto Parts'), t('common.managePartsCatalog', 'Manage parts catalog')],
    '/auto-parts/new': [t('common.addAutoPart', 'Add Auto Part'), t('common.createPartListing', 'Create new part listing')],
    '/auto-part-categories': [t('nav.auto-part-categories', 'Categories'), t('common.manageCategories', 'Manage auto part categories')],
    '/vendor/comprehensive-care/services': user?.role === 'ADMIN'
      ? [t('nav.vendorMyServices', 'Services'), t('services.selectTypeToView', 'Select service type to view')]
      : isCarWash
        ? [t('nav.vendorCarWashServices', 'Car wash services'), t('carWash.vendorServicesSubtitle', 'Manage your car wash services')]
        : [t('nav.vendorComprehensiveServices', 'My Services'), t('comprehensiveCare.vendorServicesSubtitle', 'Manage your comprehensive care services')],
    '/vendor/comprehensive-care/bookings': user?.role === 'ADMIN'
      ? [t('nav.vendorBookings', 'Appointments'), '']
      : isCarWash
        ? [t('nav.vendorCarWashBookings', 'Car wash appointments'), t('carWash.vendorBookingsSubtitle', 'Bookings for your car wash services')]
        : [t('nav.vendorComprehensiveBookings', 'Appointments'), t('comprehensiveCare.vendorBookingsSubtitle', 'Bookings for your comprehensive care services')],
    '/vendor/coupons': [t('nav.vendorCoupons', 'Coupons'), t('vendorCoupons.subtitle', 'Coupon applies only to your services')],
    '/coupons': [t('nav.allCoupons', 'All Coupons'), t('allCoupons.subtitle', 'Manage and monitor all platform coupons')],
  };

  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/services/') && pathname !== '/services/new') return [t('common.serviceDetails', 'Service details'), ''];
  if (pathname.startsWith('/users/')) return [t('common.userDetails', 'User details'), ''];
  if (pathname.startsWith('/bookings/')) return [t('common.bookingDetails', 'Booking details'), ''];
  if (pathname.startsWith('/brands/')) return [t('common.brandDetails', 'Brand details'), ''];
  if (pathname.startsWith('/models/')) return [t('common.modelDetails', 'Model details'), ''];
  if (pathname.startsWith('/invoices/')) return [t('common.invoiceDetails', 'Invoice details'), ''];
  if (pathname.startsWith('/vendors/')) return [t('common.vendorProfile', 'Vendor Profile'), t('common.manageVendorCatalog', 'Manage vendor and catalog')];
  if (pathname.startsWith('/auto-parts/')) return [t('common.autoPartDetails', 'Auto Part Details'), t('common.managePartListing', 'Manage part listing')];
  return ['', ''];
}

function AdminLayoutInner() {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const { setHeader, sidebarCollapsed, toggleSidebar, openMobileMenu, closeMobileMenu, mobileMenuOpen } = useLayout();
  const [title, subtitle] = getTitleForPath(location.pathname, t, user);
  const isRTL = i18n.language === 'ar';
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.id) {
      socketService.connect();
      socketService.joinUser(user.id);

      const handleNotification = (notification) => {
        toast(notification.title || t('notifications.newNotification') || 'New Notification', {
          icon: '🔔',
          duration: 4000
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        // If notification is about wallet/points, refresh wallet data
        if (notification.message?.includes('wallet') || notification.message?.includes('points')) {
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          queryClient.invalidateQueries({ queryKey: ['points-audit'] });
        }
      };

      socketService.onNotification(handleNotification);

      return () => {
        socketService.offNotification();
        // We don't disconnect here to avoid reconnecting on every route change if AdminLayout remounts (it shouldn't if used as Layout). 
        // But if it does, it's fine.
      };
    }
  }, [user, queryClient, t]);

  useEffect(() => {
    setHeader(title, subtitle);
  }, [title, subtitle, setHeader]);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
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
        <main className="flex-1 overflow-auto p-4 sm:p-6 dark:bg-slate-950">
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
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
