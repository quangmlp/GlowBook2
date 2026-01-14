
import React from 'react';
import { ViewState } from '../types';
import { Search, Calendar, Heart, User } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.HOME, label: 'Search', icon: Search },
    { id: ViewState.SAVED, label: 'Saved', icon: Heart },
    { id: ViewState.USER_DASHBOARD, label: 'My Page', icon: User }, // Direct to User Dashboard
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-40 flex justify-between items-center pb-safe">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.label}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center space-y-1 ${
              isActive ? 'text-secondary' : 'text-gray-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
