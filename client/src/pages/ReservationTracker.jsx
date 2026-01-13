import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, X, Info, Timer } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservation, deleteReservation } from '@/store/reservationSlice';

export default function ReservationTracker() {
    const dispatch = useDispatch();
    const { reservation } = useSelector((state) => state.reservation);
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const reservationId = localStorage.getItem('reservation_id');

    // 1. Logic to calculate countdown
    useEffect(() => {
        if (!reservation) return;

        const calculateTime = () => {
            const target = new Date(reservation.reservedAt || reservation.createdAt);
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Happening now');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 24) setTimeLeft(`${Math.floor(hours / 24)}d left`);
            else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`);
            else setTimeLeft(`${minutes}m left`);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [reservation]);

    useEffect(() => {
        if (reservationId && !reservation) {
            dispatch(fetchReservation(reservationId));
        }
        if (reservation) setIsVisible(true);
    }, [dispatch, reservationId, !!reservation]);

    const handleCancel = async () => {
        if (!reservation) return;
        if (window.confirm('Are you sure you want to cancel?')) {
            dispatch(deleteReservation(reservation.id));
            localStorage.removeItem('reservation_id');
            setIsVisible(false);
        }
    };

    if (!reservation || !isVisible) return null;

    const reservationDate = new Date(reservation.reservedAt || reservation.createdAt);

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-amber-500/30 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                {/* Visual Progress Bar (Optional flair) */}
                <div className="absolute top-0 left-0 h-1 bg-amber-500/20 w-full">
                    <div className="h-full bg-amber-500 animate-pulse w-1/3" />
                </div>

                <button onClick={() => setIsVisible(false)} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Confirmed</p>
                    </div>
                    {/* Countdown Badge */}
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
                        <Timer className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-200">{timeLeft}</span>
                    </div>
                </div>

                <h3 className="mb-3 text-lg font-bold text-white leading-tight">{reservation.guestName}</h3>

                <div className="space-y-2.5 mb-5">
                    <div className="flex items-center text-slate-300">
                        <Calendar className="mr-3 h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium">
                            {reservationDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center text-slate-300">
                        <Clock className="mr-3 h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium">
                            {reservationDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleCancel} className="flex-1 rounded-xl bg-red-500/10 px-3 py-2.5 text-[11px] font-bold text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                        Cancel
                    </button>
                    {/* <button className="flex-1 rounded-xl bg-amber-500 px-3 py-2.5 text-[11px] font-black text-slate-900 hover:bg-amber-400 transition-all">
                        Details
                    </button> */}
                </div>
            </div>
        </div>
    );
}