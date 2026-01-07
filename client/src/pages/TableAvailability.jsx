import { useEffect, useState, useRef } from 'react';
import { Circle, Users, Calendar, Clock, MapPin, X, QrCode, RefreshCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables } from '@/store/tableSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function TableAvailability() {
  const dispatch = useDispatch();
  const { tables, loading } = useSelector((state) => state.table);
  const [filter, setFilter] = useState('AVAILABLE'); // Default to AVAILABLE for customer focus
  const [selectedTable, setSelectedTable] = useState(null);
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
    <section className="relative min-h-screen w-full px-4 py-16 overflow-hidden bg-gradient-to-b from-background to-background flex flex-col justify-start font-serif">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="relative z-10 mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-5xl font-light tracking-wide text-foreground">
              Table <span className="font-bold italic text-amber-300">Availability</span>
            </h2>
            <p className="text-lg text-muted-foreground">Discover and reserve your perfect table</p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full md:w-auto md:items-end">
            <input
              type="text"
              placeholder="Search tables by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 px-5 py-3 bg-muted/50 border border-border rounded-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-amber-400 transition-colors shadow-md"
            />
            <div className="flex p-1 bg-muted/50 border border-border rounded-full shadow-md">
              {['AVAILABLE', 'ALL'].map((mode) => ( // Reordered for customer priority
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`relative px-6 py-2 text-xs font-semibold tracking-wide transition-all rounded-full ${
                    filter === mode ? 'text-black bg-amber-300' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={filter === mode}
                >
                  {filter === mode && (
                    <motion.div layoutId="pill" className="absolute inset-0 bg-amber-300 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
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
              <RefreshCcw className="text-amber-400" size={32} />
            </motion.div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-xl">No tables match your search.</p>
            <p className="text-sm mt-2">Please try different criteria.</p>
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
                  className="group relative flex flex-col justify-between h-72 overflow-hidden rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-lg p-6 transition-all hover:border-amber-400/50 hover:bg-muted/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
                  aria-label={`View details for ${table.name}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-light text-foreground tracking-wide">{table.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <Clock size={14} />
                        <span className="text-xs">Updated {new Date(table.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
                      table.status === 'AVAILABLE' ? 'border-amber-400/50 text-amber-300 bg-amber-400/10' : 
                      table.status === 'OCCUPIED' ? 'border-red-400/50 text-red-300 bg-red-400/10' :
                      table.status === 'RESERVED' ? 'border-orange-400/50 text-orange-300 bg-orange-400/10' :
                      'border-muted-foreground/50 text-muted-foreground bg-muted-foreground/10'
                    }`}>
                      {table.status}
                    </div>
                  </div>

                  {/* Simplified Seat Info */}
                  <div className="my-8 text-center">
                    <Users size={48} className="mx-auto text-muted-foreground group-hover:text-amber-300 transition-colors" />
                    <span className="block mt-2 text-xl font-medium text-foreground">{table.seats} Seats</span>
                  </div>

                  <div className="flex items-center justify-center pt-4 border-t border-border/50">
                    <button className="text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Centered Modal for Better UX */}
        <AnimatePresence>
          {selectedTable && (
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
                className="w-full max-w-3xl bg-background/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8 lg:p-10 overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-4xl font-light text-foreground tracking-wide">{selectedTable.name}</h3>
                  <button onClick={() => setSelectedTable(null)} className="text-muted-foreground hover:text-amber-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400" aria-label="Close modal">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-muted-foreground mb-1">Status</h4>
                      <p className={`text-2xl font-bold ${
                        selectedTable.status === 'AVAILABLE' ? 'text-amber-300' :
                        selectedTable.status === 'OCCUPIED' ? 'text-red-300' :
                        selectedTable.status === 'RESERVED' ? 'text-orange-300' :
                        'text-muted-foreground'
                      }`}>
                        {selectedTable.status}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-muted-foreground mb-1">Capacity</h4>
                      <div className="flex items-center gap-2 text-foreground">
                        <Users size={20} />
                        <span className="text-xl font-medium">{selectedTable.seats} Guests</span>
                      </div>
                    </div>

                    {/* Hide waiter for customer view */}
                    {/* Optional: Add location if available */}
                    {selectedTable.location && (
                      <div>
                        <h4 className="text-lg font-medium text-muted-foreground mb-1">Location</h4>
                        <div className="flex items-center gap-2 text-foreground">
                          <MapPin size={20} />
                          <span className="text-xl font-medium">{selectedTable.location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl border border-border">
                    <h4 className="text-lg font-medium text-muted-foreground mb-4">Digital Menu</h4>
                    {selectedTable.qrCodeUrl ? (
                      <img 
                        src={selectedTable.qrCodeUrl} 
                        alt={`QR Code for ${selectedTable.name}`} 
                        className="w-40 h-40 rounded-xl shadow-md bg-primary-foreground p-2" 
                      />
                    ) : (
                      <div className="w-40 h-40 flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-xl">
                        <QrCode size={48} />
                        <p className="text-sm mt-2">QR Code unavailable</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
                      Scan to access our exquisite menu and place orders seamlessly.
                    </p>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <button className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-widest bg-amber-400 text-black px-8 py-4 rounded-full hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                    <Calendar size={18} />
                    Reserve Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}