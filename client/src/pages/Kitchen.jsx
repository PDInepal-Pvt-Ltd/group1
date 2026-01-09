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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const statusTransitions = {
  PENDING: ["PREPARING"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED"],
  SERVED: ["COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

function KdsOrderCard({
  order,
  table,
  items,
  status,
  timeElapsed,
  isUrgent,
  onPrimaryAction,
  onSecondaryAction,
  onViewTimeline,
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="will-change-transform min-w-0"
    >
      <Card
        className={`
          border border-border/60 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-visible rounded-xl
          ${isUrgent ? "ring-2 ring-destructive/40 shadow-[0_0_20px_rgba(220,38,38,0.25)]" : ""}
        `}
      >
        {/* Header */}
        <CardHeader className="pb-3 sm:pb-4 md:pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-base sm:text-lg md:text-xl">
                {table ? table.name.split(" ")[1] : "?"}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                  {table?.name || "Unknown Table"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base truncate">
                  {order.placedBy || (order.isQrOrder ? "QR Order" : "Unknown")}
                </CardDescription>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base font-semibold ${isUrgent ? "text-destructive" : "text-muted-foreground"
                  }`}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                {timeElapsed} mins
              </div>
              {isUrgent && (
                <Badge variant="destructive" className="mt-1 sm:mt-1 md:mt-2 text-xs">
                  <AlertTriangle className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1" />
                  Urgent Priority
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
          {order.notes && (
            <div className="p-2 sm:p-3 md:p-4 bg-muted/50 rounded-xl text-xs sm:text-sm md:text-base text-muted-foreground break-words">
              <strong>Special Note:</strong> {order.notes}
            </div>
          )}

          {Array.isArray(order.items) && order.items.map((item) => {
            const menuItem =
              item.menuItem ||
              items.find((m) => m.id === item.menuItemId);

            const imageUrl = menuItem?.imageUrl?.replace(/<|>/g, "");

            return (
              <div
                key={item.id}
                className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-muted/50 rounded-xl"
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={menuItem?.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm flex-shrink-0"
                  />
                )}

                <div className="flex-1 flex justify-between items-center min-w-0">
                  <span className="font-medium text-sm sm:text-base md:text-lg truncate">
                    {menuItem?.name || "Unknown Item"}
                  </span>
                  <span className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-bold flex-shrink-0">
                    x{item.qty}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col gap-2 border-t bg-muted/30 backdrop-blur-sm p-3 sm:p-4 md:p-6">
          <Button
            onClick={onPrimaryAction}
            className={`w-full transition-transform active:scale-95 text-xs sm:text-sm md:text-base ${status === "PREPARING" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
          >
            {status === "PENDING" && "Start Preparation"}
            {status === "PREPARING" && (
              <>
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                Mark as Ready
              </>
            )}
            {status === "READY" && "Mark as Served"}
          </Button>

          {onSecondaryAction && (
            <Button
              variant="destructive"
              onClick={onSecondaryAction}
              className="w-full text-xs sm:text-sm md:text-base transition-transform active:scale-95"
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onViewTimeline}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base transition-transform active:scale-95"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            View Timeline
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

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
    }, 1000000); // Refresh queue every 10 seconds

    const performanceInterval = setInterval(() => {
      dispatch(fetchKdsPerformance());
    }, 3000000); // Refresh performance every 30 seconds

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
    <div className="flex h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-2 sm:gap-3 tracking-tight">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              Kitchen Display System
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1 sm:mt-2 italic">{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-4 sm:gap-6 md:gap-12">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{activeOrders.length}</p>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{pendingOrders.length}</p>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Pending</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Section */}
        {performance && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 md:mb-8 bg-card rounded-2xl shadow-md border border-border/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
              Performance Insights
            </h2>

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
              <motion.div whileHover={{ scale: 1.05 }} className="p-3 sm:p-4 md:p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Average Prep Time</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                  {averagePrepTime} mins
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-3 sm:p-4 md:p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Total Orders Completed</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                  {totalCompleted}
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-3 sm:p-4 md:p-6 bg-muted/50 rounded-2xl shadow-inner">
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Longest Prep Time</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                  {longestPrepTime || "—"} mins
                </p>
              </motion.div>
            </div>

            {/* Per-Actor Stats */}
            {efficiencyByActor.length > 0 && (
              <div className="mt-4 sm:mt-6 md:mt-8">
                <h3 className="font-semibold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 md:mb-4 text-foreground">Team Efficiency</h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {efficiencyByActor.map((actor, index) => (
                    <motion.div
                      key={actor.actorId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-3 sm:p-4 bg-muted/50 rounded-2xl shadow-inner"
                    >
                      <p className="font-medium text-sm sm:text-base md:text-lg text-foreground">Actor: {actor.actorId}</p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Avg Time: {actor.avgMinutes} mins
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Orders: {actor.count}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="space-y-6 sm:space-y-8 md:space-y-12">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <span className="px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-muted text-muted-foreground rounded-full text-xs sm:text-sm md:text-base font-semibold">
                  PENDING
                </span>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">{pendingOrders.length} orders</span>
              </div>
              <AnimatePresence>
                <div className="
  grid
  gap-6 sm:gap-8
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
">

                  {pendingOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const timeElapsed = getTimeElapsed(order.createdAt);
                    const isUrgent = timeElapsed > 15;
                    return (
                      <KdsOrderCard
                        key={order.id}
                        order={order}
                        table={table}
                        items={items}
                        status={order.status}
                        timeElapsed={timeElapsed}
                        isUrgent={isUrgent}
                        onPrimaryAction={() => openStatusChangeModal(order, "PREPARING")}
                        onViewTimeline={() => viewTimeline(order.id)}
                      />
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          )}
          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <span className="px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm md:text-base font-semibold dark:bg-amber-900/50 dark:text-amber-300">
                  PREPARING
                </span>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">{preparingOrders.length} orders</span>
              </div>
              <AnimatePresence><div className="
  grid
  gap-6 sm:gap-8
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
">

                {preparingOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const timeElapsed = getTimeElapsed(order.createdAt);
                  const isUrgent = timeElapsed > 15;
                  return (
                    <KdsOrderCard
                      key={order.id}
                      order={order}
                      table={table}
                      items={items}
                      status={order.status}
                      timeElapsed={timeElapsed}
                      isUrgent={isUrgent}
                      onPrimaryAction={() => openStatusChangeModal(order, "READY")}
                      onSecondaryAction={() => openStatusChangeModal(order, "CANCELLED")}
                      onViewTimeline={() => viewTimeline(order.id)}
                    />
                  );
                })}
              </div>
              </AnimatePresence>
            </div>
          )}
          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <span className="px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm md:text-base font-semibold dark:bg-emerald-900/50 dark:text-emerald-300">
                  READY
                </span>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">{readyOrders.length} orders</span>
              </div>
              <AnimatePresence><div className="
  grid
  gap-6 sm:gap-8
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
">

                {readyOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const timeElapsed = getTimeElapsed(order.createdAt);
                  const isUrgent = timeElapsed > 15;
                  return (
                    <KdsOrderCard
                      key={order.id}
                      order={order}
                      table={table}
                      items={items}
                      status={order.status}
                      timeElapsed={timeElapsed}
                      isUrgent={isUrgent}
                      onPrimaryAction={() => openStatusChangeModal(order, "SERVED")}
                      onViewTimeline={() => viewTimeline(order.id)}
                    />
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
              className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 bg-card rounded-2xl shadow-md border border-border/50"
            >
              <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary mb-3 sm:mb-4 md:mb-6" />
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-2 sm:mb-2 md:mb-3">Kitchen is Quiet</p>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground italic">Awaiting new culinary adventures...</p>
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
                className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 w-[90%] sm:w-full max-w-md md:w-96 shadow-2xl border border-border/50"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-foreground">Update Status to {targetStatus}</h3>
                <Textarea
                  className="w-full mb-3 sm:mb-4 md:mb-6 resize-none h-20 sm:h-24 md:h-32"
                  placeholder="Add optional notes for the team..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex flex-col gap-2 sm:gap-3">
                  <Button
                    onClick={handleStatusTransition}
                    className="w-full text-xs sm:text-sm md:text-base transition-transform active:scale-95"
                  >
                    Confirm Update
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                    className="w-full text-xs sm:text-sm md:text-base transition-transform active:scale-95"
                  >
                    Cancel
                  </Button>
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
                className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 w-[90%] sm:w-full max-w-md md:w-96 max-h-[70vh] overflow-auto shadow-2xl border border-border/50"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-foreground">Order Journey</h3>
                {orderTimeline.length > 0 ? (
                  <div className="relative space-y-3 sm:space-y-4 md:space-y-6 before:absolute before:left-2 sm:before:left-3 md:before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
                    {orderTimeline.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative pl-8 sm:pl-10 md:pl-12"
                      >
                        <div className="absolute left-0 top-1 sm:top-1 md:top-2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-primary rounded-full"></div>
                        </div>
                        <div className="p-2 sm:p-3 md:p-4 bg-muted/50 rounded-xl">
                          <p className="font-medium text-sm sm:text-base md:text-lg text-foreground break-words">
                            {event.status} · {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.minutesSpent && <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Time Spent: {event.minutesSpent} mins</p>}
                          {event.notes && <p className="text-xs sm:text-sm md:text-base text-muted-foreground italic break-words">Notes: {event.notes}</p>}
                          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Handled by: {event.actorId}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base md:text-lg text-foreground italic">No journey events recorded yet.</p>
                )}
                <Button
                  onClick={closeTimeline}
                  className="mt-4 sm:mt-6 md:mt-8 w-full text-xs sm:text-sm md:text-base transition-transform active:scale-95"
                >
                  Close Journey
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}