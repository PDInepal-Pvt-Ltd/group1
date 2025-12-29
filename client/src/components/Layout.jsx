import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Table,
  Menu,
  ShoppingBag,
  ChefHat,
  Receipt,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
  { name: "Tables", icon: Table, path: "/tables" },
  { name: "Menu", icon: Menu, path: "/menu" },
  { name: "POS", icon: ShoppingBag, path: "/pos" },
  { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
  { name: "Bills", icon: Receipt, path: "/bills" },
  { name: "Reservations", icon: Calendar, path: "/reservations" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Layout({ children }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/"; // full refresh to login
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Same on all pages */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">RestaurantOS</h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`rounded-lg transition ${
                  location.pathname === item.path
                    ? "bg-gray-800 font-medium"
                    : "hover:bg-gray-800"
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

        {/* User & Logout */}
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

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}