import React from 'react';
import { Review } from '../types';
import { Star } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-primary">Customer Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
              </div>
              <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-gray-200">
                 <span className="font-bold text-primary text-sm mr-1">{review.rating}</span>
                 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;