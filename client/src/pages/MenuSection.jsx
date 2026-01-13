import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Clock, Leaf, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '@/store/menuItemSlice';
import { fetchCategories } from '@/store/categorySlice';

export default function MenuSection({ onOrderClick }) {
  const dispatch = useDispatch();
  const { items: menuItems } = useSelector((state) => state.menuItem);
  const { categories } = useSelector((state) => state.category);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isVegOnly, setIsVegOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Derived State: Featured Items (Items with active SurplusMarks)
  const featuredItems = useMemo(() => 
    menuItems.filter((item) => item.surplusMarks && item.surplusMarks.length > 0),
    [menuItems]
  );

  // Derived State: Filtered Menu
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true;
      const matchesVeg = isVegOnly ? item.isVeg === true : true;
      return matchesCategory && matchesVeg && item.isAvailable;
    });
  }, [menuItems, selectedCategory, isVegOnly]);

//   if (loading) {
//     return (
//       <section id="menu" className="bg-background px-4 py-20">
//         <div className="mx-auto max-w-7xl text-center">
//           <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
//         </div>
//       </section>
//     );
//   }

  return (
    <section id="menu" className="bg-background px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            Explore Our <span className="text-amber-500">Menu</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Handcrafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Featured Section (Flash Sales) */}
        {featuredItems.length > 0 && (
          <div className="mb-16">
            <div className="mb-6 flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground">Featured Deals</h3>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500 animate-pulse">
                Limited Time
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <MenuItemCard key={`featured-${item.id}`} item={item} onOrderClick={onOrderClick} />
              ))}
            </div>
          </div>
        )}

        <hr className="mb-12 border-border" />

        {/* Controls: Categories & Veg Toggle */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-6 py-2.5 font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-2.5 font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Veg Toggle */}
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
              isVegOnly 
                ? 'border-green-500 bg-green-500/10 text-green-500' 
                : 'border-border text-muted-foreground hover:border-border'
            }`}
          >
            <Leaf size={18} />
            <span className="text-sm font-bold">Vegetarian Only</span>
          </button>
        </div>

        {/* Main Menu Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onOrderClick={onOrderClick} />
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="rounded-xl bg-muted/50 p-20 text-center">
            <p className="text-xl text-muted-foreground">No dishes found matching your selection.</p>
            <button 
              onClick={() => {setSelectedCategory(null); setIsVegOnly(false);}}
              className="mt-4 text-amber-500 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function MenuItemCard({
  item,
  onOrderClick,
}) {
  const hasSurplus = item.surplusMarks && item.surplusMarks.length > 0;
  const discountPct = hasSurplus ? Number(item.surplusMarks[0].discountPct) : 0;
  
  const originalPrice = Number(item.price);
  const finalPrice = hasSurplus 
    ? (originalPrice * (1 - discountPct / 100)).toFixed(2) 
    : originalPrice.toFixed(2);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl bg-card transition-all hover:shadow-2xl hover:shadow-amber-500/10">
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl opacity-20">🍽️</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasSurplus && (
            <div className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              {discountPct}% OFF
            </div>
          )}
          {item.isVeg && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
              <div className="h-3 w-3 rounded-full bg-green-600" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-card-foreground group-hover:text-amber-500 transition-colors">
            {item.name}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-amber-500">${finalPrice}</span>
            {hasSurplus && (
              <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {item.description || "No description available for this item."}
        </p>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Allergens:</span>
            {item.allergens.map((allergen) => (
              <span key={allergen.allergen.id} className="rounded-full bg-red-500/10 px-2 py-1">
                {allergen.allergen.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            15-20 min
          </div>

          {onOrderClick && (
            <button
              onClick={() => onOrderClick(item)}
              className="flex items-center gap-1 text-sm font-bold text-amber-500 transition-all hover:gap-2 hover:text-amber-400"
            >
              Order Now
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}