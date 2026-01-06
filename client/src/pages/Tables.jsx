import { useState, useEffect } from "react";
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
  Users,
  CheckCircle,
  Hash,
} from "lucide-react";
import API from "../api/axios";

export default function TablesPage() {
  const location = useLocation();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Table Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: "",
    seats: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/api/table");
      const tablesData = response.data?.data || response.data || [];
      setTables(Array.isArray(tablesData) ? tablesData : []);
    } catch (err) {
      console.error("Error loading tables:", err);
      setError("Failed to load tables.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();

    if (!newTable.tableNumber || !newTable.seats) {
      setAddError("Please fill all fields");
      return;
    }

    setAddLoading(true);
    setAddError("");

    try {
      const payload = {
        tableNumber: parseInt(newTable.tableNumber),
        seats: parseInt(newTable.seats),
        status: "AVAILABLE",
        name: `Table ${newTable.tableNumber}`,  // Required by backend
        assignedTo: null  // Try null instead of empty string
      };

      console.log("Sending payload:", payload);

      const response = await API.post("/api/table", payload);

      console.log("Success response:", response.data);

      setNewTable({ tableNumber: "", seats: "" });
      setIsAddModalOpen(false);
      fetchTables();
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);

      let errorMsg = "Failed to add table";

      if (err.response?.data) {
        if (Array.isArray(err.response.data)) {
          errorMsg = err.response.data.map(e => e.message).join(", ");
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      }

      setAddError(errorMsg);
    } finally {
      setAddLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status || "AVAILABLE") {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-300";
      case "OCCUPIED":
        return "bg-red-100 text-red-800 border-red-300";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    return status === "AVAILABLE" || !status ? (
      <CheckCircle className="w-5 h-5" />
    ) : (
      <Users className="w-5 h-5" />
    );
  };

  const sidebarItems = [
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
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading tables...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTables}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            {sidebarItems.map((item) => (
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600 mt-1">View and manage all restaurant tables</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Table
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Tables</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{tables.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {tables.filter((t) => t.status === "AVAILABLE").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Occupied / Reserved</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {tables.filter((t) => t.status !== "AVAILABLE").length}
            </p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full py-12 text-lg">
              No tables yet. Click "Add Table" to create one.
            </p>
          ) : (
            tables.map((table, index) => (
              <div
                key={table.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Hash className="w-6 h-6 text-orange-500" />
                      Table {table.tableNumber || table.number || index + 1}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {table.seats || table.capacity || "?"} seats
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(table.status)}`}>
                    {getStatusIcon(table.status)}
                    <span>{table.status || "AVAILABLE"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Table</h2>

            {addError && (
              <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{addError}</p>
            )}

            <form onSubmit={handleAddTable} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTable.tableNumber}
                  onChange={(e) =>
                    setNewTable({ ...newTable, tableNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                  disabled={addLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.seats}
                  onChange={(e) =>
                    setNewTable({ ...newTable, seats: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                  disabled={addLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddError("");
                    setNewTable({ tableNumber: "", seats: "" });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 transition"
                >
                  {addLoading ? "Adding..." : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}