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
  FileText,
  CreditCard,
  Banknote,
  Check,
  Download,
} from "lucide-react";
import { mockOrders, mockTables, mockBills } from "../lib/mock-data";

export default function BillsPage() {
  const location = useLocation();
  const [bills, setBills] = useState(mockBills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [serviceCharge, setServiceCharge] = useState(2.0);
  const [taxPct, setTaxPct] = useState(13);
  const [paymentMode, setPaymentMode] = useState("CASH");

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

  const unbilledOrders = mockOrders.filter(
    (o) => !bills.find((b) => b.orderId === o.id) && o.status === "READY"
  );

  const generateBill = () => {
    if (!selectedOrder) {
      alert("Please select an order");
      return;
    }

    const order = mockOrders.find((o) => o.id === selectedOrder);
    if (!order) return;

    const subTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discountAmount =
      discountType === "PERCENTAGE"
        ? subTotal * (discountValue / 100)
        : discountValue;

    const afterDiscount = subTotal - discountAmount;
    const taxAmount = afterDiscount * (taxPct / 100);
    const grandTotal = afterDiscount + taxAmount + serviceCharge;

    const newBill = {
      id: (bills.length + 1).toString(),
      orderId: selectedOrder,
      generatedAt: new Date(),
      subTotal,
      discountValue,
      discountType,
      serviceCharge,
      taxPct,
      taxAmount,
      grandTotal,
      paymentMode,
      isPaid: false,
      paidAt: null,
    };

    setBills([...bills, newBill]);
    setIsDialogOpen(false);
    setSelectedOrder("");
    setDiscountValue(0);
    alert("Bill generated successfully!");
  };

  const markAsPaid = (billId) => {
    setBills(
      bills.map((b) =>
        b.id === billId ? { ...b, isPaid: true, paidAt: new Date() } : b
      )
    );
    alert("Bill marked as paid!");
  };

  const totalRevenue = bills
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const pendingBills = bills.filter((b) => !b.isPaid);

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
            <h1 className="text-3xl font-bold text-gray-900">Bills & Payments</h1>
            <p className="text-gray-600 mt-1">Manage billing and payments</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            Generate Bill
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBills.length}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Generate Bill Dialog (Simple Modal) */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Bill</h2>
              <p className="text-gray-600 mb-6">Create a new bill for an order</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Choose an order</option>
                    {unbilledOrders.map((order) => {
                      const table = mockTables.find((t) => t.id === order.tableId);
                      return (
                        <option key={order.id} value={order.id}>
                          {table?.name} - {order.placedBy}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={serviceCharge}
                      onChange={(e) => setServiceCharge(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPct}
                      onChange={(e) => setTaxPct(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="OTHER">Other</option>
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
                  onClick={generateBill}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Generate Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Bills List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Bills</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage all bills</p>
          </div>
          <div className="p-6 space-y-4">
            {bills.map((bill) => {
              const order = mockOrders.find((o) => o.id === bill.orderId);
              const table = mockTables.find((t) => t.id === order?.tableId);

              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {table?.name} - {order?.placedBy}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Bill #{bill.id}</span>
                        <span>{new Date(bill.generatedAt).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          {bill.paymentMode === "CASH" ? (
                            <Banknote className="w-4 h-4" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          {bill.paymentMode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${bill.grandTotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Subtotal: ${bill.subTotal.toFixed(2)} • Tax: ${bill.taxAmount.toFixed(2)}
                      </p>
                    </div>

                    {bill.isPaid ? (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Paid
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAsPaid(bill.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark Paid
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}