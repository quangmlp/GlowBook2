
import React, { useState } from 'react';
import { Appointment } from '../types';
import { X, Star, Send, Camera, Scissors } from 'lucide-react';

interface SalonReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSubmit: (id: string, rating: number, comment: string) => void;
}

const SalonReviewModal: React.FC<SalonReviewModalProps> = ({ isOpen, onClose, appointment, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(appointment.id, rating, comment);
    reset();
  };

  const reset = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Review your experience</h3>
                <p className="text-gray-500 text-sm mt-1">{appointment.salonName} • {appointment.date}</p>
            </div>
            <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Service Summary */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-secondary">
                    <Scissors className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-bold text-gray-900">{appointment.serviceName}</div>
                    <div className="text-xs text-gray-500">Performed by an expert stylist</div>
                </div>
            </div>

            {/* Rating */}
            <div className="text-center">
                <label className="block text-sm font-bold text-gray-700 mb-3">How was your cut?</label>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star 
                                className={`w-10 h-10 ${
                                    (hoveredStar || rating) >= star 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                            />
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating > 0 ? "Poor" : "Tap a star to rate"}
                </p>
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Write a review (Optional)</label>
                <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the atmosphere, the staff, or the result..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary min-h-[100px] resize-none text-sm"
                />
            </div>

            {/* Mock Photo Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-secondary hover:bg-purple-50 hover:text-secondary transition-all cursor-pointer">
                <Camera className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Add a photo of your new look</span>
            </div>

            {/* Actions */}
            <button 
                type="submit"
                disabled={rating === 0}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                <Send className="w-4 h-4" /> Submit Review
            </button>
        </form>
      </div>
    </div>
  );
};

export default SalonReviewModal;
