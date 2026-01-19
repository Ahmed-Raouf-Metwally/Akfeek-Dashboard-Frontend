import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaCalendarCheck } from 'react-icons/fa';

const SidebarItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      background: active ? '#F0F0FF' : 'transparent',
      borderRadius: '8px',
      marginBottom: '4px',
      fontWeight: active ? '600' : '500',
      transition: 'all 0.2s'
    }}
  >
    <div style={{ marginRight: '12px', fontSize: '18px' }}>{icon}</div>
    {label}
  </Link>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth stuff
    navigate('/login');
  };

  return (
    <div className="flex h-screen" style={{ background: '#F5F5F7' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'white', padding: '24px', borderRight: '1px solid var(--border)' }} className="flex-col">
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 'bold' }}>Akfeek Admin</h1>
        </div>

        <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
          <SidebarItem to="/dashboard" icon={<FaHome />} label="Dashboard" active={location.pathname === '/dashboard'} />
          <SidebarItem to="/users" icon={<FaUsers />} label="Users" active={location.pathname === '/users'} />
          <SidebarItem to="/bookings" icon={<FaCalendarCheck />} label="Bookings" active={location.pathname === '/bookings'} />
          <SidebarItem to="/settings" icon={<FaCog />} label="Settings" active={location.pathname === '/settings'} />
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            color: 'var(--danger)',
            padding: '12px 16px',
            background: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          <FaSignOutAlt style={{ marginRight: '12px' }} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-col" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          height: '64px', 
          background: 'white', 
          borderBottom: '1px solid var(--border)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              SA
            </div>
            <span style={{ fontWeight: '500', fontSize: '14px' }}>Super Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
