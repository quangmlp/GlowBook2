import React, { useState } from 'react';
import { Search, MapPin, Calendar, Crosshair } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, location: string, date: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Mock returning the HUST area if we are in demo mode or simulating
        const { latitude, longitude } = position.coords;
        setLocation(`Bach Khoa, Hanoi`); 
        setIsLocating(false);
      },
      () => {
        // Fallback or alert
        // For demo purposes, we can autofill specific area
        setLocation(`Bach Khoa, Hanoi`);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = () => {
    onSearch(query, location, date);
  };

  return (
    <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center max-w-4xl mx-auto ring-1 ring-gray-100 relative z-20">
      
      {/* Search Input */}
      <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100 flex items-center">
        <Search className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
        <div className="text-left w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Treatment or venue</p>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hair, Nails, Massage..." 
              className="w-full text-base font-semibold text-gray-900 placeholder-gray-400 focus:outline-none" 
            />
        </div>
      </div>

      {/* Location Input */}
      <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100 flex items-center group relative">
        <MapPin className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
        <div className="text-left w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
            <div className="flex items-center">
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bach Khoa, Hanoi" 
                  className="w-full text-base font-semibold text-gray-900 placeholder-gray-400 focus:outline-none" 
                />
                <button 
                  onClick={handleCurrentLocation}
                  className="ml-2 p-1.5 text-gray-400 hover:text-secondary hover:bg-purple-50 rounded-full transition-colors"
                  title="Use current location"
                >
                  <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
      </div>

      {/* Date Input */}
      <div className="px-4 py-3 flex items-center md:w-64 border-b md:border-b-0">
          <Calendar className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
          <div className="text-left w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date & Time</p>
            <input 
              type="datetime-local" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
            />
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-2">
          <button 
            onClick={handleSubmit}
            className="w-full md:w-auto bg-secondary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Search
          </button>
      </div>
    </div>
  );
};

export default SearchBar;