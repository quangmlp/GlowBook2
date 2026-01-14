import React from 'react';
import { Salon } from '../types';
import { Star, MapPin, Heart, Users } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  onClick: (salon: Salon) => void;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon, onClick, onToggleFavorite }) => {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(salon)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={salon.image} 
          alt={salon.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800";
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-primary uppercase tracking-wide shadow-sm">
          {salon.category}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite && onToggleFavorite(e, salon.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-colors shadow-sm"
        >
          <Heart 
            className={`w-5 h-5 ${salon.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Live Status Badge */}
        <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1 backdrop-blur-md ${
             salon.currentOccupancy > 80 ? 'bg-red-500/90 text-white' : 
             salon.currentOccupancy > 40 ? 'bg-yellow-400/90 text-black' : 
             'bg-green-500/90 text-white'
        }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${salon.currentOccupancy > 40 ? 'bg-black' : 'bg-white'}`}></div>
            {salon.currentOccupancy > 80 ? 'Busy' : salon.currentOccupancy > 40 ? 'Moderate' : 'Quiet'}
        </div>

        {/* Discount Badge */}
        {salon.discount && (
          <div className="absolute bottom-3 left-3 bg-secondary/90 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-md">
            Save {salon.discount}%
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{salon.name}</h3>
            <div className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded text-xs font-bold text-primary border border-gray-100">
                <span className="mr-1">{salon.rating}</span>
                <Star className="w-3 h-3 fill-primary text-primary" />
            </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <span className="text-gray-400 mr-2">({salon.reviewCount} reviews)</span>
          <span className="text-gray-300">•</span>
          <span className="ml-2 truncate">{salon.location}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium uppercase">Seats</span>
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                     <Users className="w-3 h-3 text-secondary" />
                     {salon.availableSeats} open
                </span>
            </div>
            <button className="bg-secondary/10 text-secondary px-4 py-2 rounded-lg text-sm font-bold hover:bg-secondary hover:text-white transition-all">
                Book
            </button>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;