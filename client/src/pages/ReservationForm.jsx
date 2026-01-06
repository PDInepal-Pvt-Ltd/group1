import { useState } from 'react';
import { X, Calendar, Clock, Users, Phone, User, CheckCircle2 } from 'lucide-react';
import { createReservation } from '@/store/reservationSlice';
import { useDispatch } from 'react-redux';

export default function ReservationForm({ onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const reservedAt = new Date(`${formData.date}T${formData.time}`).toISOString();

      const data = await dispatch(createReservation({ ...formData, reservedAt })).unwrap();
      if (data) {
        setReservationId(data.id);
        localStorage.setItem('reservation_id', data.id);
        localStorage.setItem('reservation_phone', formData.guestPhone);
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Failed to create reservation. Please try again.');
      console.error('Reservation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">Reservation Confirmed!</h2>
            <p className="mb-6 text-slate-300">
              We've received your reservation request. You'll receive a confirmation shortly.
            </p>

            <div className="w-full rounded-lg bg-slate-800/50 p-4 text-left">
              <p className="mb-2 text-sm text-slate-400">Reservation ID</p>
              <p className="font-mono text-sm text-amber-500">{reservationId}</p>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              This ID has been saved to your device. You can use it to manage your reservation.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-amber-400"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-3xl font-bold text-white">Reserve Your Table</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
                <User className="mr-2 h-4 w-4" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
                <Phone className="mr-2 h-4 w-4" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
                <Calendar className="mr-2 h-4 w-4" />
                Date
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
                <Clock className="mr-2 h-4 w-4" />
                Time
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
                <Users className="mr-2 h-4 w-4" />
                Guests
              </label>
              <select
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-slate-300">
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Dietary restrictions, allergies, special occasions..."
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-amber-500 px-6 py-4 text-lg font-semibold text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}