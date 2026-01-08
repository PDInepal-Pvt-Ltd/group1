import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, selectItem, updateMenuItemImage } from "@/store/menuItemSlice"
import { fetchCategories } from "@/store/categorySlice"
import { fetchDailySpecials, createSurplusMark, updateSurplusMark, deleteSurplusMark } from "@/store/surplusSlice"
import { useDispatch, useSelector } from "react-redux"
import { Switch } from "@/components/ui/switch"
import { Plus, Camera, Edit, Trash2, UtensilsCrossed, Leaf, Tag, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MenuPage() {
  const dispatch = useDispatch()
  const { items: menuItems, selectedItem } = useSelector((state) => state.menuItem)
  const categories = useSelector((state) => state.category.categories)
  const { marks: surplusMarks, dailySpecials } = useSelector((state) => state.surplus)
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFlashDialogOpen, setIsFlashDialogOpen] = useState(false)
  const [selectedMark, setSelectedMark] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    isVeg: false,
    isAvailable: true,
    menuImage: null
  })
  const [flashFormData, setFlashFormData] = useState({
    menuItemId: "",
    surplusAt: new Date().toISOString().slice(0, 16),
    surplusUntil: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default to 1 hour from now
    discountPct: 20,
    note: ""
  })

  useEffect(() => {
    dispatch(fetchMenuItems())
    dispatch(fetchCategories())
    dispatch(fetchDailySpecials())
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        dispatch(fetchMenuItems())
        dispatch(fetchCategories())
        dispatch(fetchDailySpecials())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const addMenuItem = () => {
    if (!newItem.name || !newItem.categoryId || newItem.price <= 0 || !newItem.menuImage) {
      toast.error("All fields including an image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("description", newItem.description);
    formData.append("price", newItem.price.toString());
    formData.append("categoryId", newItem.categoryId);
    formData.append("isVeg", newItem.isVeg.toString());
    formData.append("isAvailable", newItem.isAvailable.toString());
    formData.append("menuImage", newItem.menuImage);

    dispatch(createMenuItem(formData))

    setIsAddDialogOpen(false)
    setNewItem({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      isVeg: false,
      isAvailable: true,
      menuImage: null
    })
  }

  const handleUpdateMenuItem = () => {
    if (!selectedItem) return
    dispatch(updateMenuItem({ id: selectedItem.id, data: selectedItem }))
    setIsEditDialogOpen(false)
  }

  const handleDeleteMenuItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteMenuItem(id))
    }
  }

  const toggleAvailability = (item) => {
    dispatch(
      updateMenuItem({
        id: item.id,
        data: { ...item, isAvailable: !item.isAvailable },
      })
    )
  }

  const handleFlashInputChange = (e) => {
    const { name, value } = e.target
    setFlashFormData({ ...flashFormData, [name]: value })
  }

  const handleFlashDiscountChange = (e) => {
    setFlashFormData({ ...flashFormData, discountPct: parseFloat(e.target.value) || 0 })
  }

  function toUTCISOString(localDateTime) {
    const date = new Date(localDateTime)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  }

  const handleSubmitFlash = () => {
    const data = {
      menuItemId: flashFormData.menuItemId,
      surplusAt: toUTCISOString(flashFormData.surplusAt),
      surplusUntil: toUTCISOString(flashFormData.surplusUntil),
      discountPct: flashFormData.discountPct,
      note: flashFormData.note
    }

    if (selectedMark) {
      dispatch(updateSurplusMark({ id: selectedMark.id, data }))
    } else {
      dispatch(createSurplusMark(data))
    }

    setIsFlashDialogOpen(false)
    // Refresh lists
    dispatch(fetchDailySpecials())
  }

  const handleDeleteFlash = (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      dispatch(deleteSurplusMark(id))
      dispatch(fetchDailySpecials())
      dispatch(fetchSurplusMarks())
    }
  }

  const openFlashDialog = (mark = null, menuItemId = null) => {
    if (mark) {
      setSelectedMark(mark)
      setFlashFormData({
        menuItemId: mark.menuItemId,
        surplusAt: new Date(mark.surplusAt).toISOString().slice(0, 16),
        surplusUntil: new Date(mark.surplusUntil).toISOString().slice(0, 16),
        discountPct: Number(mark.discountPct),
        note: mark.note || ""
      })
    } else {
      setSelectedMark(null)
      setFlashFormData({
        menuItemId: menuItemId || "",
        surplusAt: new Date().toISOString().slice(0, 16),
        surplusUntil: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        discountPct: 20,
        note: ""
      })
    }
    setIsFlashDialogOpen(true)
  }

  const filteredItems = menuItems.filter((item) => selectedCategory === "all" || item.categoryId === selectedCategory)

  const availableCount = menuItems.filter((m) => m.isAvailable).length
  const vegCount = menuItems.filter((m) => m.isVeg).length

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
              <p className="text-muted-foreground mt-1">Manage restaurant menu items and categories</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Menu Item</DialogTitle>
                  <DialogDescription>Create a new menu item</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-image" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      Menu Item Image
                    </Label>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      {newItem.menuImage ? (
                        <div className="relative w-full aspect-video">
                          <img
                            src={URL.createObjectURL(newItem.menuImage)}
                            alt="Preview"
                            className="rounded-md object-cover w-full h-full"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => setNewItem({ ...newItem, menuImage: null })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="add-image" className="flex flex-col items-center gap-2 cursor-pointer py-4">
                          <Plus className="h-10 w-10 text-muted-foreground" />
                          <span className="text-sm font-medium">Click to upload image</span>
                          <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                        </label>
                      )}
                      <Input
                        id="add-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewItem({ ...newItem, menuImage: file });
                        }}
                      />
                    </div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      placeholder="Caesar Salad"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Fresh romaine lettuce with parmesan..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newItem.categoryId}
                        onValueChange={(value) => setNewItem({ ...newItem, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isVeg">Vegetarian</Label>
                    <Switch
                      id="isVeg"
                      checked={newItem.isVeg}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, isVeg: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isAvailable">Available</Label>
                    <Switch
                      id="isAvailable"
                      checked={newItem.isAvailable}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, isAvailable: checked })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addMenuItem}>Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
                  </div>
                  <UtensilsCrossed className="h-8 w-8 text-chart-1/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-foreground">{availableCount}</p>
                  </div>
                  <Tag className="h-8 w-8 text-chart-2/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vegetarian</p>
                    <p className="text-2xl font-bold text-foreground">{vegCount}</p>
                  </div>
                  <Leaf className="h-8 w-8 text-chart-2/60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Flash Sales</p>
                    <p className="text-2xl font-bold text-foreground">{dailySpecials.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-chart-3/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
  <CardTitle>Menu Items</CardTitle>

  <Tabs
    value={selectedCategory}
    onValueChange={setSelectedCategory}
    className="border-t border-slate-200 dark:border-slate-800 mt-4"
  >
    {/* Scroll wrapper */}
    <div className="overflow-x-auto scrollbar-hide px-1 py-2">
      <TabsList className="flex min-w-max gap-2 bg-transparent p-0">
        <TabsTrigger
          value="all"
          className="shrink-0 whitespace-nowrap"
        >
          All
        </TabsTrigger>

        {categories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="shrink-0 whitespace-nowrap"
          >
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  </Tabs>
</CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const category = categories.find((c) => c.id === item.categoryId)
                  const special = dailySpecials.find((s) => s.menuItemId === item.id)
                  return (
                    <Card key={item.id} className={!item.isAvailable ? "opacity-50" : ""}>
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img
                          src={`${item.imageUrl}?height=200&width=300`}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="destructive">Unavailable</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {item.name}
                              {item.isVeg && <Leaf className="h-4 w-4 text-chart-2" />}
                              {special && <Badge variant="secondary" className="ml-2">{special.discountPct}% Off</Badge>}
                            </h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {category?.name}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-foreground">${item.price}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAvailability(item)}
                            className="flex-1"
                          >
                            {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              dispatch(selectItem(item))
                              setIsEditDialogOpen(true)
                            }}
                            className="w-9 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openFlashDialog(null, item.id)}
                            className="w-9 p-0"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="w-9 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flash Sales</CardTitle>
                <Button onClick={() => openFlashDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Flash Sale
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {surplusMarks.map((mark) => {
                  const menuItem = menuItems.find((i) => i.id === mark.menuItemId)
                  if (!menuItem) return null
                  const isActive = new Date() >= new Date(mark.surplusAt) && new Date() < new Date(mark.surplusUntil)
                  const salePrice = Number(menuItem.price) * (1 - Number(mark.discountPct) / 100)
                  return (
                    <Card key={mark.id}>
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img
                          src={`${menuItem.imageUrl}?height=200&width=300`}
                          alt={menuItem.name}
                          className="object-cover w-full h-full"
                        />
                        {isActive && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="success">Active</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{menuItem.name}</h3>
                        <p className="text-sm text-muted-foreground">Discount: {mark.discountPct}%</p>
                        <p className="text-sm text-muted-foreground">Sale Price: ${salePrice.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Start: {new Date(mark.surplusAt).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">End: {new Date(mark.surplusUntil).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mb-4">Note: {mark.note || "N/A"}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openFlashDialog(mark)} className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteFlash(mark.id)} className="flex-1">
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogDescription>Update menu item details</DialogDescription>
              </DialogHeader>
              {selectedItem && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Item Image</Label>
                    <div className="flex flex-col gap-4">
                      <div className="relative h-40 w-full rounded-md overflow-hidden border bg-muted">
                        <img
                          src={editImagePreview || selectedItem.imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Label
                            htmlFor="edit-image-upload"
                            className="cursor-pointer bg-white/90 text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"
                          >
                            <Camera className="h-3 w-3" />
                            Replace Image
                          </Label>
                        </div>
                      </div>

                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="edit-image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && selectedItem) {
                            const previewUrl = URL.createObjectURL(file);
                            setEditImagePreview(previewUrl);
                            setPendingImageFile(file);
                          }
                          e.target.value = "";
                        }}
                      />
                      {pendingImageFile && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setPendingImageFile(null);
                              setEditImagePreview(null);
                            }}
                          >
                            Cancel
                          </Button>

                          <Button
                            onClick={() => {
                              if (!selectedItem || !pendingImageFile) return;

                              const formData = new FormData();
                              formData.append("menuImage", pendingImageFile);

                              dispatch(updateMenuItemImage({
                                id: selectedItem.id,
                                formData,
                              }));

                              setPendingImageFile(null);
                            }}
                          >
                            Confirm Replace
                          </Button>
                        </div>
                      )}

                    </div>
                    <Label htmlFor="edit-name">Item Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedItem.name}
                      onChange={(e) => dispatch(selectItem({ ...selectedItem, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={selectedItem.description || ""}
                      onChange={(e) => dispatch(selectItem({ ...selectedItem, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Price ($)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={selectedItem.price}
                        onChange={(e) =>
                          dispatch(selectItem({ ...selectedItem, price: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select
                        value={selectedItem.categoryId}
                        onValueChange={(value) => dispatch(selectItem({ ...selectedItem, categoryId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-isVeg">Vegetarian</Label>
                    <Switch
                      id="edit-isVeg"
                      checked={selectedItem.isVeg}
                      onCheckedChange={(checked) => dispatch(selectItem({ ...selectedItem, isVeg: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-isAvailable">Available</Label>
                    <Switch
                      id="edit-isAvailable"
                      checked={selectedItem.isAvailable}
                      onCheckedChange={(checked) => dispatch(selectItem({ ...selectedItem, isAvailable: checked }))}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMenuItem}>Update Item</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isFlashDialogOpen} onOpenChange={setIsFlashDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedMark ? "Edit Flash Sale" : "Add Flash Sale"}</DialogTitle>
                <DialogDescription>{selectedMark ? "Update" : "Create"} a flash sale for a menu item</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!selectedMark ? (
                  <div className="space-y-2">
                    <Label htmlFor="menuItemId">Menu Item</Label>
                    <Select
                      value={flashFormData.menuItemId}
                      onValueChange={(value) => setFlashFormData({ ...flashFormData, menuItemId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select menu item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Menu Item</Label>
                    <Input value={menuItems.find((i) => i.id === flashFormData.menuItemId)?.name || ""} disabled />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="surplusAt">Start Time</Label>
                  <Input
                    id="surplusAt"
                    type="datetime-local"
                    name="surplusAt"
                    value={flashFormData.surplusAt}
                    onChange={handleFlashInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surplusUntil">End Time</Label>
                  <Input
                    id="surplusUntil"
                    type="datetime-local"
                    name="surplusUntil"
                    value={flashFormData.surplusUntil}
                    onChange={handleFlashInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPct">Discount Percentage</Label>
                  <Input
                    id="discountPct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={flashFormData.discountPct}
                    onChange={handleFlashDiscountChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={flashFormData.note}
                    onChange={handleFlashInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsFlashDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitFlash}>
                  {selectedMark ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}