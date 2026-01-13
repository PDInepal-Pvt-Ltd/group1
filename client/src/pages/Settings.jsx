import { Sidebar } from "@/components/Sidebar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Settings as SettingsIcon, 
  User, 
  Save,
  Moon,
  Eye,
  EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ModeToggle"
import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile } from "@/store/authSlice"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)

  // Profile form state (based on User model: name, email, password)
  const [name, setName] = React.useState(user?.name || "")
  const [email, setEmail] = React.useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const data = { name, email, isActive: user?.isActive, role: user?.role }
    if (password) {
      if (!currentPassword) {
        toast.error("Please enter your current password to change it")
        return
      }
      if (password !== confirmPassword) {
        toast.error("New passwords do not match")
        return
      }
      data.currentPassword = currentPassword
      data.password = password // Only include if provided (app logic should hash)
    }
    try {
      await dispatch(updateProfile({ id: user.id, data })).unwrap()
      setCurrentPassword("")
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      // Error handled via toast in thunk
    }
  }

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your profile and system preferences.
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 h-12 shadow-sm">
              <TabsTrigger value="profile" className="gap-2 px-4">
                <User className="h-4 w-4"/> Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 px-4">
                <Moon className="h-4 w-4"/> Appearance
              </TabsTrigger>
            </TabsList>

            {/* PROFILE SETTINGS */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information. Role and status are managed by admins.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="current-password" 
                          type={showCurrent ? "text" : "password"} 
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)} 
                          placeholder="Required if changing password" 
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrent(!showCurrent)}
                        >
                          {showCurrent ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showNew ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Leave blank to keep current" 
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNew(!showNew)}
                        >
                          {showNew ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password" 
                          type={showConfirm ? "text" : "password"} 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="Confirm if changing password" 
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" /> Update Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* APPEARANCE SECTION */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Toggle between light and dark themes.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">System Theme</p>
                      <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                    </div>
                  </div>
                  <ModeToggle />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </div>
  )
}