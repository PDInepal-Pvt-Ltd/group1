import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const menuItemsList = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Tables", icon: TableIcon, path: "/tables" },
    { name: "Menu", icon: MenuIcon, path: "/menu" },
    { name: "POS", icon: ShoppingBag, path: "/pos" },
    { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
    { name: "Bills", icon: Receipt, path: "/bills" },
    { name: "Reservations", icon: Calendar, path: "/reservations" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
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
            {menuItemsList.map((item) => (
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure restaurant settings</p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Settings</h2>
          <p className="text-gray-600 mb-4">Settings page coming soon</p>
          <p className="text-gray-600">
            Configure tax rates, service charges, operating hours, and more.
          </p>
        </div>
      </div>
    </div>
  );
}