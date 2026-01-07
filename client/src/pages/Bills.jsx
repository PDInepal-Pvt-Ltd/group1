import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useSelector, useDispatch } from "react-redux"
import { Label } from "@/components/ui/label"
import { Receipt, CreditCard, Banknote, DollarSign, FileText, Check, Download, Eye } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createBill, fetchBills, payBill } from "@/store/billSlice"
import { fetchOrders } from "@/store/orderSlice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"

export default function BillsPage() {
    const dispatch = useDispatch()
    const { orders } = useSelector((state) => state.order)
    const { bills } = useSelector((state) => state.bill)
    const { tables } = useSelector((state) => state.table)
    const { items: menuItems } = useSelector((state) => state.menuItem)
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState("")
    const [selectedPdf, setSelectedPdf] = useState(null)
    const [billDetails, setBillDetails] = useState({
        discountValue: 0,
        discountType: "PERCENTAGE",
        serviceCharge: 2.0,
        taxPct: 13,
        paymentMode: "CASH",
    })
    const unbilledOrders = orders.filter((o) => !bills.find((b) => b.orderId === o.id) && o.status === "SERVED")

    useEffect(() => {
        dispatch(fetchBills())
        dispatch(fetchOrders())
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                dispatch(fetchBills())
                dispatch(fetchOrders())
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [dispatch])

    const generateBill = () => {
        if (!selectedOrder) {
            toast.error("Please select an order")
            return
        }
        const order = orders.find((o) => o.id === selectedOrder)
        if (!order) {
            toast.error("Order not found")
            return
        }
        const newBill = {
            orderId: selectedOrder,
            discountValue: billDetails.discountValue,
            discountType: billDetails.discountType,
            serviceCharge: billDetails.serviceCharge,
            taxPct: billDetails.taxPct,
            paymentMode: billDetails.paymentMode,
        }
        dispatch(createBill(newBill))
        setIsGenerateDialogOpen(false)
        setSelectedOrder("")
        toast.success("Bill has been generated")
    }

    const markAsPaid = (billId) => {
        dispatch(payBill(billId))
        toast.success("Bill has been marked as paid")
    }

    const handleDownload = (pdfUrl, billId) => {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `bill_${billId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const totalRevenue = bills.filter((b) => b.isPaid).reduce((sum, b) => sum + Number(b.grandTotal), 0)
    const pendingBills = bills.filter((b) => !b.isPaid)

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Bills & Payments</h1>
                            <p className="text-muted-foreground mt-1">Manage billing and payments</p>
                        </div>
                        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Generate Bill
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Generate Bill</DialogTitle>
                                    <DialogDescription>Create a new bill for an order</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Select Order</Label>
                                        <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unbilledOrders.map((order) => {
                                                    const table = tables.find((t) => t.id === order.tableId)
                                                    return (
                                                        <SelectItem key={order.id} value={order.id}>
                                                            {table?.name} - {order.placedBy || 'QR Order'}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedOrder && (
                                        <Card className="bg-muted/50">
                                            <CardHeader>
                                                <CardTitle className="text-base">Order Items</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {orders
                                                        .find((o) => o.id === selectedOrder)
                                                        ?.items.map((item) => {
                                                            const menuItem = menuItems.find((m) => m.id === item.menuItemId)
                                                            return (
                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                    <span className="text-foreground">
                                                                        {item.qty}x {menuItem?.name}
                                                                    </span>
                                                                    <span className="font-medium text-foreground">
                                                                        ${(item.qty * item.unitPrice).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Discount Type</Label>
                                            <Select
                                                value={billDetails.discountType}
                                                onValueChange={(value) => setBillDetails({ ...billDetails, discountType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Discount Value</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={billDetails.discountValue}
                                                onChange={(e) =>
                                                    setBillDetails({ ...billDetails, discountValue: Number.parseFloat(e.target.value) || 0 })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Service Charge ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={billDetails.serviceCharge}
                                                onChange={(e) =>
                                                    setBillDetails({ ...billDetails, serviceCharge: Number.parseFloat(e.target.value) || 0 })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tax (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={billDetails.taxPct}
                                                onChange={(e) =>
                                                    setBillDetails({ ...billDetails, taxPct: Number.parseFloat(e.target.value) || 0 })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Mode</Label>
                                        <Select
                                            value={billDetails.paymentMode}
                                            onValueChange={(value) => setBillDetails({ ...billDetails, paymentMode: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash</SelectItem>
                                                <SelectItem value="CARD">Card</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={generateBill}>Generate Bill</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-chart-2/60" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Pending Bills</p>
                                        <p className="text-2xl font-bold text-foreground">{pendingBills.length}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-chart-3/60" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Bills</p>
                                        <p className="text-2xl font-bold text-foreground">{bills.length}</p>
                                    </div>
                                    <Receipt className="h-8 w-8 text-chart-1/60" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>All Bills</CardTitle>
                            <CardDescription>View and manage all bills</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bills.map((bill) => {
                                    const order = orders.find((o) => o.id === bill.orderId)
                                    const table = tables.find((t) => t.id === order?.tableId)
                                    return (
                                        <div
                                            key={bill.id}
                                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Receipt className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {table?.name} - {order?.placedBy || 'QR Order'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                        <span>Bill #{bill.id.slice(0, 8)}...</span>
                                                        <span>{new Date(bill.generatedAt).toLocaleString()}</span>
                                                        <span className="flex items-center gap-1">
                                                            {bill.paymentMode === "CASH" ? (
                                                                <Banknote className="h-3 w-3" />
                                                            ) : (
                                                                <CreditCard className="h-3 w-3" />
                                                            )}
                                                            {bill.paymentMode}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-foreground">${bill.grandTotal}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Subtotal: ${bill.subTotal} • Tax: ${bill.taxAmount}
                                                    </p>
                                                </div>
                                                {bill.isPaid ? (
                                                    <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Paid
                                                    </Badge>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => markAsPaid(bill.id)}>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Mark Paid
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedPdf(bill.pdfUrl)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDownload(bill.pdfUrl, bill.id)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
                <DialogContent className="max-w-4xl h-[80vh] p-0">
                    <iframe src={selectedPdf} className="w-full h-full border-0" title="Bill PDF Preview" />
                </DialogContent>
            </Dialog>
        </div>
    )
}