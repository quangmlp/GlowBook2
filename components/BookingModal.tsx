import React, { useState, useEffect } from 'react';
import { Service, Salon, Staff } from '../types';
import { X, CheckCircle, Clock, User, ChevronRight, Loader2, Mail, MessageSquarePlus } from 'lucide-react';
import { sendBookingConfirmationEmail } from '../services/email';

interface BookingModalProps {
  service: Service;
  salon: Salon;
  onClose: () => void;
  onOpenFeedback: () => void; // New Prop to trigger feedback
}

const BookingModal: React.FC<BookingModalProps> = ({ service, salon, onClose, onOpenFeedback }) => {
  // Steps: 1=Time, 2=Staff, 3=Review, 4=Success
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Staff Selection State
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // null means "No Preference"
  const [isRandomStaff, setIsRandomStaff] = useState(false);

  // Booking/Email State
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Simple input for demo if not logged in

  const dates = ['Today', 'Tomorrow', 'Wed 25', 'Thu 26'];
  const times = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

  // Simulate fetching available staff when time changes
  useEffect(() => {
    if (selectedDate && selectedTime && salon.staff) {
      // Logic: Randomly filter staff to simulate "some are booked"
      // Always include at least 2 staff members for the demo
      const simulatedAvailable = salon.staff.filter(() => Math.random() > 0.3);
      const finalAvailable = simulatedAvailable.length > 0 
        ? simulatedAvailable 
        : salon.staff.slice(0, 2); // Fallback to ensure we have options
        
      setAvailableStaff(finalAvailable);
    }
  }, [selectedDate, selectedTime, salon.staff]);

  const handleStaffSelect = (staff: Staff | null) => {
    setSelectedStaff(staff);
    setIsRandomStaff(staff === null);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    // If "No Preference" was selected, randomly assign one of the available staff
    const finalStaff = selectedStaff || availableStaff[Math.floor(Math.random() * availableStaff.length)];
    
    // Use a mock email or the input email
    const emailToSendTo = userEmail || "guest@example.com";
    const userName = "Valued Customer";

    try {
        await sendBookingConfirmationEmail(
            emailToSendTo,
            userName,
            salon,
            service,
            finalStaff,
            selectedDate!,
            selectedTime!
        );
        setStep(4);
    } catch (error) {
        alert("Something went wrong with the booking.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
              <h3 className="font-bold text-lg text-gray-900">
                {step === 1 && 'Select Time'}
                {step === 2 && 'Select Professional'}
                {step === 3 && 'Confirm Booking'}
                {step === 4 && 'Booking Confirmed'}
              </h3>
              {step < 4 && (
                  <div className="flex gap-1 mt-1">
                      <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-secondary' : 'bg-gray-200'}`} />
                      <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-secondary' : 'bg-gray-200'}`} />
                      <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-secondary' : 'bg-gray-200'}`} />
                  </div>
              )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto">
          {step < 4 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
               <h4 className="font-bold text-gray-900 text-lg">{service.name}</h4>
               <p className="text-sm text-gray-500">{salon.name}</p>
               <div className="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                  <span className="font-bold text-gray-900">{service.price}k</span>
                  <span className="flex items-center text-gray-500"><Clock className="w-3 h-3 mr-1"/> {service.duration} min</span>
               </div>
            </div>
          )}

          {/* STEP 1: DATE & TIME */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Date</label>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold border whitespace-nowrap transition-all ${
                        selectedDate === date
                          ? 'border-secondary bg-secondary/5 text-secondary ring-1 ring-secondary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Time</label>
                  <div className="grid grid-cols-3 gap-3">
                    {times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                          selectedTime === time
                            ? 'border-secondary bg-secondary text-white shadow-md transform scale-105'
                            : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT STAFF */}
          {step === 2 && (
             <div className="space-y-4">
                 <p className="text-sm text-gray-500">The following professionals are available at <strong>{selectedTime}</strong> on <strong>{selectedDate}</strong>.</p>
                 
                 {/* Option: No Preference */}
                 <button
                    onClick={() => handleStaffSelect(null)}
                    className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-secondary hover:bg-purple-50 transition-all group text-left"
                 >
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Any Professional</h4>
                        <p className="text-xs text-gray-500">Maximum availability</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-secondary" />
                 </button>

                 <div className="border-t border-gray-100 my-2"></div>

                 {/* Available Staff List */}
                 {availableStaff.map(staff => (
                     <button
                        key={staff.id}
                        onClick={() => handleStaffSelect(staff)}
                        className="w-full flex items-center p-3 border border-gray-200 rounded-xl hover:border-secondary hover:bg-purple-50 transition-all group text-left"
                     >
                        <img 
                            src={staff.image} 
                            alt={staff.name} 
                            className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-100"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{staff.name}</h4>
                            <p className="text-xs text-gray-500">{staff.role}</p>
                        </div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            Available
                        </div>
                     </button>
                 ))}
             </div>
          )}

          {/* STEP 3: REVIEW & EMAIL INPUT */}
          {step === 3 && (
             <div className="space-y-6">
                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Date & Time</span>
                         <span className="font-bold text-gray-900">{selectedDate}, {selectedTime}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Professional</span>
                         <span className="font-bold text-gray-900">
                             {selectedStaff ? selectedStaff.name : "Any Professional (Random)"}
                         </span>
                     </div>
                     <div className="flex justify-between text-sm pt-3 border-t border-gray-200 mt-2">
                         <span className="font-bold text-gray-900">Total to pay</span>
                         <span className="font-bold text-secondary text-lg">{service.price}k</span>
                     </div>
                 </div>

                 {/* Email Input for Guest */}
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email for Confirmation</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="email" 
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">We will send the booking details to this email.</p>
                 </div>
             </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Booked Successfully!</h4>
                <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                    Your appointment is confirmed. We have sent the details to <strong>{userEmail || 'your email'}</strong>.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100 text-sm text-blue-800 mb-6">
                    <p className="font-bold mb-1">Check your inbox!</p>
                    <p>Also check your spam folder if you don't see the email within a few minutes.</p>
                </div>

                <button
                    onClick={() => { onClose(); onOpenFeedback(); }}
                    className="w-full bg-gradient-to-r from-secondary to-pink-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 animate-pulse"
                >
                    <MessageSquarePlus className="w-5 h-5" />
                    Rate Experience & Get 30% Off
                </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
            {step === 1 ? (
               <button
                 disabled={!selectedTime}
                 onClick={() => setStep(2)}
                 className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md ${
                   selectedTime 
                   ? 'bg-primary text-white hover:bg-gray-800' 
                   : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                 }`}
               >
                 Continue
               </button>
            ) : (
                <div className="flex w-full space-x-3">
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={isProcessing}
                    >
                        Back
                    </button>
                    
                    {step === 2 ? (
                        /* Step 2 doesn't have a generic "Continue" because selecting a staff triggers next step immediately. 
                           However, we keep the back button. */
                        <div className="hidden"></div>
                    ) : (
                        <button
                            onClick={handleConfirmBooking}
                            disabled={isProcessing}
                            className="flex-[2] py-3.5 rounded-xl font-bold bg-secondary text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Booking"
                            )}
                        </button>
                    )}
                </div>
            )}
          </div>
        )}
        
        {step === 4 && (
            <div className="p-4 border-t border-gray-100 bg-white">
                <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                    Close
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;