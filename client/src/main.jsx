import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Tables from './pages/Tables';
import MenuPage from './pages/Menu';
import POSPage from './pages/POS';
import BillsPage from './pages/Bills';
import ReservationsPage from './pages/Reservations';
import SettingsPage from './pages/Settings';
import KitchenPage from './pages/Kitchen';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/pos" element={<POSPage />} />    
        <Route path="/bills" element={<BillsPage />} />     
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);