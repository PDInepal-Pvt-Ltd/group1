import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservation, deleteReservation } from '@/store/reservationSlice';

export default function ReservationTracker() {
    const dispatch = useDispatch();
    const { reservation } = useSelector((state) => state.reservation);
    const [isVisible, setIsVisible] = useState(false);
    const reservationId = localStorage.getItem('reservation_id');

    useEffect(() => {
        dispatch(fetchReservation(reservationId || ''));
    }, []);
    const handleCancel = async () => {
        if (!reservation) return;

        if (confirm('Are you sure you want to cancel this reservation?')) {
            dispatch(deleteReservation(reservation.id));
            localStorage.removeItem('reservation_id');
            localStorage.removeItem('reservation_phone');
            setIsVisible(false);
        }
    };

if (!isVisible || !reservation) return null;

const reservationDate = new Date(reservation.createdAt);

return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        <div className="rounded-xl bg-linear-to-br from-slate-800 to-slate-900 p-6 shadow-2xl border border-amber-500/30">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-2 text-slate-400 transition-colors hover:text-white"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <p className="text-sm font-semibold text-white">Upcoming Reservation</p>
            </div>

            <h3 className="mb-4 text-xl font-bold text-white">{reservation.guestName}</h3>

            <div className="space-y-2">
                <div className="flex items-center text-slate-300">
                    <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                        {reservationDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <div className="flex items-center text-slate-300">
                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                        {reservationDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                <div className="flex items-center text-slate-300">
                    <Users className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-sm">{reservation.guests} Guests</span>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleCancel}
                    className="flex-1 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30"
                >
                    Cancel
                </button>
                <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400">
                    View Details
                </button>
            </div>
        </div>
    </div>
);
}