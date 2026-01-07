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

    const queueInterval = setInterval(() => {
      dispatch(fetchKdsQueue());
    }, 100000); // Refresh queue every 10 seconds

    const performanceInterval = setInterval(() => {
      dispatch(fetchKdsPerformance());
    }, 300000); // Refresh performance every 30 seconds

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(performanceInterval);
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
      ).then(() => {
        dispatch(fetchKdsQueue());
        dispatch(fetchKdsPerformance());
      });
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

  if (performance) {
    averagePrepTime = performance.averagePrepTime || 0;
    totalCompleted = performance.totalCompleted || 0;
    longestPrepTime = performance.longestPrepTime || 0;
    efficiencyByActor = performance.efficiencyByActor || [];
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-xl font-semibold text-foreground">Loading Kitchen Queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-xl font-semibold text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-background to-muted/50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
              <ChefHat className="w-10 h-10 text-primary" />
              Kitchen Display System
            </h1>
            <p className="text-lg text-muted-foreground mt-2 italic">{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{activeOrders.length}</p>
              <p className="text-base text-muted-foreground font-medium">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{pendingOrders.length}</p>
              <p className="text-base text-muted-foreground font-medium">Pending</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Section */}
        {performance && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 bg-card rounded-2xl shadow-md border border-border/50 p-8 backdrop-blur-sm"
          >
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-6">
              <BarChart2 className="w-8 h-8 text-primary" />
              Performance Insights
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-base text-muted-foreground font-medium">Average Prep Time</p>
                <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  {averagePrepTime} mins
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-base text-muted-foreground font-medium">Total Orders Completed</p>
                <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  {totalCompleted}
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-base text-muted-foreground font-medium">Longest Prep Time</p>
                <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  {longestPrepTime || "—"} mins
                </p>
              </motion.div>
            </div>

            {/* Per-Actor Stats */}
            {efficiencyByActor.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-2xl mb-4 text-foreground">Team Efficiency</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {efficiencyByActor.map((actor, index) => (
                    <motion.div
                      key={actor.actorId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 bg-muted/50 rounded-2xl shadow-inner"
                    >
                      <p className="font-medium text-lg text-foreground">Actor: {actor.actorId}</p>
                      <p className="text-base text-muted-foreground">
                        Avg Time: {actor.avgMinutes} mins
                      </p>
                      <p className="text-base text-muted-foreground">
                        Orders: {actor.count}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="space-y-12">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-6 py-3 bg-muted text-muted-foreground rounded-full text-base font-semibold">
                  PENDING
                </span>
                <span className="text-base text-muted-foreground font-medium">{pendingOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pendingOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                      >
                        <div
                          className={`bg-card rounded-2xl shadow-lg border-2 ${
                            isUrgent ? "border-destructive animate-pulse" : "border-border/50"
                          } p-6 backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-xl text-foreground">{table?.name || "Unknown Table"}</p>
                                <p className="text-base text-muted-foreground">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-2 ${isUrgent ? "text-destructive" : "text-muted-foreground"} text-base font-semibold`}>
                                <Clock className="w-5 h-5" />
                                {timeElapsed} mins
                              </div>
                              {isUrgent && (
                                <span className="mt-2 inline-flex px-4 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full items-center gap-2 dark:bg-destructive/20">
                                  <AlertTriangle className="w-4 h-4" />
                                  Urgent Priority
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                              <p className="text-base font-medium text-muted-foreground">Special Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-4 mb-6">
                            {order.items.map((item) => {
                              const menuItem = items.find((m) => m.id === item.menuItemId);
                              const imageUrl = menuItem?.imageUrl?.replace(/<|>/g, '') || '';
                              return (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt={menuItem?.name}
                                      className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between">
                                    <p className="font-medium text-lg text-foreground">{menuItem?.name || "Unknown Item"}</p>
                                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-base">
                                      x{item.qty}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openStatusChangeModal(order, "PREPARING")}
                              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
                            >
                              Start Preparation
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => viewTimeline(order.id)}
                              className="py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-base hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 px-6"
                            >
                              <Eye className="w-5 h-5" />
                              View Timeline
                            </motion.button>
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
              <div className="flex items-center gap-3 mb-6">
                <span className="px-6 py-3 bg-amber-100 text-amber-700 rounded-full text-base font-semibold dark:bg-amber-900/50 dark:text-amber-300">
                  PREPARING
                </span>
                <span className="text-base text-muted-foreground font-medium">{preparingOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {preparingOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                      >
                        <div
                          className={`bg-card rounded-2xl shadow-lg border-2 ${
                            isUrgent ? "border-destructive animate-pulse" : "border-border/50"
                          } p-6 backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-xl text-foreground">{table?.name || "Unknown Table"}</p>
                                <p className="text-base text-muted-foreground">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-2 ${isUrgent ? "text-destructive" : "text-muted-foreground"} text-base font-semibold`}>
                                <Clock className="w-5 h-5" />
                                {timeElapsed} mins
                              </div>
                              {isUrgent && (
                                <span className="mt-2 inline-flex px-4 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full items-center gap-2 dark:bg-destructive/20">
                                  <AlertTriangle className="w-4 h-4" />
                                  Urgent Priority
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                              <p className="text-base font-medium text-muted-foreground">Special Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-4 mb-6">
                            {order.items.map((item) => {
                              const menuItem = items.find((m) => m.id === item.menuItemId);
                              const imageUrl = menuItem?.imageUrl?.replace(/<|>/g, '') || '';
                              return (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt={menuItem?.name}
                                      className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between">
                                    <p className="font-medium text-lg text-foreground">{menuItem?.name || "Unknown Item"}</p>
                                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-base">
                                      x{item.qty}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openStatusChangeModal(order, "READY")}
                              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-base hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              Mark as Ready
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openStatusChangeModal(order, "CANCELLED")}
                              className="py-3 bg-destructive text-destructive-foreground rounded-xl font-semibold text-base hover:bg-destructive/90 transition-colors px-6"
                            >
                              Cancel Order
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => viewTimeline(order.id)}
                              className="py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-base hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 px-6"
                            >
                              <Eye className="w-5 h-5" />
                              View Timeline
                            </motion.button>
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
              <div className="flex items-center gap-3 mb-6">
                <span className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full text-base font-semibold dark:bg-emerald-900/50 dark:text-emerald-300">
                  READY
                </span>
                <span className="text-base text-muted-foreground font-medium">{readyOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {readyOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                      >
                        <div
                          className={`bg-card rounded-2xl shadow-lg border-2 ${
                            isUrgent ? "border-destructive animate-pulse" : "border-border/50"
                          } p-6 backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {table ? table.name.split(" ")[1] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-xl text-foreground">{table?.name || "Unknown Table"}</p>
                                <p className="text-base text-muted-foreground">{order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-2 ${isUrgent ? "text-destructive" : "text-muted-foreground"} text-base font-semibold`}>
                                <Clock className="w-5 h-5" />
                                {timeElapsed} mins
                              </div>
                              {isUrgent && (
                                <span className="mt-2 inline-flex px-4 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full items-center gap-2 dark:bg-destructive/20">
                                  <AlertTriangle className="w-4 h-4" />
                                  Urgent Priority
                                </span>
                              )}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                              <p className="text-base font-medium text-muted-foreground">Special Note: {order.notes}</p>
                            </div>
                          )}
                          <div className="space-y-4 mb-6">
                            {order.items.map((item) => {
                              const menuItem = items.find((m) => m.id === item.menuItemId);
                              const imageUrl = menuItem?.imageUrl?.replace(/<|>/g, '') || '';
                              return (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt={menuItem?.name}
                                      className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between">
                                    <p className="font-medium text-lg text-foreground">{menuItem?.name || "Unknown Item"}</p>
                                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-base">
                                      x{item.qty}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openStatusChangeModal(order, "SERVED")}
                              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
                            >
                              Mark as Served
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => viewTimeline(order.id)}
                              className="py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-base hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 px-6"
                            >
                              <Eye className="w-5 h-5" />
                              View Timeline
                            </motion.button>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 bg-card rounded-2xl shadow-md border border-border/50"
            >
              <ChefHat className="w-24 h-24 text-primary mb-6" />
              <p className="text-3xl font-semibold text-foreground mb-3">Kitchen is Quiet</p>
              <p className="text-lg text-muted-foreground italic">Awaiting new culinary adventures...</p>
            </motion.div>
          )}
        </div>

        {/* Status Change Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl p-8 w-96 shadow-2xl border border-border/50"
              >
                <h3 className="text-2xl font-bold mb-6 text-foreground">Update Status to {targetStatus}</h3>
                <textarea
                  className="w-full p-4 border border-border rounded-xl mb-6 bg-background text-foreground resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add optional notes for the team..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStatusTransition}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
                  >
                    Confirm Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-base hover:bg-secondary/90 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Modal */}
        <AnimatePresence>
          {selectedOrderId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl p-8 w-96 max-h-[70vh] overflow-auto shadow-2xl border border-border/50"
              >
                <h3 className="text-2xl font-bold mb-6 text-foreground">Order Journey</h3>
                {orderTimeline.length > 0 ? (
                  <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
                    {orderTimeline.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative pl-12"
                      >
                        <div className="absolute left-0 top-2 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="font-medium text-lg text-foreground">
                            {event.status} · {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.minutesSpent && <p className="text-base text-muted-foreground">Time Spent: {event.minutesSpent} mins</p>}
                          {event.notes && <p className="text-base text-muted-foreground italic">Notes: {event.notes}</p>}
                          <p className="text-base text-muted-foreground">Handled by: {event.actorId}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-foreground italic">No journey events recorded yet.</p>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeTimeline}
                  className="mt-8 w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
                >
                  Close Journey
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}