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
  Plus,
  Leaf,
  CheckCircle2,
  Tag,
  TrendingUp,  // ← Added this
} from "lucide-react";
import { mockMenuItems } from "../lib/mock-data";

export default function MenuPage() {
  const location = useLocation();
  const [menuItems] = useState(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState("All Items");

  const categories = ["All Items", "Appetizers", "Main Course", "Desserts", "Beverages"];

  const filteredItems = selectedCategory === "All Items" 
    ? menuItems 
    : menuItems.filter(item => item.category?.name === selectedCategory);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage restaurant menu items and categories</p>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{menuItems.filter(m => m.isAvailable).length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Vegetarian</p>
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{menuItems.filter(m => m.isVeg).length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <Tag className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">4</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {item.name}
                        {item.isVeg && <Leaf className="w-5 h-5 text-green-600" />}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        {item.category?.name || "Uncategorized"}  {/* ← Safe fallback */}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-gray-600 mt-3">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}