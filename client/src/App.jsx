import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Tables from './pages/Tables';
import MenuPage from './pages/Menu';
import POSPage from './pages/POS';
import BillsPage from './pages/Bills';
import ReservationsPage from './pages/Reservations';
import SettingsPage from './pages/Settings';
import KitchenPage from './pages/Kitchen';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import AddStaff from './pages/AddStaff';
import ManageStaff from './pages/Staff';
import HealthDashboard from './pages/Health';
import AuditLogPage from './pages/AuditLogs';
import { updateThemeClass } from './store/themeSlice';
function App() {
  const savedTheme = localStorage.getItem("ui-theme") || "system";
updateThemeClass(savedTheme);
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/auditlog" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
        <Route path="/addstaff" element={<ProtectedRoute><AddStaff /></ProtectedRoute>} />
        <Route path="/managestaff" element={<ProtectedRoute><ManageStaff /></ProtectedRoute>} />
        <Route path="/health" element={<ProtectedRoute><HealthDashboard /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;