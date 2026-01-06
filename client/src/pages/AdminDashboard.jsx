import { useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from "react-redux"
import { fetchTables } from "@/store/tableSlice"
import { fetchBills } from "@/store/billSlice"
import { fetchOrders } from "@/store/orderSlice"
import { fetchMenuItems } from "@/store/menuItemSlice"
import { DollarSign, Users, ShoppingCart, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { tables } = useSelector((state) => state.table)
  const { bills } = useSelector((state) => state.bill)
  const { orders } = useSelector((state) => state.order)
  const { items } = useSelector((state) => state.menuItem)

  const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.grandTotal), 0)
  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length
  const activeOrders = orders.filter((o) => o.status !== "SERVED").length

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      description: "Today's earnings",
      icon: DollarSign,
      color: "text-chart-2",
    },
    {
      title: "Occupied Tables",
      value: `${occupiedTables}/${tables.length}`,
      description: "Currently serving",
      icon: Users,
      color: "text-chart-1",
    },
    {
      title: "Active Orders",
      value: activeOrders.toString(),
      description: `${pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-chart-3",
    },
    {
      title: "Menu Items",
      value: items.length.toString(),
      description: `${ items.filter((m) => m.isAvailable).length} available`,
      icon: TrendingUp,
      color: "text-chart-4",
    },
  ]

  const recentOrders = orders.slice(0, 5)

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "PREPARING":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "READY":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "SERVED":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "PREPARING":
        return <AlertCircle className="h-4 w-4" />
      case "READY":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  useEffect(() => {
    dispatch(fetchTables())
    dispatch(fetchBills())
    dispatch(fetchOrders())
    dispatch(fetchMenuItems())
  }, [dispatch])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const table = tables.find((t) => t.id === order.tableId)
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {table?.name.split(" ")[1]}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{table?.name}</p>
                            <p className="text-xs text-muted-foreground">{order.placedBy}</p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Table Status</CardTitle>
                <CardDescription>Current status of all tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {tables.map((table) => {
                    const statusColors = {
                      AVAILABLE: "bg-chart-2/20 border-chart-2 text-chart-2",
                      OCCUPIED: "bg-chart-3/20 border-chart-3 text-chart-3",
                      RESERVED: "bg-chart-1/20 border-chart-1 text-chart-1",
                      NEEDS_CLEANING: "bg-muted border-border text-muted-foreground",
                    }
                    return (
                      <div
                        key={table.id}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105 ${statusColors[table.status]}`}
                      >
                        <span className="text-lg font-bold">{table.name.split(" ")[1]}</span>
                        <span className="text-xs mt-1">{table.seats} seats</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-2/60 border-2 border-chart-2" />
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-3/60 border-2 border-chart-3" />
                    <span className="text-xs text-muted-foreground">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-1/60 border-2 border-chart-1" />
                    <span className="text-xs text-muted-foreground">Reserved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}