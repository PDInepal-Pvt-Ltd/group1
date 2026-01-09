import { useEffect, useState, useMemo, useRef } from 'react';
import { Users, Calendar, Armchair, Users2, AlertCircle, Timer,Clock, MapPin, X, QrCode, RefreshCcw, User, Phone, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createReservation } from '@/store/reservationSlice';
import { fetchTables } from '@/store/tableSlice';
import { motion, AnimatePresence } from 'framer-motion';

function ReservationForm({ onClose, preselectedTableId }) {
  const dispatch = useDispatch();
  const { tables } = useSelector((state) => state.table);

  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    tableId: preselectedTableId || '',
    date: '',
    time: '',
    guests: 2,
    durationMin: 120, 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [error, setError] = useState('');

  // 1. DYNAMIC CAPACITY: Calculate max seats from your JSON data
  const maxCapacity = useMemo(() => {
    if (!tables?.length) return 10;
    return Math.max(...tables.map(t => t.seats || 0));
  }, [tables]);

  // 2. DYNAMIC FILTERING: Only show tables that can fit the party size
  const availableTables = useMemo(() => {
    if (!tables) return [];
    return tables
      .filter(table => table.seats >= Number(formData.guests))
      .sort((a, b) => a.seats - b.seats);
  }, [tables, formData.guests]);

  // Auto-select first available table when filters change
  useEffect(() => {
    if (preselectedTableId) {
      setFormData(prev => ({ ...prev, tableId: preselectedTableId }));
    } else {
      const firstFree = availableTables.find(t => t.status === "AVAILABLE");
      if (firstFree) {
        setFormData(prev => ({ ...prev, tableId: firstFree.id }));
      } else {
        setFormData(prev => ({ ...prev, tableId: '' }));
      }
    }
  }, [availableTables, preselectedTableId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tableId) {
      setError('Please select a table to continue.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.durationMin * 60000);

      const reservationPayload = {
        tableId: formData.tableId,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guests: Number(formData.guests),
        status: 'ACTIVE', 
        reservedAt: startDateTime.toISOString(),
        reservedUntil: endDateTime.toISOString(),
        durationMin: formData.durationMin,
      };

      const data = await dispatch(createReservation(reservationPayload)).unwrap();
      if (data) {
        localStorage.setItem('reservation_id', data.id);
        setReservationId(data.id);
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-md rounded-[2.5rem] bg-card p-10 shadow-2xl border border-border text-center animate-in zoom-in-95 duration-300">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-14 w-14 text-primary" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Table Booked!</h2>
          <p className="text-muted-foreground mb-8 text-lg">Your reservation is confirmed. We look forward to serving you.</p>
          <div className="rounded-2xl bg-muted p-5 mb-8 border border-border">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-2">Reference Code</p>
            <p className="font-mono text-primary font-bold text-sm break-all uppercase">{reservationId}</p>
          </div>
          <button onClick={onClose} className="w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm overflow-y-auto scrollbar-hide">
      <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-card shadow-2xl border border-border overflow-hidden my-auto transition-colors duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/20">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Make a Reservation</h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Premium Dining Experience</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Guest Contact */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                <User className="h-4 w-4" /> Guest Name
              </label>
              <input required type="text" className="w-full rounded-2xl bg-input border border-border p-4 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" 
                value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="group space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                <Phone className="h-4 w-4" /> Phone
              </label>
              <input required type="tel" className="w-full rounded-2xl bg-input border border-border p-4 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" 
                value={formData.guestPhone} onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })} placeholder="+1 000 000 000" />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80"><Calendar className="h-4 w-4" /> Date</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} 
                className="w-full rounded-2xl bg-input border border-border p-4 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40" 
                value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80"><Clock className="h-4 w-4" /> Time</label>
              <input required type="time" 
                className="w-full rounded-2xl bg-input border border-border p-4 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40" 
                value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80"><Users className="h-4 w-4" /> Party Size</label>
              <div className="relative">
                <select 
                  className="w-full rounded-2xl bg-input border border-border p-4 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer" 
                  value={formData.guests} 
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                >
                  {[...Array(maxCapacity)].map((_, i) => (
                    <option key={i+1} value={i+1} className="bg-card text-foreground py-2">
                      {i+1} {i === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Users className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* New Duration Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Timer className="h-4 w-4 text-primary" /> Duration
              </label>
              <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {Math.floor(formData.durationMin / 60)}h {formData.durationMin % 60}m
              </span>
            </div>
            <input 
                type="range" min="30" max="240" step="30" 
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                value={formData.durationMin}
                onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold px-1">
                <span>30 MIN</span>
                <span>1 HOUR</span>
                <span>2 HOURS</span>
                <span>3 HOURS</span>
                <span>4 HOURS</span>
            </div>
          </div>

          {/* Visual Table Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
              <Armchair className="h-4 w-4 text-primary" /> Select Your Table
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-52 overflow-y-auto p-1 scrollbar-hide">
              {availableTables.length === 0 ? (
                <div className="col-span-full py-10 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground font-bold">No tables fit your party size.</p>
                </div>
              ) : (
                availableTables.map((table) => {
                  const isOccupied = table.status === "OCCUPIED";
                  const isSelected = formData.tableId === table.id;
                  return (
                    <button
                      key={table.id}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setFormData({ ...formData, tableId: table.id })}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                        ${isSelected ? 'border-primary bg-primary/10 ring-4 ring-primary/5' : 'border-border bg-input hover:border-primary/50'}
                        ${isOccupied ? 'opacity-20 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                      `}
                    >
                      <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {table.name}
                      </span>
                      <span className="text-xl font-black text-foreground">{table.seats}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">Seats</span>
                      {isSelected && <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-primary bg-card rounded-full fill-card" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.tableId}
            className="w-full rounded-[1.5rem] bg-primary py-5 text-xl font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            {isSubmitting ? 'Securing Spot...' : 'Confirm My Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TableAvailability() {
  const dispatch = useDispatch();
  const { tables, loading } = useSelector((state) => state.table);
  const [filter, setFilter] = useState('AVAILABLE'); // Default to AVAILABLE for customer focus
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTables());
    const interval = setInterval(() => dispatch(fetchTables()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedTable(null);
      }
    };
    if (selectedTable) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedTable]);

  const filteredTables = tables
    .filter(t => filter === 'ALL' || t.status === 'AVAILABLE')
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="relative min-h-screen w-full px-4 py-16 overflow-hidden bg-gradient-to-br from-background to-muted flex flex-col justify-start font-serif">
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'url("https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-5xl font-light tracking-widest text-foreground uppercase">
              Table <span className="font-bold italic text-primary">Reservations</span>
            </h2>
            <p className="text-lg text-muted-foreground tracking-wide">Indulge in Elegance – Secure Your Seat</p>
          </div>
          <div className="flex flex-col items-center gap-4 w-full md:w-auto md:items-end">
            <input
              type="text"
              placeholder="Search by table name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-6 py-3 bg-card border border-border rounded-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-lg"
            />
            <div className="flex p-1 bg-card border border-border rounded-full shadow-lg">
              {['AVAILABLE', 'ALL'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`relative px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-all rounded-full ${
                    filter === mode ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={filter === mode}
                >
                  {filter === mode && (
                    <motion.div layoutId="pill" className="absolute inset-0 bg-primary rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  <span className="relative z-10">{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCcw className="text-primary" size={32} />
            </motion.div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-xl tracking-wide">No tables match your criteria.</p>
            <p className="text-sm mt-2 tracking-wide">Please refine your search.</p>
          </div>
        ) : (
          <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredTables.map((table) => (
                <motion.button
                  key={table.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setSelectedTable(table)}
                  className="group relative flex flex-col justify-between h-80 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary hover:bg-muted hover:shadow-2xl hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
                  aria-label={`View details for ${table.name}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-light text-foreground tracking-widest uppercase truncate">{table.name}</h3>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border ${
                      table.status === 'AVAILABLE' ? 'border-primary text-primary bg-primary/10' :
                      table.status === 'OCCUPIED' ? 'border-destructive text-destructive bg-destructive/10' :
                      table.status === 'RESERVED' ? 'border-secondary text-secondary-foreground bg-secondary/10' :
                      'border-muted text-muted-foreground bg-muted/10'
                    }`}>
                      {table.status}
                    </div>
                  </div>
                  {/* Seat Info */}
                  <div className="my-8 text-center">
                    <Users size={48} className="mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="block mt-2 text-xl font-medium text-foreground tracking-wide">{table.seats} Seats</span>
                  </div>
                  <div className="flex items-center justify-center pt-4 border-t border-border">
                    <span className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors tracking-widest uppercase">
                      View Details
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Table Details Modal */}
        <AnimatePresence>
          {selectedTable && !showReservationForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md"
              aria-modal="true"
              role="dialog"
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl shadow-primary/10 p-8 lg:p-12 overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-4xl font-light text-foreground tracking-widest uppercase">{selectedTable.name}</h3>
                  <button onClick={() => setSelectedTable(null)} className="text-muted-foreground hover:text-primary p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close modal">
                    <X size={24} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Details */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-medium text-muted-foreground tracking-wide mb-1 uppercase">Status</h4>
                      <p className={`text-2xl font-bold tracking-wide uppercase ${
                        selectedTable.status === 'AVAILABLE' ? 'text-primary' :
                        selectedTable.status === 'OCCUPIED' ? 'text-destructive' :
                        selectedTable.status === 'RESERVED' ? 'text-secondary-foreground' :
                        'text-muted-foreground'
                      }`}>
                        {selectedTable.status}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-muted-foreground tracking-wide mb-1 uppercase">Capacity</h4>
                      <div className="flex items-center gap-2 text-foreground">
                        <Users size={20} className="text-primary" />
                        <span className="text-xl font-medium tracking-wide">{selectedTable.seats} Guests</span>
                      </div>
                    </div>
                    {selectedTable.location && (
                      <div>
                        <h4 className="text-lg font-medium text-muted-foreground tracking-wide mb-1 uppercase">Location</h4>
                        <div className="flex items-center gap-2 text-foreground">
                          <MapPin size={20} className="text-primary" />
                          <span className="text-xl font-medium tracking-wide">{selectedTable.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-3xl border border-border shadow-inner">
                    <h4 className="text-lg font-medium text-muted-foreground tracking-wide mb-4 uppercase">Digital Menu</h4>
                    {selectedTable.qrCodeUrl ? (
                      <img
                        src={selectedTable.qrCodeUrl}
                        alt={`QR Code for ${selectedTable.name}`}
                        className="w-48 h-48 rounded-2xl shadow-md bg-card p-3"
                      />
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center bg-card text-muted-foreground rounded-2xl shadow-md">
                        <QrCode size={48} />
                        <p className="text-sm mt-2 tracking-wide uppercase">QR Unavailable</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs tracking-wide">
                      Scan to explore our curated menu and place orders with ease.
                    </p>
                  </div>
                </div>
                <div className="mt-12 text-center">
                  <button 
                    onClick={() => setShowReservationForm(true)}
                    className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-widest bg-primary text-primary-foreground px-10 py-4 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Calendar size={18} />
                    Reserve Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reservation Form Modal */}
        <AnimatePresence>
          {showReservationForm && (
            <ReservationForm 
              onClose={() => setShowReservationForm(false)} 
              preselectedTableId={selectedTable?.id}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}