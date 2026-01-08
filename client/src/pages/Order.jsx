import { useState, useMemo, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart, Trash2, Leaf, Search, ArrowLeft, X, AlertCircle, Filter, Tag, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { ModeToggle } from "@/components/ModeToggle"
import { createOrder } from "@/store/orderSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Order({ tableId, onBack }) {
  const dispatch = useDispatch()
  const menuItems = useSelector((state) => state.menuItem.items)
  const dailySpecials = useSelector((state) => state.surplus.dailySpecials)
  const tables = useSelector((state) => state.table.tables)
  const categories = useSelector((state) => state.category.categories)
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [vegOnly, setVegOnly] = useState(false)
  const [selectedAllergens, setSelectedAllergens] = useState([])
  const [orderNotes, setOrderNotes] = useState("")
  const currentTable = tables.find(t => t.id === tableId);
  const allAllergens = useMemo(() => {
    const allergenSet = new Set();
    menuItems.forEach(item => {
      item.allergens?.forEach(a => {
        allergenSet.add(a.allergen.name);
      });
    });
    return Array.from(allergenSet).sort();
  }, [menuItems]);
  const availableItems = useMemo(() => menuItems.filter(item => item.isAvailable), [menuItems]);
  const categoryCounts = useMemo(() => {
    const counts= {};
    availableItems.forEach(item => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [availableItems]);
  const totalCount = availableItems.length;
  const toggleAllergen = (allergen) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const updateCartItemDetails = (id, field, value) => {
  setCart(prev => prev.map(c => 
    c.menuItemId === id ? { ...c, [field]: value } : c
  ));
};

  const toggleShowDetails = (id) => {
    setCart(prev => prev.map(c => 
      c.menuItemId === id ? { ...c, showDetails: !c.showDetails } : c
    ));
  };

  const getItemData = (item) => {
    const surplus = dailySpecials.find((s) => s.menuItemId === item.id);
    const hasDiscount = !!surplus;
    const finalPrice = hasDiscount ? Number(item.price) * (1 - Number(surplus.discountPct) / 100) : Number(item.price);
    return { hasDiscount, discountPct: surplus?.discountPct, finalPrice };
  };
  const addToCart = (item) => {
    const { finalPrice } = getItemData(item);
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) => (c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price: finalPrice,
        qty: 1,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl,
        allergens: item.allergens,
        notes: "",
        payerName: "",
        showDetails: false,
      }];
    });
    toast.success(`${item.name} added to cart`, {
      icon: '✨',
    });
  };
  const updateQuantity = (id, qty) => {
    if (qty === 0) {
      const item = cart.find(c => c.menuItemId === id);
      toast.success(`${item?.name} removed`, {
        icon: '🗑️',
      });
    }
    setCart(prev => prev.map(c => c.menuItemId === id ? { ...c, qty } : c).filter(c => c.qty > 0));
  };
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared", {
      icon: '🧹',
    });
  };
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
   
    const itemAllergens = item.allergens?.map(a => a.allergen.name) || [];
    const hasExcludedAllergen = selectedAllergens.some(allergen => itemAllergens.includes(allergen));
   
    return matchesSearch && matchesCategory && matchesVeg && !hasExcludedAllergen && item.isAvailable;
  });
  const activeFilterCount = (vegOnly ? 1 : 0) + selectedAllergens.length;
  const currentCategoryName = selectedCategory === "all"
    ? "All Items"
    : categories.find(c => c.id === selectedCategory)?.name || "Category";

  // New states for confirmation and history
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  // LocalStorage helpers
  const STORAGE_KEY = `table_orders_${tableId}`;

  const saveOrderToLocal = (order) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  };

  const getLocalOrders = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  const clearLocalOrders = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOrderHistory([]);
  };

  // Load history on mount
  useEffect(() => {
    setOrderHistory(getLocalOrders());
  }, [tableId]);

  return (
    <div className={`h-screen flex overflow-hidden dark:bg-slate-950 bg-linear-to-br from-slate-50 via-white to-amber-50/30`}>
      {/* LEFT SIDE: Menu Browser */}
      <div className="flex-1 flex flex-col min-w-0 dark:bg-slate-900">
        {/* Fixed Header */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Table</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {currentTable?.name || '...'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOrderHistory(getLocalOrders()); // Refresh
                    setShowOrderHistory(true);
                  }}
                  className="relative border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 dark:text-amber-400"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  My Orders
                  {orderHistory.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 border-0 shadow-lg">
                      {orderHistory.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCartOpen(true)}
                  className="lg:hidden relative border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 dark:text-amber-400"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 border-0 shadow-lg">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            {/* Search & Filter Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  placeholder="Search delicious dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 backdrop-blur-sm"
                />
              </div>
              <Button
                variant={activeFilterCount > 0 ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={activeFilterCount > 0
                  ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300"
                }
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
            {/* Filter Panel */}
            {showFilters && (
              <Card className="mt-3 border-amber-100 dark:border-amber-900/30 bg-linear-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-950/20 backdrop-blur-xl shadow-xl">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={vegOnly}
                          onChange={(e) => setVegOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-green-600 focus:ring-green-500 dark:bg-slate-700"
                        />
                        <Leaf className="w-4 h-4 text-green-600 dark:text-green-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-400">
                          Vegetarian Only
                        </span>
                      </label>
                    </div>
                    {allAllergens.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Exclude Allergens
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {allAllergens.map(allergen => (
                            <Badge
                              key={allergen}
                              variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                selectedAllergens.includes(allergen)
                                  ? "bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-lg shadow-red-500/30"
                                  : "border-slate-300 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-slate-300"
                              }`}
                              onClick={() => toggleAllergen(allergen)}
                            >
                              {allergen}
                              {selectedAllergens.includes(allergen) && (
                                <X className="w-3 h-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVegOnly(false);
                          setSelectedAllergens([]);
                        }}
                        className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Category Tabs - Scrollable */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="border-t border-slate-200 dark:border-slate-800">
<div className="overflow-x-auto scrollbar-hide px-6 py-3">
  <TabsList className="flex min-w-max gap-2 bg-transparent p-0">
      <TabsTrigger value="all" className="shrink-0 whitespace-nowrap">
        <Sparkles className="w-3 h-3 mr-2" />
        All Items ({totalCount})
      </TabsTrigger>
      {categories.map(cat => (
        <TabsTrigger key={cat.id} value={cat.id} className="shrink-0 whitespace-nowrap">
          {cat.name} ({categoryCounts[cat.id] || 0})
        </TabsTrigger>
      ))}
    </TabsList>
  </div>
</Tabs>   
        </div>
        {/* Scrollable Menu Items */}
        <div className="flex-1 scrollbar-hide overflow-y-auto">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-lg text-slate-900 dark:text-white">{filteredItems.length}</span> items in{" "}
                <span className="font-medium text-amber-600 dark:text-amber-400">{currentCategoryName}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const { hasDiscount, discountPct, finalPrice } = getItemData(item);
                const itemAllergens = item.allergens?.map(a => a.allergen.name) || [];
               
                return (
                  <Card
                    key={item.id}
                    className="group hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20 transition-all duration-300 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm hover:-translate-y-1"
                  >
                    <CardContent className="p-0">
                      <div className="relative h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tag className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                          </div>
                        )}
                       
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {hasDiscount && (
                            <Badge className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-xl shadow-red-500/50 border-0 animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {discountPct}% OFF
                            </Badge>
                          )}
                          {item.isVeg && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/50 border-0">
                              <Leaf className="w-3 h-3 mr-1" />
                              Veg
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/50 border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 text-lg">
                          {item.name}
                        </h3>
                       
                        {item.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {itemAllergens.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {itemAllergens.map(allergen => (
                              <Badge
                                key={allergen}
                                variant="outline"
                                className="text-xs border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                              ${finalPrice.toFixed(2)}
                            </div>
                            {hasDiscount && (
                              <div className="text-sm text-slate-500 dark:text-slate-500 line-through">
                                ${Number(item.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => addToCart(item)}
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 border-0 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <Tag className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No items found</h3>
                <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* RIGHT SIDE: Cart - Fixed Container with Internal Scroll */}
      <div className={`
        lg:w-[420px] lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:shadow-2xl
        fixed lg:relative inset-y-0 right-0 z-50 w-full max-w-md
        transform transition-transform duration-300 lg:transform-none
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        bg-white dark:bg-slate-900 flex flex-col
      `}>
        {/* Fixed Cart Header */}
        <div className="shrink-0 p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Order</h2>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        {/* Scrollable Cart Items */}
        <div className="flex-1 scrollbar-hide overflow-y-auto px-6">
          <div className="py-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
                <p className="text-slate-600 dark:text-slate-400">Add delicious items from the menu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <Card
                    key={item.menuItemId}
                    className="border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/50 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex-shrink-0 overflow-hidden shadow-inner">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate text-base">
                                {item.name}
                              </h4>
                              {item.isVeg && (
                                <Badge variant="outline" className="mt-1.5 text-xs border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
                                  <Leaf className="w-3 h-3 mr-1" />
                                  Veg
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.menuItemId, 0)}
                              className="h-8 w-8 p-0 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-1 shadow-inner">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.menuItemId, item.qty - 1)}
                                className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-slate-900 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-base font-bold text-slate-900 dark:text-white w-8 text-center">
                                {item.qty}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.menuItemId, item.qty + 1)}
                                className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-slate-900 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                              ${(item.price * item.qty).toFixed(2)}
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant="link" 
                              onClick={() => toggleShowDetails(item.menuItemId)}
                              className="p-0 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                            >
                              {item.showDetails ? "Hide details" : "Add payer & notes"}
                              {(item.payerName || item.notes) && !item.showDetails && <span className="ml-1 text-xs text-slate-500">(added)</span>}
                            </Button>
                            {item.showDetails && (
                              <div className="mt-2 space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                                    Who is this for?
                                  </label>
                                  <Input
                                    placeholder="e.g. John"
                                    value={item.payerName}
                                    onChange={(e) => updateCartItemDetails(item.menuItemId, 'payerName', e.target.value)}
                                    className="h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                                    Item Notes
                                  </label>
                                  <Input
                                    placeholder="e.g. No onions, extra spicy"
                                    value={item.notes}
                                    onChange={(e) => updateCartItemDetails(item.menuItemId, 'notes', e.target.value)}
                                    className="h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Fixed Cart Footer */}
        {cart.length > 0 && (
          <div className="shrink-0 p-6 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20 backdrop-blur-xl shadow-2xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                  Global Order Notes
                </label>
                <textarea
                  placeholder="Anything else we should know for the whole table?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full min-h-20 p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none transition-all"
                />
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-4">
                <span>Total</span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={clearCart}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  onClick={() => {
                    const orderData = {
                      tableId: tableId,
                      isQrOrder: true,
                      notes: orderNotes,
                      items: cart.map(item => ({
                        menuItemId: item.menuItemId,
                        qty: item.qty,
                        notes: item.notes,
                        payerName: item.payerName
                      })),
                      createdAt: new Date().toISOString(),
                      status: 'Pending',
                      total: total.toFixed(2),
                    };
                    dispatch(createOrder(orderData));
                    saveOrderToLocal(orderData);
                    setLastOrder(orderData);
                    setShowConfirmation(true);
                    setCart([]);
                    setIsCartOpen(false);
                    // toast.success("Order placed successfully!", { icon: '🎉' });
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Order Placed!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Your order for Table {currentTable?.name} is being prepared. Here's a summary:
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-60 pr-4">
            {lastOrder?.items.map((item, idx) => {
              const menuItem = menuItems.find(m => m.id === item.menuItemId);
              return (
                <div key={idx} className="py-3 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{menuItem?.name} x {item.qty}</span>
                    <span>${(menuItem?.price * item.qty).toFixed(2)}</span>
                  </div>
                  {item.notes && <p className="text-sm text-slate-500">Notes: {item.notes}</p>}
                  {item.payerName && <p className="text-sm text-slate-500">For: {item.payerName}</p>}
                </div>
              );
            })}
          </ScrollArea>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${lastOrder?.total}</span>
            </div>
            {lastOrder?.notes && <p className="text-sm text-slate-600 dark:text-slate-400">Order Notes: {lastOrder.notes}</p>}
          </div>
          <DialogFooter className="mt-6 flex sm:justify-between">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowConfirmation(false);
              // Optionally, reopen cart or something
            }}>
              Add More Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order History Modal */}
      <Dialog open={showOrderHistory} onOpenChange={setShowOrderHistory}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Your Orders for Table {currentTable?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80 pr-4">
            {orderHistory.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No orders yet.</p>
            ) : (
              orderHistory.map((order, idx) => (
                <Card key={idx} className="mb-4 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Order #{idx + 1}</span>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, i) => {
                        const menuItem = menuItems.find(m => m.id === item.menuItemId);
                        return (
                          <div key={i} className="text-sm text-slate-700 dark:text-slate-300">
                            {menuItem?.name} x {item.qty}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 font-bold text-slate-900 dark:text-white">Total: ${order.total}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Placed: {new Date(order.createdAt).toLocaleTimeString()}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
          <DialogFooter className="mt-6 flex sm:justify-between">
            <Button variant="outline" onClick={clearLocalOrders}>
              Clear History
            </Button>
            <Button onClick={() => setShowOrderHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}