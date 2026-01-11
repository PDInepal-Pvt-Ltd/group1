import { useEffect, useState, useMemo, useRef } from 'react';
import { Users, Calendar, Armchair, Users2, AlertCircle, Timer, Clock, MapPin, X, QrCode, RefreshCcw, User, Phone, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createReservation } from '@/store/reservationSlice';
import { fetchTables } from '@/store/tableSlice';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants= {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      ease: 'easeInOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      type: 'spring',
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 50,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

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

  const maxCapacity = useMemo(() => {
    if (!tables?.length) return 10;
    return Math.max(...tables.map(t => t.seats || 0));
  }, [tables]);

  const availableTables = useMemo(() => {
    if (!tables) return [];
    return tables
      .filter(table => table.seats >= Number(formData.guests) && table.status === "AVAILABLE")
      .sort((a, b) => a.seats - b.seats);
  }, [tables, formData.guests]);

  useEffect(() => {
    if (preselectedTableId) {
      setFormData(prev => ({ ...prev, tableId: preselectedTableId }));
    } else if (availableTables.length > 0) {
      setFormData(prev => ({ ...prev, tableId: availableTables[0].id }));
    }
  }, [availableTables, preselectedTableId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tableId) {
      setError('Please select a table.');
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
      setError(err.message || 'Reservation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
      >
        <div className="relative w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl border border-border/50 text-center">
          <motion.div variants={itemVariants} className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.h2 variants={itemVariants} className="mb-2 text-2xl font-light text-foreground tracking-wide">Table Reserved</motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-base">We await your arrival.</motion.p>
          <motion.div variants={itemVariants} className="rounded-xl bg-muted/50 p-4 mb-6 border border-border/50">
            <p className="text-xs uppercase font-medium tracking-wider text-muted-foreground mb-1">Reference</p>
            <p className="text-primary font-medium text-base uppercase">{reservationId}</p>
          </motion.div>
          <motion.button 
            onClick={onClose} 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground hover:opacity-90 shadow-md shadow-primary/10 transition-all"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card shadow-2xl border border-border/50 overflow-hidden transition-all">
        <motion.div variants={itemVariants} className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
          <div>
            <h2 className="text-xl font-light text-foreground tracking-wide">Reserve a Table</h2>
            <p className="text-xs text-muted-foreground tracking-wider">Exquisite Dining Awaits</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </motion.div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2">
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70">
                <User className="h-3 w-3" /> Name
              </label>
              <input required type="text" className="w-full rounded-xl bg-input border border-border/50 p-2.5 text-foreground text-sm outline-none focus:border-primary transition-all" 
                value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} placeholder="Your Name" />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70">
                <Phone className="h-3 w-3" /> Phone
              </label>
              <input required type="tel" className="w-full rounded-xl bg-input border border-border/50 p-2.5 text-foreground text-sm outline-none focus:border-primary transition-all" 
                value={formData.guestPhone} onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })} placeholder="Phone Number" />
            </motion.div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-3 grid-cols-3">
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70"><Calendar className="h-3 w-3" /> Date</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} 
                className="w-full rounded-xl bg-input border border-border/50 p-2.5 text-foreground text-sm outline-none focus:border-primary" 
                value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70"><Clock className="h-3 w-3" /> Time</label>
              <input required type="time" 
                className="w-full rounded-xl bg-input border border-border/50 p-2.5 text-foreground text-sm outline-none focus:border-primary" 
                value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70"><Users className="h-3 w-3" /> Guests</label>
              <div className="relative">
                <select 
                  className="w-full rounded-xl bg-input border border-border/50 p-2.5 text-foreground text-sm outline-none focus:border-primary appearance-none cursor-pointer" 
                  value={formData.guests} 
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                >
                  {[...Array(maxCapacity)].map((_, i) => (
                    <option key={i+1} value={i+1}>
                      {i+1} {i === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium flex items-center gap-1 text-foreground/70">
                <Timer className="h-3 w-3 text-primary" /> Duration
              </label>
              <span className="text-xs text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                {Math.floor(formData.durationMin / 60)}h {formData.durationMin % 60}m
              </span>
            </div>
            <input 
              type="range" min="30" max="240" step="30" 
              className="w-full h-1 bg-muted/50 rounded-full appearance-none cursor-pointer accent-primary"
              value={formData.durationMin}
              onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/70 px-0.5">
              <span>30m</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h</span>
              <span>4h</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1 text-foreground/70">
              <Armchair className="h-3 w-3 text-primary" /> Table
            </label>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-4 gap-2">
              {availableTables.length === 0 ? (
                <div className="col-span-4 py-4 text-center bg-muted/10 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground">No tables available.</p>
                </div>
              ) : (
                availableTables.map((table) => {
                  const isSelected = formData.tableId === table.id;
                  return (
                    <motion.button
                      key={table.id}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => setFormData({ ...formData, tableId: table.id })}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-input hover:border-primary/50'}
                      `}
                    >
                      <span className={`text-xs uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {table.name}
                      </span>
                      <span className="text-base text-foreground">{table.seats}</span>
                      <span className="text-[10px] text-muted-foreground/50 uppercase">Seats</span>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 rounded-xl bg-destructive/5 border border-destructive/10 p-2 text-destructive text-xs">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting || !formData.tableId}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full rounded-xl bg-primary py-3 text-base font-medium text-primary-foreground shadow-md shadow-primary/10 transition-all hover:translate-y-[-1px] hover:shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Reserving...' : 'Reserve Now'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

export default function TableAvailability() {
  const dispatch = useDispatch();
  const { tables, loading } = useSelector((state) => state.table);
  const [filter, setFilter] = useState('AVAILABLE');
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
    <section className="relative min-h-screen w-full px-4 py-12 overflow-hidden bg-gradient-to-br from-background to-muted flex flex-col justify-start font-serif">
      <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'url("https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="relative z-10 mx-auto max-w-[1280px] w-full p-8 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10 flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center">
          <motion.div variants={itemVariants} className="space-y-1 text-center md:text-left">
            <h2 className="text-4xl font-light tracking-widest text-foreground uppercase">
              Table <span className="font-medium italic text-primary">Reservations</span>
            </h2>
            <p className="text-base text-muted-foreground tracking-wide">Indulge in Luxury</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 w-full md:w-auto md:items-end">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 px-5 py-2 bg-card border border-border/50 rounded-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-md"
            />
            <div className="flex p-1 bg-card border border-border/50 rounded-full shadow-md">
              {['AVAILABLE', 'ALL'].map((mode) => (
                <motion.button
                  key={mode}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setFilter(mode)}
                  className={`relative px-5 py-1 text-xs font-medium tracking-widest uppercase transition-all rounded-full ${
                    filter === mode ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <motion.div layoutId="pill" className="absolute inset-0 bg-primary rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  <span className="relative z-10">{mode}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCcw className="text-primary" size={28} />
            </motion.div>
          </div>
        ) : filteredTables.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-muted-foreground py-12">
            <p className="text-lg tracking-wide">No tables found.</p>
            <p className="text-sm mt-1 tracking-wide">Adjust your search.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence mode="popLayout">
              {filteredTables.map((table) => (
                <motion.button
                  key={table.id}
                  layout
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTable(table)}
                  className="group relative flex flex-col justify-between h-72 overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-primary hover:bg-muted/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-light text-foreground tracking-widest uppercase">{table.name}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase border border-opacity-50 ${
                      table.status === 'AVAILABLE' ? 'border-primary text-primary bg-primary/5' :
                      table.status === 'OCCUPIED' ? 'border-destructive text-destructive bg-destructive/5' :
                      table.status === 'RESERVED' ? 'border-secondary text-secondary-foreground bg-secondary/5' :
                      'border-muted text-muted-foreground bg-muted/5'
                    }`}>
                      {table.status}
                    </div>
                  </div>
                  <div className="my-6 text-center">
                    <Users size={40} className="mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="block mt-2 text-lg text-foreground tracking-wide">{table.seats} Seats</span>
                  </div>
                  <div className="flex items-center justify-center pt-3 border-t border-border/30">
                    <span className="text-xs font-medium text-primary group-hover:text-primary/80 transition-colors tracking-widest uppercase">
                      Details
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedTable && !showReservationForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md"
            >
              <motion.div
                ref={modalRef}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl shadow-primary/5 p-6 max-h-[80vh] overflow-hidden"
              >
                <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-light text-foreground tracking-widest uppercase">{selectedTable.name}</h3>
                  <button onClick={() => setSelectedTable(null)} className="text-muted-foreground hover:text-primary p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-primary">
                    <X size={20} />
                  </button>
                </motion.div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Status</h4>
                      <p className={`text-lg font-medium tracking-wide uppercase ${
                        selectedTable.status === 'AVAILABLE' ? 'text-primary' :
                        selectedTable.status === 'OCCUPIED' ? 'text-destructive' :
                        selectedTable.status === 'RESERVED' ? 'text-secondary-foreground' :
                        'text-muted-foreground'
                      }`}>
                        {selectedTable.status}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Capacity</h4>
                      <div className="flex items-center gap-2 text-foreground">
                        <Users size={16} className="text-primary" />
                        <span className="text-base tracking-wide">{selectedTable.seats} Guests</span>
                      </div>
                    </div>
                    {selectedTable.location && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Location</h4>
                        <div className="flex items-center gap-2 text-foreground">
                          <MapPin size={16} className="text-primary" />
                          <span className="text-base tracking-wide">{selectedTable.location}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-2xl border border-border/50">
                    <h4 className="text-sm font-medium text-muted-foreground tracking-wide uppercase mb-2">Menu QR</h4>
                    {selectedTable.qrCodeUrl ? (
                      <img
                        src={selectedTable.qrCodeUrl}
                        alt={`QR for ${selectedTable.name}`}
                        className="w-32 h-32 rounded-xl shadow-md bg-card p-1"
                      />
                    ) : (
                      <div className="w-32 h-32 flex flex-col items-center justify-center bg-card text-muted-foreground rounded-xl shadow-md">
                        <QrCode size={32} />
                        <p className="text-xs mt-1 uppercase">Unavailable</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 text-center tracking-wide">
                      Scan for menu.
                    </p>
                  </motion.div>
                </motion.div>
                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <motion.button 
                    onClick={() => setShowReservationForm(true)}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/10"
                  >
                    <Calendar size={14} />
                    Reserve
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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