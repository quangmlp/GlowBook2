import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface FloatingFeedbackButtonProps {
  onClick: () => void;
}

const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-24 right-6 md:bottom-6 md:right-24 z-40 bg-white text-gray-900 p-3 pr-5 pl-4 rounded-full shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group"
    >
      <div className="bg-secondary/10 p-1.5 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors text-secondary">
        <MessageSquarePlus className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm">Feedback</span>
    </button>
  );
};

export default FloatingFeedbackButton;