
import React from 'react';
import { ViewState, User } from '../types';
import { Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  setView: (view: ViewState) => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ setView, onOpenAuth, currentUser, onLogout }) => {
  
  const handleProfileClick = () => {
      if (currentUser?.type === 'business') {
          setView(ViewState.BUSINESS_DASHBOARD);
      } else if (currentUser?.type === 'admin') {
          setView(ViewState.ADMIN_DASHBOARD);
      } else if (currentUser?.type === 'customer') {
          setView(ViewState.USER_DASHBOARD);
      }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setView(ViewState.HOME)}
          >
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">GlowBook</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-secondary transition-colors">Treatments</a>
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-secondary transition-colors">Venues</a>
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-secondary transition-colors">For Business</a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
             {currentUser ? (
               <div className="flex items-center gap-3">
                  <div 
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer hover:text-secondary transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-secondary">
                      {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover"/> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <span className="hidden sm:block">{currentUser.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-gray-500 hover:text-red-500"
                  >
                    Log out
                  </button>
               </div>
             ) : (
               <>
                 <button 
                    onClick={onOpenAuth}
                    className="hidden md:block text-sm font-semibold text-gray-600 hover:text-gray-900"
                 >
                    Log In
                 </button>
                 <button 
                    onClick={onOpenAuth}
                    className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                 >
                    Sign Up
                 </button>
               </>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
