import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { LayoutProvider, useLayout } from '../contexts/LayoutContext';

const ROUTE_TITLES = {
  '/dashboard': ['Dashboard', 'Overview and stats'],
  '/profile': ['Profile', 'Your account'],
  '/users': ['Users', 'Manage platform users'],
  '/services': ['Services', 'Service catalog'],
  '/services/new': ['Create service', 'Add a new service'],
  '/brands': ['Vehicle Brands', 'Manage brands'],
  '/models': ['Vehicle Models', 'Manage models'],
  '/bookings': ['Bookings', 'Manage bookings'],
  '/products': ['Products', 'Product catalog'],
  '/invoices': ['Invoices', 'View invoices'],
  '/settings': ['Settings', 'App settings'],
};

function getTitleForPath(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/services/') && pathname !== '/services/new') {
    return ['Service details', ''];
  }
  return ['', ''];
}

function AdminLayoutInner() {
  const location = useLocation();
  const { setHeader, sidebarCollapsed, toggleSidebar, openMobileMenu, closeMobileMenu, mobileMenuOpen } = useLayout();
  const [title, subtitle] = getTitleForPath(location.pathname);

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
        className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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
