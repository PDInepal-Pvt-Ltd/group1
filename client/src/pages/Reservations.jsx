import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchReservations, createReservation, updateReservation } from "@/store/reservationSlice"
import { fetchTables } from "@/store/tableSlice"
import { useDispatch, useSelector } from "react-redux"
import { Calendar, Clock, Users, Phone, Plus, X, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReservationsPage() {
  const dispatch = useDispatch()

  const { reservations } = useSelector((state) => state.reservation)
  const { tables } = useSelector((state) => state.table)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newReservation, setNewReservation] = useState({
    tableId: "",
    guestName: "",
    guestPhone: "",
    guests: 2,
    reservedAt: "",
    durationMin: 120,
  })

  const updateStatus = (id, status) => {
    dispatch(updateReservation({ id, status }))
    dispatch(fetchReservations())
  }

  useEffect(() => {
    dispatch(fetchReservations())
    dispatch(fetchTables())
  }, [dispatch])

  const addReservation = async () => {
    if (!newReservation.tableId || !newReservation.guestName || !newReservation.reservedAt) {
      return
    }

    const reservedAt = new Date(newReservation.reservedAt)
    const reservedUntil = new Date(reservedAt.getTime() + newReservation.durationMin * 60000)

    const reservation = {
      id: (reservations.length + 1).toString(),
      ...newReservation,
      reservedAt,
      reservedUntil,
      status: "ACTIVE",
    }

    dispatch(createReservation(reservation))

    setIsAddDialogOpen(false)
    setNewReservation({
      tableId: "",
      guestName: "",
      guestPhone: "",
      guests: 2,
      reservedAt: "",
      durationMin: 120,
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-chart-2/10 text-chart-2 border-chart-2/30"
      case "COMPLETED":
        return "bg-chart-1/10 text-chart-1 border-chart-1/30"
      case "CANCELLED":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "NO_SHOW":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }
  const activeReservations = reservations.filter((r) => r.status === "ACTIVE")
  const upcomingToday = activeReservations.filter((r) => {
    const today = new Date()
    return r.reservedAt.toDateString() === today.toDateString()
  })

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
              <p className="text-muted-foreground mt-1">Manage table reservations</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Reservation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Reservation</DialogTitle>
                  <DialogDescription>Add a new table reservation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Guest Name</Label>
                    <Input
                      id="guestName"
                      placeholder="John Smith"
                      value={newReservation.guestName}
                      onChange={(e) => setNewReservation({ ...newReservation, guestName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestPhone">Phone Number</Label>
                    <Input
                      id="guestPhone"
                      placeholder="+1-555-0123"
                      value={newReservation.guestPhone}
                      onChange={(e) => setNewReservation({ ...newReservation, guestPhone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        value={newReservation.guests}
                        onChange={(e) =>
                          setNewReservation({ ...newReservation, guests: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="table">Table</Label>
                      <Select
                        value={newReservation.tableId}
                        onValueChange={(value) => setNewReservation({ ...newReservation, tableId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              {table.name} ({table.seats} seats)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={newReservation.reservedAt}
                      onChange={(e) => setNewReservation({ ...newReservation, reservedAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={newReservation.durationMin.toString()}
                      onValueChange={(value) =>
                        setNewReservation({ ...newReservation, durationMin: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                        <SelectItem value="180">180 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addReservation}>Create Reservation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground">{activeReservations.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-chart-2/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold text-foreground">{upcomingToday.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-chart-1/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                    <p className="text-2xl font-bold text-foreground">
                      {activeReservations.reduce((sum, r) => sum + r.guests, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-chart-3/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Reservations</CardTitle>
              <CardDescription>Manage and track table reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.map((reservation) => {
                  const table = mockTables.find((t) => t.id === reservation.tableId)
                  return (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          {table?.name.split(" ")[1]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{reservation.guestName}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {reservation.guests} guests
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(reservation.reservedAt)}
                            </span>
                            {reservation.guestPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {reservation.guestPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
                        {reservation.status === "ACTIVE" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(reservation.id, "COMPLETED")}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(reservation.id, "CANCELLED")}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
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
    </div>
  )
}