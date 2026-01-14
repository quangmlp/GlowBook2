import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SalonCard from './SalonCard';
import { Salon } from '../types';

interface HorizontalScrollListProps {
  title: string;
  icon: React.ElementType;
  items: Salon[];
  onItemClick: (salon: Salon) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const HorizontalScrollList: React.FC<HorizontalScrollListProps> = ({ 
  title, 
  icon: Icon, 
  items, 
  onItemClick, 
  onToggleFavorite 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; // Width of card + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="py-4 relative group/list">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Icon className="text-secondary w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-primary opacity-0 group-hover/list:opacity-100 transition-opacity disabled:opacity-0 hover:bg-gray-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-5 pb-4 px-1 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((salon) => (
            <div key={salon.id} className="min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] snap-start">
              <SalonCard 
                salon={salon} 
                onClick={onItemClick} 
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-primary opacity-0 group-hover/list:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollList;