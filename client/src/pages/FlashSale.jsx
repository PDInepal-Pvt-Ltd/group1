import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { fetchDailySpecials } from '@/store/surplusSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function FlashSale() {
  const { dailySpecials } = useSelector((state) => state.surplus);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchDailySpecials());
  }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

  return (
    <section className="relative overflow-hidden bg-slate-900 px-4 py-20">
      <div className="absolute inset-0 bg-linear-to-r from-amber-500/10 to-red-500/10" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 animate-pulse text-amber-500" />
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Flash <span className="text-amber-500">Specials</span>
            </h2>
            <Zap className="h-8 w-8 animate-pulse text-amber-500" />
          </div>
          <p className="text-lg text-slate-400">Limited time offers you can't miss</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dailySpecials.map((special) => (
            <SpecialCard key={special.id} special={special} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialCard({ special }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(special.surplusUntil).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [special.surplusUntil]);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-linear-to-br from-slate-800 to-slate-900 transition-all hover:shadow-2xl hover:shadow-amber-500/30">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-amber-500/20 blur-2xl" />

      {special.menuItem.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={special.menuItem.imageUrl}
            alt={special.menuItem.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />
        </div>
      )}

      <div className="relative p-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white">{special.menuItem.name}</h3>
          <div className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
            -{special.discountPct}%
          </div>
        </div>

        <p className="mb-4 text-slate-400">{special.menuItem.description}</p>

        <div className="flex items-center text-sm text-amber-500">
          <Clock className="mr-2 h-4 w-4" />
          {timeLeft}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 to-red-500" />
    </div>
  );
}