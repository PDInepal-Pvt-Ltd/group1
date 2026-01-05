import { useEffect, useState } from "react";
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Eye,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchKdsQueue,
  transitionOrderStatus,
  clearKdsTimeline,
  fetchOrderTimeline,
  fetchKdsPerformance,
} from "@/store/kdsSlice";
import { fetchTables } from "@/store/tableSlice";
import { fetchMenuItems } from "@/store/menuItemSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";

const statusTransitions = {
  PENDING: ["PREPARING"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED"],
  SERVED: ["COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

export default function KitchenPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { queue, orderTimeline, performance, loading, error } = useSelector((state) => state.kds);
  const { tables } = useSelector((state) => state.table);
  const { items } = useSelector((state) => state.menuItem);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchKdsQueue());
    dispatch(fetchTables());
    dispatch(fetchMenuItems());
    dispatch(fetchKdsPerformance());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      dispatch(clearKdsTimeline());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedOrderId) {
      dispatch(fetchOrderTimeline(selectedOrderId));
    }
  }, [selectedOrderId, dispatch]);

  const getTimeElapsed = (orderTimeStr) => {
    const orderTime = new Date(orderTimeStr);
    if (isNaN(orderTime.getTime())) {
      return 0;
    }
    const diff = Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000 / 60);
    return Math.max(diff, 0);
  };

  const activeOrders = queue.filter((o) => o.status !== "SERVED" && o.status !== "CANCELLED" && o.status !== "COMPLETED");
  const pendingOrders = activeOrders.filter((o) => o.status === "PENDING");
  const preparingOrders = activeOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = activeOrders.filter((o) => o.status === "READY");

  const openStatusChangeModal = (order, status) => {
    if (!statusTransitions[order.status].includes(status)) {
      alert("Invalid status transition");
      return;
    }
    setSelectedOrder(order);
    setTargetStatus(status);
    setNotes("");
    setModalOpen(true);
  };

  const handleStatusTransition = () => {
    if (selectedOrder) {
      if (!statusTransitions[selectedOrder.status].includes(targetStatus)) {
        alert("Invalid status transition");
        setModalOpen(false);
        setSelectedOrder(null);
        return;
      }
      const lastEvent = selectedOrder.kdsEvents?.[0];
      const lastTime = lastEvent ? new Date(lastEvent.timestamp) : new Date(selectedOrder.createdAt);
      const minutesSpent = Math.floor((currentTime.getTime() - lastTime.getTime()) / 60000);
      dispatch(
        transitionOrderStatus({
          orderId: selectedOrder.id,
          status: targetStatus,
          notes,
          minutesSpent: minutesSpent > 0 ? minutesSpent : null,
        })
      );
      setModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const viewTimeline = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const closeTimeline = () => {
    setSelectedOrderId(null);
    dispatch(clearKdsTimeline());
  };

  let averagePrepTime = 0;
  let totalCompleted = 0;
  let longestPrepTime = 0;
  let efficiencyByActor = [];

  if (performance && performance.length > 0) {
    performance.forEach((stat) => {
      const avg = stat._avg.minutesSpent || 0;
      const count = stat._count.id || 0;
      const max = stat._max.minutesSpent || 0;

      totalCompleted += count;
      averagePrepTime += avg * count;
      if (max > longestPrepTime) longestPrepTime = max;

      efficiencyByActor.push({
        actorId: stat.actorId,
        avgMinutes: avg.toFixed(2),
        count,
      });
    });

    if (totalCompleted > 0) {
      averagePrepTime = (averagePrepTime / totalCompleted).toFixed(2);
    } else {
      averagePrepTime = 0;
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading Kitchen Queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-8 h-8" />
              Kitchen Display System
            </h1>
            <p className="text-gray-600 mt-1">{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        {performance && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <BarChart2 className="w-6 h-6" />
              KDS Performance
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Prep Time</p>
                <p className="text-xl font-bold">
                  {averagePrepTime} mins
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders Completed</p>
                <p className="text-xl font-bold">
                  {totalCompleted}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Longest Prep Time</p>
                <p className="text-xl font-bold">
                  {longestPrepTime || "—"} mins
                </p>
              </div>
            </div>

            {/* Per-Actor Stats */}
            {efficiencyByActor.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Efficiency by Actor</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {efficiencyByActor.map((actor) => (
                    <div key={actor.actorId} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Actor: {actor.actorId}</p>
                      <p className="text-sm text-gray-600">
                        Avg Minutes: {actor.avgMinutes}
                      </p>
                      <p className="text-sm text-gray-600">
                        Orders: {actor.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  PENDING
                </span>
                <span className="text-sm text-gray-600">{pendingOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`bg-white rounded-xl shadow-sm border-2 ${
                            isUrgent ? "border-red-500" : "border-gray-200"
                          } p-6`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{table?.name || "Unknown Table"}</p>
                                <p className="text-sm text-gray-600">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-1 ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">{timeElapsed}m</span>
                              </div>
                              {isUrgent && (
                                <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => {
                              const menuItem = items.find((m) => m.id === item.menuItemId);
                              return (
                                <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                      {item.qty}
                                    </div>
                                    <p className="font-medium text-gray-900">{menuItem?.name || "Unknown Item"}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openStatusChangeModal(order, "PREPARING")}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                              Start Preparing
                            </button>
                            <button
                              onClick={() => viewTimeline(order.id)}
                              className="py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2 px-4"
                            >
                              <Eye className="w-4 h-4" />
                              Timeline
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          )}
          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  PREPARING
                </span>
                <span className="text-sm text-gray-600">{preparingOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {preparingOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`bg-white rounded-xl shadow-sm border-2 ${
                            isUrgent ? "border-red-500" : "border-gray-200"
                          } p-6`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{table?.name || "Unknown Table"}</p>
                                <p className="text-sm text-gray-600">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-1 ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">{timeElapsed}m</span>
                              </div>
                              {isUrgent && (
                                <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {item.qty}
                                  </div>
                                  <p className="font-medium text-gray-900">
                                    {items.find((m) => m.id === item.menuItemId)?.name || "Unknown"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openStatusChangeModal(order, "READY")}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Ready
                            </button>
                            <button
                              onClick={() => openStatusChangeModal(order, "CANCELLED")}
                              className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => viewTimeline(order.id)}
                              className="py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2 px-4"
                            >
                              <Eye className="w-4 h-4" />
                              Timeline
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          )}
          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  READY
                </span>
                <span className="text-sm text-gray-600">{readyOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {readyOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`bg-white rounded-xl shadow-sm border-2 ${
                            isUrgent ? "border-red-500" : "border-gray-200"
                          } p-6`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{table?.name || "Unknown Table"}</p>
                                <p className="text-sm text-gray-600">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-1 ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">{timeElapsed}m</span>
                              </div>
                              {isUrgent && (
                                <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {item.qty}
                                  </div>
                                  <p className="font-medium text-gray-900">
                                    {items.find((m) => m.id === item.menuItemId)?.name || "Unknown"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openStatusChangeModal(order, "SERVED")}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                              Mark Served
                            </button>
                            <button
                              onClick={() => viewTimeline(order.id)}
                              className="py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2 px-4"
                            >
                              <Eye className="w-4 h-4" />
                              Timeline
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          )}
          {/* No Active Orders */}
          {activeOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <ChefHat className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-2xl font-semibold text-gray-900 mb-2">No active orders</p>
              <p className="text-gray-600">New orders will appear here</p>
            </div>
          )}
        </div>

        {/* Status Change Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Change Status to {targetStatus}</h3>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Add notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleStatusTransition}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {selectedOrderId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-h-96 overflow-auto">
              <h3 className="text-xl font-bold mb-4">Order Timeline</h3>
              {orderTimeline.length > 0 ? (
                <ul className="space-y-2">
                  {orderTimeline.map((event) => (
                    <li key={event.id} className="p-2 bg-gray-50 rounded-lg">
                      <p className="font-medium">{event.status} at {new Date(event.timestamp).toLocaleString()}</p>
                      {event.minutesSpent && <p className="text-sm text-gray-600">Minutes Spent: {event.minutesSpent}</p>}
                      {event.notes && <p className="text-sm text-gray-600">Notes: {event.notes}</p>}
                      <p className="text-sm text-gray-600">By Actor: {event.actorId}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No timeline events found.</p>
              )}
              <button
                onClick={closeTimeline}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}