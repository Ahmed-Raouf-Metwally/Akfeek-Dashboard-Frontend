import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Protected Routes */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<div className="p-4">Users Page (Coming Soon)</div>} />
          <Route path="bookings" element={<div className="p-4">Bookings Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
