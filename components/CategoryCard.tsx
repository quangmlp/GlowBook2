import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon: Icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all w-full aspect-square group"
    >
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-secondary/10 transition-colors">
        <Icon className="w-6 h-6 text-gray-600 group-hover:text-secondary transition-colors" />
      </div>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-primary">{label}</span>
    </button>
  );
};

export default CategoryCard;