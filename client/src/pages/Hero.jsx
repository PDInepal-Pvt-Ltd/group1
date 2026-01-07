import { useState, useEffect } from 'react';
import {
  Flame, TrendingUp, ChefHat, ArrowRight,
  Sparkles, Lock, ChevronRight, Menu,
  Timer, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeToggle } from '@/components/ModeToggle';
export default function Hero({ onReserveClick, onExploreMenuClick }) {
  const [tableId, setTableId] = useState('');
  const [timeLeft, setTimeLeft] = useState(7200);
  const [currentDishIndex, setCurrentDishIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableIdParam = params.get('tableId');
    if (tableIdParam) {
      setTableId(tableIdParam);
    }
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    const carousel = setInterval(() => setCurrentDishIndex(prev => (prev + 1) % 3), 5000);
    return () => { clearInterval(timer); clearInterval(carousel); };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const trendingDishes = [
    { name: "Wagyu Steak", img: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg" },
    { name: "Truffle Pasta", img: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg" },
    { name: "Grilled Salmon", img: "https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg" }
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background font-sans">

      {/* 1. Refined Background: Darker overlay for better text contrast */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="h-full w-full object-cover opacity-80"
          poster="https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg"
        >
          <source src="/hero1_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-background via-background/40 to-background" />
      </div>

      {/* 2. Top Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
            <ChefHat size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">HayaRestro</span>
        </div>

        <button
          onClick={() => window.location.href = '/login'}
          className="group flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/70 backdrop-blur-md transition-all hover:bg-foreground/10"
        >
          <Lock className="h-3 w-3" />
          Staff
        </button>
      </nav>

      {/* 3. Main Content Container */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center">

        {/* Context-Aware Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground/5 p-1 pr-4 backdrop-blur-2xl"
        >
          <span className="flex h-8 items-center justify-center rounded-full bg-amber-500 px-3 text-[10px] font-black uppercase text-slate-950">
            {tableId ? `Table ${tableId}` : "Fine Dining"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">
            {tableId ? "Direct Kitchen Link Active" : "Now Accepting Reservations"}
          </span>
        </motion.div>

        {/* Dynamic Heading */}
        <h1 className="mb-6 max-w-4xl text-5xl font-black tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          {tableId ? "Taste the" : "Elevate Your"} <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            {tableId ? "Moment" : "Palate"}
          </span>
        </h1>

        <p className="mb-10 max-w-lg text-base text-muted-foreground sm:text-lg">
          {tableId
            ? "Your digital menu is ready. Browse our curated collection and place your order directly to the kitchen."
            : "Where culinary artistry meets modern atmosphere. Join us for a journey through seasonal flavors and artisanal craft."
          }
        </p>

        {/* Action Center: Cleaned up CTA logic */}
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {tableId ? (
            <button
              onClick={onExploreMenuClick}
              className="group flex items-center gap-4 rounded-full bg-amber-500 px-10 py-5 text-lg font-black text-slate-950 transition-all hover:scale-105 hover:bg-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
            >
              Start Ordering <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <>
              <button
                onClick={onReserveClick}
                className="group flex items-center gap-3 rounded-full bg-primary-foreground px-10 py-5 text-lg font-black text-primary transition-all hover:bg-amber-400"
              >
                Book a Table
              </button>
              <button
                onClick={onExploreMenuClick}
                className="group flex items-center gap-3 rounded-full border border-foreground/20 bg-foreground/5 px-10 py-5 text-lg font-bold text-foreground backdrop-blur-xl transition-all hover:bg-foreground/10"
              >
                Explore Menu
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. Peripheral Information (Floating Elements) */}

      {/* Flash Sale: Moved to bottom-right to avoid clashing with header */}
      <AnimatePresence>
        {timeLeft > 0 && tableId && (
          <motion.div
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-10 right-6 z-30 hidden lg:block"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-red-500/30 bg-background/60 p-4 backdrop-blur-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <Timer className="animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-red-500">Table Special</p>
                <p className="text-sm font-bold text-foreground">50% off Truffle Fries</p>
                <p className="font-mono text-xs text-red-400">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending Indicator: Moved to bottom-left */}
      {!tableId && (
        <div className="absolute bottom-10 left-10 hidden lg:flex items-center gap-6 border-l border-border pl-6">
          <div className="text-left">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
              <TrendingUp size={12} /> Popular Now
            </p>
            <p className="text-xl font-light text-foreground italic">"{trendingDishes[currentDishIndex].name}"</p>
          </div>
          <img
            src={trendingDishes[currentDishIndex].img}
            className="h-16 w-16 rounded-full border-2 border-amber-500/20 object-cover"
            alt="Trending"
          />
        </div>
      )}

      {/* Scroll Indicator */}
      {!tableId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[9px] uppercase tracking-widest text-foreground">Discover</span>
          <div className="h-8 w-px bg-gradient-to-b from-foreground to-transparent" />
        </div>
      )}
      {/* Floating Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 right-6 z-50"
      >
          <ModeToggle />
      </motion.div>
    </div>
  );
}