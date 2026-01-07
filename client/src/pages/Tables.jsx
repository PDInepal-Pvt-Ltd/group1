import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockUsers } from "@/lib/mock-data"
import { Users, Clock, Sparkles, AlertCircle, QrCode, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchTables, fetchTable, assignWaiter, updateTableStatus, createTable, updateTable, deleteTable } from "@/store/tableSlice"
import { useDispatch, useSelector } from "react-redux"

export default function TablesPage() {
  const dispatch = useDispatch()
  const { tables } = useSelector((state) => state.table)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrTableId, setQrTableId] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSeats, setNewSeats] = useState("")

  useEffect(() => {
    dispatch(fetchTables())
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        dispatch(fetchTables())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleCreateTable = () => {
    if (!newName || !newSeats || isNaN(parseInt(newSeats))) {
      alert("Please enter valid name and seats")
      return
    }
    dispatch(createTable({ name: newName, seats: parseInt(newSeats) }))
    setCreateDialogOpen(false)
    setNewName("")
    setNewSeats("")
  }

  const handleUpdateTableStatus = (tableId, status) => {
    dispatch(updateTableStatus({ id: tableId, status }))
    dispatch(fetchTables())
  };

  const handleAssignWaiter = (tableId, waiterId) => {
    dispatch(assignWaiter({ id: tableId, userId: waiterId }))
    dispatch(fetchTables())
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-chart-2/10 text-chart-2 border-chart-2/30 hover:bg-chart-2/20"
      case "OCCUPIED":
        return "bg-chart-3/10 text-chart-3 border-chart-3/30 hover:bg-chart-3/20"
      case "RESERVED":
        return "bg-chart-1/10 text-chart-1 border-chart-1/30 hover:bg-chart-1/20"
      case "NEEDS_CLEANING":
        return "bg-muted text-muted-foreground border-border hover:bg-muted"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <Sparkles className="h-5 w-5" />
      case "OCCUPIED":
        return <Users className="h-5 w-5" />
      case "RESERVED":
        return <Clock className="h-5 w-5" />
      case "NEEDS_CLEANING":
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const waiters = mockUsers.filter((u) => u.role === "WAITER")

  const statusCounts = {
    AVAILABLE: tables.filter((t) => t.status === "AVAILABLE").length,
    OCCUPIED: tables.filter((t) => t.status === "OCCUPIED").length,
    RESERVED: tables.filter((t) => t.status === "RESERVED").length,
    NEEDS_CLEANING: tables.filter((t) => t.status === "NEEDS_CLEANING").length,
  }

  const getCustomerUrl = (tableId) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/customer/${tableId}`
    }
    return ""
  }

  const showQRCode = (tableId) => {
    setQrTableId(tableId)
    setQrDialogOpen(true)
  }

  const copyUrl = (tableId) => {
    const url = getCustomerUrl(tableId)
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage restaurant tables</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-chart-2">{statusCounts.AVAILABLE}</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-chart-2/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                    <p className="text-2xl font-bold text-chart-3">{statusCounts.OCCUPIED}</p>
                  </div>
                  <Users className="h-8 w-8 text-chart-3/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reserved</p>
                    <p className="text-2xl font-bold text-chart-1">{statusCounts.RESERVED}</p>
                  </div>
                  <Clock className="h-8 w-8 text-chart-1/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Needs Cleaning</p>
                    <p className="text-2xl font-bold text-muted-foreground">{statusCounts.NEEDS_CLEANING}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4">
            <Button onClick={() => setCreateDialogOpen(true)}>Create New Table</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Tables</CardTitle>
              <CardDescription>Click on a table to manage its status and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((table) => {
                  const assignedWaiter = waiters.find((w) => w.id === table.assignedTo)
                  const [editedName, setEditedName] = useState(table.name)
                  const [editedSeats, setEditedSeats] = useState(table.seats.toString())

                  const handleUpdateTable = () => {
                    if (!editedName || !editedSeats || isNaN(parseInt(editedSeats))) {
                      alert("Please enter valid name and seats")
                      return
                    }
                    dispatch(updateTable({ id: table.id, data: { name: editedName, seats: parseInt(editedSeats) } }))
                  }

                  const handleDeleteTable = () => {
                    if (confirm("Are you sure you want to delete this table?")) {
                      dispatch(deleteTable(table.id))
                    }
                  }

                  return (
                    <Dialog key={table.id}>
                      <DialogTrigger asChild>
                        <button
                          className={`relative p-6 rounded-lg border-2 transition-all hover:scale-105 ${getStatusColor(table.status)}`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {getStatusIcon(table.status)}
                            <span className="text-xl font-bold">{table.name}</span>
                            <span className="text-sm">{table.seats} seats</span>
                            {assignedWaiter && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                {assignedWaiter.name.split(" ")[0]}
                              </Badge>
                            )}
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{table.name}</DialogTitle>
                          <DialogDescription>Manage table status and assignments</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Table Name</Label>
                            <Input
                              id="name"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="seats">Capacity (seats)</Label>
                            <Input
                              id="seats"
                              type="number"
                              value={editedSeats}
                              onChange={(e) => setEditedSeats(e.target.value)}
                            />
                          </div>

                          <Button onClick={handleUpdateTable}>Save Changes</Button>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Current Status</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["AVAILABLE", "OCCUPIED", "RESERVED", "NEEDS_CLEANING"]).map(
                                (status) => (
                                  <Button
                                    key={status}
                                    variant={table.status === status ? "default" : "outline"}
                                    onClick={() => handleUpdateTableStatus(table.id, status)}
                                    className="justify-start"
                                  >
                                    {status.replace("_", " ")}
                                  </Button>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Waiter</label>
                            <Select
                              value={table.assignedTo || ""}
                              onValueChange={(value) => handleAssignWaiter(table.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a waiter" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {waiters.map((waiter) => (
                                  <SelectItem key={waiter.id} value={waiter.id}>
                                    {waiter.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 pt-4 border-t">
                            <label className="text-sm font-medium">Customer Ordering</label>
                            <div className="flex gap-2">
                              <Button onClick={() => showQRCode(table.id)} className="flex-1" variant="outline">
                                <QrCode className="mr-2 h-4 w-4" />
                                Show QR Code
                              </Button>
                              <Button onClick={() => copyUrl(table.id)} className="flex-1" variant="outline">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Copy Link
                              </Button>
                            </div>
                          </div>

                          <Button variant="destructive" onClick={handleDeleteTable}>Delete Table</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer Dashboard QR Code</DialogTitle>
            <DialogDescription>{tables.find((t) => t.id === qrTableId)?.name} - Full Experience</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(getCustomerUrl(qrTableId))}`}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan to access the customer dashboard with menu, orders, and assistance
            </p>
            <Button onClick={() => copyUrl(qrTableId)} className="w-full" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Copy Dashboard Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>Enter table details</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Table Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-seats">Capacity (seats)</Label>
              <Input
                id="new-seats"
                type="number"
                value={newSeats}
                onChange={(e) => setNewSeats(e.target.value)}
              />
            </div>

            <Button onClick={handleCreateTable}>Create Table</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}