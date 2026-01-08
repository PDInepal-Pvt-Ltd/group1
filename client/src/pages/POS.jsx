"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart, Trash2, Leaf, Search, Tag, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchMenuItems } from "@/store/menuItemSlice"
import { useDispatch, useSelector } from "react-redux"
import { fetchDailySpecials } from "@/store/surplusSlice"
import { fetchTables } from "@/store/tableSlice"
import { fetchCategories } from "@/store/categorySlice"
import { ScrollArea } from "@/components/ui/scroll-area"
import toast from "react-hot-toast"

export default function POSPage() {
  const dispatch = useDispatch();
  const [selectedTable, setSelectedTable] = useState("")
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const menuItems = useSelector((state) => state.menuItem.items)
  const dailySpecials = useSelector((state) => state.surplus.dailySpecials)
  const tables = useSelector((state) => state.table.tables)
  const categories = useSelector((state) => state.category.categories)

  React.useEffect(() => {
    dispatch(fetchMenuItems())
    dispatch(fetchDailySpecials())
    dispatch(fetchTables())
    dispatch(fetchCategories())

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        dispatch(fetchMenuItems())
        dispatch(fetchDailySpecials())
        dispatch(fetchTables())
        dispatch(fetchCategories())
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const addToCart = (item = menuItems[0]) => {
    const existingItem = cart.find((c) => c.menuItemId === item.id)
    if (existingItem) {
      setCart(cart.map((c) => (c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c)))
      toast.success(`${item.name} x${existingItem.qty + 1} added to cart`)
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          isVeg: item.isVeg,
        },
      ])
      toast.success(`${item.name} x1 added to cart`)
    }
  }

  const updateQuantity = (menuItemId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.menuItemId !== menuItemId))
      toast.success("Item has been removed from cart")
    } else {
      setCart(cart.map((c) => (c.menuItemId === menuItemId ? { ...c, qty } : c)))
    }
  }

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter((c) => c.menuItemId !== menuItemId))
    toast.success("Item has been removed from cart")
  }

  const clearCart = () => {
    setCart([])
    toast.success("Cart has been cleared")
  }

  const placeOrder = () => {
    if (!selectedTable) {
      toast.error("Please select a table")
      return
    }
    if (cart.length === 0) {
      toast.error("Please add items to cart")
      return
    }

    toast.success("Order has been placed successfully")
    setCart([])
    setSelectedTable("")
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const tax = subtotal * 0.13
  const total = subtotal + tax

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory && item.isAvailable
  })

  const surplusItemIds = dailySpecials.map((s) => s.menuItemId)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Point of Sale</h1>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select table" />
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

         <Tabs
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  className="w-full border-b border-border"
>
  {/* Scroll container */}
  <div className="overflow-x-auto scrollbar-hide mb-4">
    <TabsList className="flex min-w-max gap-2 bg-transparent p-0">
      <TabsTrigger
        value="all"
        className="shrink-0 whitespace-nowrap"
      >
        All Items
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


          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const isSurplus = surplusItemIds.includes(item.id)
              const surplusItem = dailySpecials.find((s) => s.menuItemId === item.id)
              const discountedPrice = isSurplus
                ? item.price * (1 - Number(surplusItem?.discountPct || 0) / 100)
                : item.price

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:border-primary transition-all group relative overflow-hidden"
                  onClick={() => addToCart(item)}
                >
                  {isSurplus && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-chart-3 text-chart-3-foreground">
                        <Tag className="h-3 w-3 mr-1" />
                        {surplusItem?.discountPct}% OFF
                      </Badge>
                    </div>
                  )}
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                      src={`${item.imageUrl}?height=200&width=200`}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight flex-1">{item.name}</h3>
                      {item.isVeg && <Leaf className="h-4 w-4 text-chart-2 ml-2 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2">
                      {isSurplus ? (
                        <>
                          <p className="text-lg font-bold text-foreground">${discountedPrice}</p>
                          <p className="text-sm text-muted-foreground line-through">${item.price}</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-foreground">${item.price}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="w-96 bg-card border-l border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Order
            </h2>
            {selectedTable && (
              <p className="text-sm text-muted-foreground mt-1">
                {tables.find((t) => t.id === selectedTable)?.name}
              </p>
            )}
          </div>

          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground flex items-center gap-2">
                          {item.name}
                          {item.isVeg && <Leaf className="h-3 w-3 text-chart-2" />}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">${Number(item.price)} each</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.qty - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQuantity(item.menuItemId, Number.parseInt(e.target.value) || 1)}
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.qty + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-auto font-semibold text-foreground">
                        ${(Number(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-6 border-t border-border space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (13%)</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1 bg-transparent"
              >
                Clear
              </Button>
              <Button onClick={placeOrder} disabled={cart.length === 0 || !selectedTable} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}