import { useEffect, useState, useMemo } from "react"
import { Sidebar } from "@/components/Sidebar"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile } from "@/store/authSlice"
import { API } from "@/api/axios"
import toast from "react-hot-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2, Mail, Shield, Search, Filter } from "lucide-react"

export default function ManageStaff() {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  const Roles = {
        WAITER: "WAITER",
        CASHIER: "CASHIER",
        KITCHEN: "KITCHEN",
        ADMIN: "ADMIN",
    }
  const [staff, setStaff] = useState([])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  const fetchStaff = async () => {
    try {
      const response = await API.get("/user") 
      setStaff(response.data.data)
    } catch (error) {
      toast.error("Could not fetch staff list")
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // --- Memoized Filter Logic ---
  const filteredStaff = useMemo(() => {
    return staff.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, roleFilter]);

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setIsEditOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    const result = await dispatch(updateProfile({ id: selectedUser.id, data: selectedUser }))
    if (updateProfile.fulfilled.match(result)) {
      setIsEditOpen(false)
      fetchStaff()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return
    try {
      await API.delete(`/user/${id}`)
      toast.success("Staff member deleted")
      setStaff(staff.filter(u => u.id !== id))
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Staff</h1>
          <p className="text-muted-foreground mt-1">Search, filter, and edit employee permissions</p>
        </div>

        {/* --- Search and Filter Bar --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value={Roles.ADMIN}>Admin</SelectItem>
                <SelectItem value={Roles.CASHIER}>Cashier</SelectItem>
                <SelectItem value={Roles.WAITER}>Waiter</SelectItem>
                <SelectItem value={Roles.KITCHEN}>Kitchen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> 
              Team Directory ({filteredStaff.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        {user.name}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`h-2 w-2 rounded-full inline-block mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(user)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredStaff.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No staff found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Staff Dialog remains same */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
            {selectedUser && (
              <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedUser.role} onValueChange={(val) => setSelectedUser({...selectedUser, role: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Roles.ADMIN}>Admin</SelectItem>
                      <SelectItem value={Roles.CASHIER}>Cashier</SelectItem>
                      <SelectItem value={Roles.WAITER}>Waiter</SelectItem>
                      <SelectItem value={Roles.KITCHEN}>Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}