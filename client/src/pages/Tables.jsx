import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Table as TableIcon,
  Menu as MenuIcon,
  ShoppingBag,
  ChefHat,
  Receipt,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { mockTables } from "../lib/mock-data";

export default function TablesPage() {
  const location = useLocation();
  const [tables] = useState(mockTables);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Tables", icon: TableIcon, path: "/tables" },
    { name: "Menu", icon: MenuIcon, path: "/menu" },
    { name: "POS", icon: ShoppingBag, path: "/pos" },
    { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
    { name: "Bills", icon: Receipt, path: "/bills" },
    { name: "Reservations", icon: Calendar, path: "/reservations" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const statusCounts = {
    available: tables.filter(t => t.status === "AVAILABLE").length,
    occupied: tables.filter(t => t.status === "OCCUPIED").length,
    reserved: tables.filter(t => t.status === "RESERVED").length,
    needsCleaning: tables.filter(t => t.status === "NEEDS_CLEANING").length,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800 border-green-200";
      case "OCCUPIED": return "bg-red-100 text-red-800 border-red-200";
      case "RESERVED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "NEEDS_CLEANING": return "bg-gray-100 text-gray-700 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIcon = (status) => {
    switch (status) {
      case "AVAILABLE": return <Sparkles className="w-8 h-8 text-green-600" />;
      case "OCCUPIED": return <Users className="w-8 h-8 text-red-600" />;
      case "RESERVED": return <Clock className="w-8 h-8 text-yellow-600" />;
      case "NEEDS_CLEANING": return <AlertCircle className="w-8 h-8 text-gray-600" />;
      default: return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">RestaurantOS</h1>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`rounded-lg transition ${
                  location.pathname === item.path ? "bg-gray-800 font-medium" : "hover:bg-gray-800"
                }`}
              >
                <Link to={item.path} className="flex items-center gap-3 px-4 py-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-gray-400">ADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage restaurant tables</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusCounts.available}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusCounts.occupied}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Reserved</p>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusCounts.reserved}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Needs Cleaning</p>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusCounts.needsCleaning}</p>
          </div>
        </div>

        {/* All Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">All Tables</h2>
          <p className="text-sm text-gray-600 mb-6">Click on a table to manage its status and assignments</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`p-8 rounded-xl border-2 text-center cursor-pointer transition hover:scale-105 ${getStatusStyle(table.status)}`}
              >
                {getIcon(table.status)}
                <p className="text-2xl font-bold mt-4">Table {table.tableNumber}</p>
                <p className="text-sm text-gray-600 mt-1">{table.seats} seats</p>
                {table.assignedTo && (
                  <span className="inline-block mt-3 px-3 py-1 bg-white/80 rounded-full text-sm font-medium">
                    Sarah
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}