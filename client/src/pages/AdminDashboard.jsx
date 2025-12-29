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
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { mockTables, mockMenuItems, mockOrders } from "../lib/mock-data";

export default function AdminDashboard() {
  const location = useLocation();

  // Use mock data directly
  const [tables] = useState(mockTables);
  const [menuItems] = useState(mockMenuItems);
  const [orders] = useState(mockOrders);
  const [revenue] = useState(43.61); // From your mock bill

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

  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const availableMenuItems = menuItems.filter((m) => m.isAvailable !== false).length;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${revenue.toFixed(2)}`,
      desc: "Today's earnings",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Occupied Tables",
      value: `${occupiedTables}/${tables.length}`,
      desc: "Currently serving",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Active Orders",
      value: orders.length.toString(),
      desc: `${pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-red-600",
    },
    {
      title: "Menu Items",
      value: menuItems.length.toString(),
      desc: `${availableMenuItems} available`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ];

  const getTableColor = (status) => {
    const colors = {
      AVAILABLE: "bg-green-100 border-green-400",
      OCCUPIED: "bg-red-100 border-red-400",
      RESERVED: "bg-yellow-100 border-yellow-400",
      NEEDS_CLEANING: "bg-gray-100 border-gray-300",
    };
    return colors[status] || "bg-gray-100 border-gray-300";
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
            {menuItemsList.map((item) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin User</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders & Table Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-600 mt-1">Latest orders from your restaurant</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                        {order.tableNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Table {order.tableNumber}</p>
                        <p className="text-sm text-gray-600">Guest</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Table Status</h2>
              <p className="text-sm text-gray-600 mt-1">Current status of all tables</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-8">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`p-6 rounded-xl border-2 text-center transition hover:scale-105 ${getTableColor(table.status)}`}
                  >
                    <p className="text-2xl font-bold text-gray-900">
                      {table.tableNumber}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{table.seats} seats</p>
                  </div>
                ))}
              </div>

              {/* Legend - exactly as in your screenshot */}
              <div className="flex justify-center items-center gap-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-600">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-600">Reserved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}