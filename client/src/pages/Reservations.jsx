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
  Users,
  Phone,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { mockReservations, mockTables } from "../lib/mock-data";

export default function ReservationsPage() {
  const location = useLocation();
  const [reservations, setReservations] = useState(mockReservations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    tableId: "",
    guestName: "",
    guestPhone: "",
    guests: 2,
    reservedAt: "",
    durationMin: 120,
  });

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

  const updateStatus = (id, status) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const addReservation = () => {
    if (!newReservation.tableId || !newReservation.guestName || !newReservation.reservedAt) {
      alert("Please fill all required fields");
      return;
    }

    const reservedAt = new Date(newReservation.reservedAt);
    const reservedUntil = new Date(reservedAt.getTime() + newReservation.durationMin * 60000);

    const reservation = {
      id: (reservations.length + 1).toString(),
      ...newReservation,
      reservedAt,
      reservedUntil,
      status: "ACTIVE",
    };

    setReservations([...reservations, reservation]);
    setIsDialogOpen(false);
    setNewReservation({
      tableId: "",
      guestName: "",
      guestPhone: "",
      guests: 2,
      reservedAt: "",
      durationMin: 120,
    });
    alert("Reservation created successfully!");
  };

  const formatDateTime = (date) => {
    if (!date) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const activeReservations = reservations.filter((r) => r.status === "ACTIVE");
  const today = new Date().toDateString();
  const upcomingToday = activeReservations.filter(
    (r) => new Date(r.reservedAt).toDateString() === today
  );

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
            <p className="text-gray-600 mt-1">Manage table reservations</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Reservation
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeReservations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingToday.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeReservations.reduce((sum, r) => sum + r.guests, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* New Reservation Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Reservation</h2>
              <p className="text-gray-600 mb-6">Add a new table reservation</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={newReservation.guestName}
                    onChange={(e) => setNewReservation({ ...newReservation, guestName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1-555-0123"
                    value={newReservation.guestPhone}
                    onChange={(e) => setNewReservation({ ...newReservation, guestPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={newReservation.guests}
                      onChange={(e) => setNewReservation({ ...newReservation, guests: Number(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table *</label>
                    <select
                      value={newReservation.tableId}
                      onChange={(e) => setNewReservation({ ...newReservation, tableId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select table</option>
                      {mockTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name} ({table.seats} seats)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newReservation.reservedAt}
                    onChange={(e) => setNewReservation({ ...newReservation, reservedAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <select
                    value={newReservation.durationMin}
                    onChange={(e) => setNewReservation({ ...newReservation, durationMin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                    <option value="180">180 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addReservation}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Create Reservation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Reservations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Reservations</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and track table reservations</p>
          </div>
          <div className="p-6 space-y-4">
            {reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reservations yet</p>
            ) : (
              reservations.map((reservation) => {
                const table = mockTables.find((t) => t.id === reservation.tableId);

                // Safe table number extraction
                const tableNumber = table && table.name ? table.name.split(" ")[1] || "?" : "?";

                return (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                        {tableNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{reservation.guestName}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {reservation.guests} guests
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(reservation.reservedAt)}
                          </span>
                          {reservation.guestPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {reservation.guestPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          reservation.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : reservation.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-700"
                            : reservation.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {reservation.status}
                      </span>

                      {reservation.status === "ACTIVE" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(reservation.id, "COMPLETED")}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(reservation.id, "CANCELLED")}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}