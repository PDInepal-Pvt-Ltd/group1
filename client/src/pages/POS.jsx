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
  Search,
  Plus,
  Minus,
  Trash2,
  Leaf,
  ShoppingCart,
  Send,
} from "lucide-react";
import { mockTables, mockMenuItems } from "../lib/mock-data";

export default function POSPage() {
  const location = useLocation();
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tables] = useState(mockTables);
  const [menuItems] = useState(mockMenuItems);

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

  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.id !== id));
    } else {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const filteredItems = menuItems.filter((item) => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      <div className="flex-1 flex">
        {/* Left: Menu Items */}
        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Point of Sale</h1>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Select table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.tableNumber} ({table.seats} seats)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {item.name}
                      {item.isVeg && <Leaf className="w-4 h-4 text-green-600" />}
                    </h3>
                    <p className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Current Order
            </h2>
            {selectedTable && (
              <p className="text-sm text-gray-600 mt-1">
                Table {tables.find((t) => t.id === selectedTable)?.tableNumber}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {item.name}
                          {item.isVeg && <Leaf className="w-4 h-4 text-green-600" />}
                        </p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="ml-auto font-bold text-gray-900">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={() => alert("Order placed!")}
                disabled={cart.length === 0 || !selectedTable}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}