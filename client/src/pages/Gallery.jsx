import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const galleryImages = [
  {
    url: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Elegant Dining Room',
  },
  {
    url: 'https://images.pexels.com/photos/3201921/pexels-photo-3201921.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Bar & Lounge',
  },
  {
    url: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Private Dining',
  },
  {
    url: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Patio Seating',
  },
  {
    url: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Chef at Work',
  },
  {
    url: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Intimate Atmosphere',
  },
];

export default function Gallery() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative bg-background px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            Experience the <span className="text-amber-500">Atmosphere</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Step inside and discover our elegant spaces
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-muted hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-muted hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative shrink-0 overflow-hidden rounded-xl"
                style={{ width: '400px', height: '500px' }}
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-foreground">{image.caption}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Scroll to explore more</p>
        </div>
      </div>
    </section>
  );
}