import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingCart,
  Receipt,
  Calendar,
  ChefHat,
  Settings,
  LogOut,
  Logs,
  HeartPulseIcon,
  UserRoundPlus,
  UserCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "@/store/authSlice"

const navigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard, roles: ["ADMIN", "CASHIER", "WAITER", "KITCHEN"] },
  { name: "Tables", href: "/tables", icon: Users, roles: ["ADMIN", "WAITER"] },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed, roles: ["ADMIN"] },
  { name: "POS", href: "/pos", icon: ShoppingCart, roles: ["ADMIN", "CASHIER", "WAITER"] },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat, roles: ["ADMIN", "KITCHEN"] },
  { name: "Bills", href: "/bills", icon: Receipt, roles: ["ADMIN", "CASHIER"] },
  { name: "Reservations", href: "/reservations", icon: Calendar, roles: ["ADMIN", "WAITER"] },
  { name: "Audit Log", href: "/auditlog", icon: Logs, roles: ["ADMIN"] },
  { name: "Add Staff", href: "/addstaff", icon: UserRoundPlus, roles: ["ADMIN"] },
  { name: "Manage Staff", href: "/managestaff", icon: UserCog, roles: ["ADMIN"] },
  { name: "Health", href: "/health", icon: HeartPulseIcon, roles: ["ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const refreshToken = localStorage.getItem("refreshToken");

  const filteredNav = navigation.filter((item) => (user ? item.roles.includes(user.role) : false))

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <ChefHat className="h-8 w-8 text-sidebar-primary" />
        <span className="ml-2 text-xl font-bold text-sidebar-foreground">RestaurantOS</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
          </div>
        </div>
        <Button onClick={() => {dispatch(logoutUser(refreshToken)), navigate("/login")}} variant="outline" className="w-full justify-start gap-2 bg-transparent" size="sm">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}