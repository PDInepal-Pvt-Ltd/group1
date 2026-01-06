import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch, useSelector } from "react-redux"
import { registerUser } from "@/store/authSlice"
import { UserPlus, ShieldCheck } from "lucide-react"

export default function AddStaff() {
    const Roles = {
        WAITER: "WAITER",
        CASHIER: "CASHIER",
        KITCHEN: "KITCHEN",
        ADMIN: "ADMIN",
    }
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.auth)
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "WAITER", 
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        await dispatch(registerUser({ ...formData, isActive: true })).unwrap()
        setFormData({
            name: "",
            email: "",
            password: "",
            role: Roles.WAITER,
        })
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                <Card className="w-full max-w-lg shadow-lg">
                    <CardHeader className="space-y-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Add Staff Member</CardTitle>
                                <CardDescription>Create a new account for your restaurant team</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">System Role</Label>
                                    <Select
                                        value={formData.role}
                                        // FIX: Properly type the value coming from Select
                                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="role" className="w-full">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Roles.WAITER}>Waiter</SelectItem>
                                            <SelectItem value={Roles.KITCHEN}>Kitchen</SelectItem>
                                            <SelectItem value={Roles.CASHIER}>Cashier</SelectItem>
                                            <SelectItem value={Roles.ADMIN}>Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Work Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="staff@restaurant.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Staff members should change this password after their first login.
                                </p>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <Button type="submit" className="w-full h-11" disabled={loading}>
                                    {loading ? "Registering..." : "Register Staff Member"}
                                </Button>
                                
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2 border rounded-md bg-muted/30">
                                    <ShieldCheck className="h-3 w-3" />
                                    Access is restricted based on the assigned role.
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}