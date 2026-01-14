
import React, { useState, useEffect } from 'react';
import { X, Star, Gift, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Feedback) => void;
  initialUserType?: 'customer' | 'business';
}

const CUSTOMER_OPTIONS = {
    q1: ['Beautiful Interface', 'Fast Search', 'Clear Information', 'Instant Confirmation', 'Quality of Salons', 'Other'],
    q2: ['None', 'Slow Loading', 'Confusing Navigation', 'Login Issues', 'Booking Errors', 'Other'],
    q3: ['Yes, absolutely', 'Yes, but need more reviews', 'No, looks fake', 'Maybe, if payment is secure', 'Other'],
    q4: ['Loyalty Points', 'Chat with Stylist', 'Video Call Consultation', 'Home Service', 'Dark Mode', 'Other']
};

const BUSINESS_OPTIONS = {
    q1: ['Staff Management', 'Revenue Stats', 'Auto Email', 'CRM (Customer Profile)', 'Inventory', 'Other'],
    q2: ['Mobile App', 'Desktop/Laptop', 'Tablet', 'Both equally', 'Other'],
    q3: ['Commission per booking', 'Monthly Subscription', 'Freemium', 'Prepaid Credits', 'Other'],
    q4: ['Inventory Management', 'Payroll', 'Marketing Tools', 'POS Integration', 'SMS Marketing', 'Other']
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, initialUserType = 'customer' }) => {
  const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
  const [userType, setUserType] = useState<'customer' | 'business'>(initialUserType);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // State to hold the selection
  const [selections, setSelections] = useState({
      q1: '', q2: '', q3: '', q4: ''
  });
  // State to hold the custom text input if "Other" is selected
  const [customInputs, setCustomInputs] = useState({
      q1: '', q2: '', q3: '', q4: ''
  });

  const options = userType === 'customer' ? CUSTOMER_OPTIONS : BUSINESS_OPTIONS;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
        setError("Please select a star rating (1-5).");
        return;
    }

    // Check if all dropdowns are selected
    if (!selections.q1 || !selections.q2 || !selections.q3 || !selections.q4) {
        setError("Please answer all questions.");
        return;
    }

    // Check if 'Other' is selected but input is empty
    if ((selections.q1 === 'Other' && !customInputs.q1.trim()) ||
        (selections.q2 === 'Other' && !customInputs.q2.trim()) ||
        (selections.q3 === 'Other' && !customInputs.q3.trim()) ||
        (selections.q4 === 'Other' && !customInputs.q4.trim())) {
        setError("Please provide details for the 'Other' options selected.");
        return;
    }

    setError(null);

    // Combine selection and custom input
    const finalAnswers = {
        q1: selections.q1 === 'Other' ? (customInputs.q1 || 'Other') : selections.q1,
        q2: selections.q2 === 'Other' ? (customInputs.q2 || 'Other') : selections.q2,
        q3: selections.q3 === 'Other' ? (customInputs.q3 || 'Other') : selections.q3,
        q4: selections.q4 === 'Other' ? (customInputs.q4 || 'Other') : selections.q4,
    };

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      userType,
      rating,
      ...finalAnswers,
      timestamp: new Date().toLocaleString(),
    };
    onSubmit(newFeedback);
    setStep('success');
  };

  const reset = () => {
    setStep('type');
    setRating(0);
    setError(null);
    setSelections({ q1: '', q2: '', q3: '', q4: '' });
    setCustomInputs({ q1: '', q2: '', q3: '', q4: '' });
    onClose();
  };

  const handleSelectionChange = (key: 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
      setSelections(prev => ({ ...prev, [key]: value }));
      if (error) setError(null); // Clear error on interaction
  };

  const handleCustomInputChange = (key: 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
      setCustomInputs(prev => ({ ...prev, [key]: value }));
      if (error) setError(null);
  };

  const renderSelectGroup = (
      question: string, 
      key: 'q1' | 'q2' | 'q3' | 'q4', 
      optionsList: string[], 
      placeholder: string
  ) => (
      <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{question}</label>
          <select 
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary mb-2 bg-white"
              value={selections[key]}
              onChange={(e) => handleSelectionChange(key, e.target.value)}
          >
              <option value="">Select an option...</option>
              {optionsList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          
          {selections[key] === 'Other' && (
              <input 
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary bg-gray-50 animate-fade-in"
                  placeholder={placeholder}
                  value={customInputs[key]}
                  onChange={(e) => handleCustomInputChange(key, e.target.value)}
              />
          )}
      </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button onClick={reset} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* STEP 1: SELECT TYPE */}
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
                    ? 'How would you rate your booking experience? (1-5)' 
                    : 'Does this dashboard save you time? (1-10)'}
                </label>
                <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => { setRating(star); if(error) setError(null); }}
                       className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                     >
                       <Star className="w-8 h-8 fill-current" />
                     </button>
                   ))}
                   {userType === 'business' && <span className="text-xs text-gray-400 flex items-center ml-2">(Scaled to 5 for UI)</span>}
                </div>
              </div>

              {renderSelectGroup(
                  userType === 'customer' ? 'What did you like most?' : 'Most important feature for you?',
                  'q1',
                  options.q1,
                  'Please tell us more...'
              )}

              {renderSelectGroup(
                  userType === 'customer' ? 'Did you face any difficulties?' : 'Do you prefer Mobile or PC?',
                  'q2',
                  options.q2,
                  'Please describe the issue...'
              )}

              {renderSelectGroup(
                  userType === 'customer' ? 'Would you trust this site for a real booking?' : 'Preferred payment model?',
                  'q3',
                  options.q3,
                  'Why or why not?'
              )}

              {renderSelectGroup(
                  userType === 'customer' ? 'What feature should we add?' : 'What is missing for long-term use?',
                  'q4',
                  options.q4,
                  'Your suggestion...'
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
              )}

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
