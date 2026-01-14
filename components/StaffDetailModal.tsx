import React from 'react';
import { Staff, Review } from '../types';
import { X, Star, Scissors, Clock } from 'lucide-react';

interface StaffDetailModalProps {
  staff: Staff;
  reviews: Review[]; // All salon reviews, we will filter inside
  onClose: () => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ staff, reviews, onClose }) => {
  // Filter reviews for this specific staff member
  const staffReviews = reviews.filter(r => r.staffId === staff.id);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Image */}
        <div className="relative h-48 bg-gray-900">
           <img 
            src={staff.image} 
            alt={staff.name} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random&color=fff&size=512`;
            }}
           />
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
             <h2 className="text-2xl font-bold text-white">{staff.name}</h2>
             <p className="text-gray-300 font-medium">{staff.role} • {staff.experience}</p>
           </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          
          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {staff.bio || `Specializing in high-quality services with over ${staff.experience} of experience. Dedicated to providing the best look for every client.`}
            </p>
          </div>

          {/* Specialties */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {staff.specialties.map((spec, idx) => (
                <span key={idx} className="bg-purple-50 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center">
                  <Scissors className="w-3 h-3 mr-1" />
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Reviews ({staffReviews.length})
              </h3>
              {staffReviews.length > 0 && (
                 <div className="flex items-center text-yellow-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {(staffReviews.reduce((acc, r) => acc + r.rating, 0) / staffReviews.length).toFixed(1)}
                 </div>
              )}
            </div>

            {staffReviews.length > 0 ? (
              <div className="space-y-4">
                {staffReviews.map(review => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{review.userName}</span>
                        <span className="text-xs text-gray-400 block">{review.date}</span>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400 text-sm">No specific reviews for this staff member yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;