import React from 'react';
import { SidebarToggle } from './Sidebar';

export default function Navbar({ onMenuClick, user }) {
  const name =
    user?.profile?.firstName || user?.email?.split('@')[0] || 'Admin';
  const initials = (name.slice(0, 2) || 'AD').toUpperCase();

  return (
    <header className="navbar">
      <SidebarToggle onClick={onMenuClick} />
      <div className="navbar-actions">
        <div className="navbar-user">
          <div className="navbar-avatar" aria-hidden>
            {initials}
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{name}</span>
            <span className="navbar-user-role">{user?.role ?? 'Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
