import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

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
import Unauthorized from './pages/Unauthorized';
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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes with allowedRoles */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "CASHIER", "WAITER", "KITCHEN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "WAITER"]}>
              <Tables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "CASHIER", "WAITER"]}>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "KITCHEN"]}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "CASHIER"]}>
              <BillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "WAITER"]}>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditlog"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addstaff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/managestaff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <HealthDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
