import React, { useState } from 'react';
import { X, Star, Gift, Send, CheckCircle } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Feedback) => void;
  initialUserType?: 'customer' | 'business';
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, initialUserType = 'customer' }) => {
  const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
  const [userType, setUserType] = useState<'customer' | 'business'>(initialUserType);
  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState({
    q1: '', // Feature/Useful
    q2: '', // Pain/Core
    q3: '', // Trust/Device
    q4: '', // Wishlist/Missing
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      userType,
      rating,
      ...answers,
      timestamp: new Date().toLocaleString(),
    };
    onSubmit(newFeedback);
    setStep('success');
  };

  const reset = () => {
    setStep('type');
    setRating(0);
    setAnswers({ q1: '', q2: '', q3: '', q4: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button onClick={reset} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* STEP 1: SELECT TYPE (Skip if pre-defined or just user selection) */}
        {step === 'type' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-secondary">
              <Gift className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Help us improve & Get Rewards!</h2>
            <p className="text-gray-500">Tell us about your experience to unlock a <strong>30% Discount</strong> or <strong>VIP Status</strong>.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button 
                onClick={() => { setUserType('customer'); setStep('form'); }}
                className="p-4 border-2 border-gray-100 rounded-xl hover:border-secondary hover:bg-purple-50 transition-all font-bold text-gray-700"
              >
                I am a Customer
              </button>
              <button 
                onClick={() => { setUserType('business'); setStep('form'); }}
                className="p-4 border-2 border-gray-100 rounded-xl hover:border-secondary hover:bg-purple-50 transition-all font-bold text-gray-700"
              >
                I own a Salon
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FORM */}
        {step === 'form' && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {userType === 'customer' ? 'Customer Feedback' : 'Partner Feedback'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Question 1: Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {userType === 'customer' 
                    ? 'How would you rate your booking experience? (1-5 stars)' 
                    : 'Does this dashboard save you time? (1-10)'}
                </label>
                <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => setRating(star)}
                       className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                     >
                       <Star className="w-8 h-8 fill-current" />
                     </button>
                   ))}
                   {userType === 'business' && <span className="text-xs text-gray-400 flex items-center ml-2">(Scale scaled to 5 for UI)</span>}
                </div>
              </div>

              {/* Question 2: Multiple Choice */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                   {userType === 'customer' 
                    ? 'What did you like most?' 
                    : 'Most important feature for you?'}
                </label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary"
                  required
                  value={answers.q1}
                  onChange={(e) => setAnswers({...answers, q1: e.target.value})}
                >
                  <option value="">Select an option</option>
                  {userType === 'customer' ? (
                    <>
                      <option value="Beautiful Interface">Beautiful Interface</option>
                      <option value="Fast Search">Fast Search</option>
                      <option value="Clear Info">Clear Information</option>
                      <option value="Instant Confirmation">Instant Confirmation</option>
                    </>
                  ) : (
                    <>
                      <option value="Staff Management">Staff Management</option>
                      <option value="Revenue Stats">Revenue Statistics</option>
                      <option value="Auto Email">Automated Emails</option>
                      <option value="CRM">Customer Profile (CRM)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Question 3: Text Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                   {userType === 'customer' 
                    ? 'Did you face any difficulties?' 
                    : 'Do you prefer Mobile or PC for management?'}
                </label>
                <input 
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary"
                  placeholder={userType === 'customer' ? 'e.g., Slow loading...' : 'Mobile / PC'}
                  required
                  value={answers.q2}
                  onChange={(e) => setAnswers({...answers, q2: e.target.value})}
                />
              </div>

              {/* Question 4: Trust/Payment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                   {userType === 'customer' 
                    ? 'Would you trust this site for a real booking?' 
                    : 'Preferred payment model?'}
                </label>
                <input 
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary"
                  placeholder={userType === 'customer' ? 'Yes/No - Why?' : 'Monthly Subscription / Per Booking'}
                  required
                  value={answers.q3}
                  onChange={(e) => setAnswers({...answers, q3: e.target.value})}
                />
              </div>

              {/* Question 5: Wishlist */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                   {userType === 'customer' 
                    ? 'What feature should we add?' 
                    : 'What is missing for you to use this long-term?'}
                </label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary h-24"
                  placeholder="Your suggestions..."
                  required
                  value={answers.q4}
                  onChange={(e) => setAnswers({...answers, q4: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" /> Send Feedback
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS & REWARD */}
        {step === 'success' && (
           <div className="p-8 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-500">Your feedback helps us grow. Here is your reward:</p>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border border-purple-200 relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-xs font-bold text-purple-600 uppercase mb-1">
                        {userType === 'customer' ? 'Voucher Code' : 'VIP Access'}
                    </p>
                    <div className="text-3xl font-mono font-bold text-gray-900 bg-white/50 inline-block px-4 py-2 rounded-lg border border-dashed border-gray-400">
                        {userType === 'customer' ? 'GLOW30' : 'VIP6MONTHS'}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {userType === 'customer' ? 'Use at checkout for 30% off.' : 'Free premium features for 6 months.'}
                    </p>
                 </div>
                 <Gift className="absolute -right-4 -bottom-4 w-24 h-24 text-white/40 rotate-12" />
              </div>

              <button 
                onClick={reset}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Close & Continue
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;