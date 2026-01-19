import React from 'react';
import { FaUsers, FaCalendarCheck, FaChartLine } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div style={{ 
      width: '48px', 
      height: '48px', 
      borderRadius: '12px', 
      background: color + '20', 
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
    </div>
  </div>
);

const DashboardHome = () => {
  return (
    <div className="flex-col gap-4">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Super Admin.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Users" value="1,245" icon={<FaUsers />} color="#6C63FF" />
        <StatCard title="Active Bookings" value="86" icon={<FaCalendarCheck />} color="#52C41A" />
        <StatCard title="Total Revenue" value="SAR 45.2k" icon={<FaChartLine />} color="#FFAD0F" />
      </div>

      <div className="card" style={{ marginTop: '32px', minHeight: '300px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>
      </div>
    </div>
  );
};

export default DashboardHome;
