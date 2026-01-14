
import React, { useState, useEffect } from 'react';
import { Salon, Staff, Service, Appointment, PackageType, WalletTransaction } from '../types';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, Settings, 
  DollarSign, BarChart3, Clock, MapPin, Phone, Scissors, 
  Plus, Save, Trash2, LogOut, Zap, Bell, CheckCircle,
  Wallet, FileText, AlertTriangle, X
} from 'lucide-react';

interface BusinessDashboardProps {
  salonData: Salon;
  onUpdateSalon: (updatedSalon: Salon) => void;
  onExit: () => void;
}

// Helper to generate time slots
const generateTimeSlots = (start: string, end: string) => {
  const slots = [];
  let current = parseInt(start.split(':')[0]);
  const endHour = parseInt(end.split(':')[0]);
  
  while (current <= endHour) {
    slots.push(`${current.toString().padStart(2, '0')}:00`);
    if (current !== endHour) slots.push(`${current.toString().padStart(2, '0')}:30`);
    current++;
  }
  return slots;
};

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ salonData, onUpdateSalon, onExit }) => {
  // Initialize salon with wallet balance if missing
  const initialSalon = {
      ...salonData,
      walletBalance: salonData.walletBalance ?? 0
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'staff' | 'services' | 'profile' | 'finance'>('overview');
  const [salon, setSalon] = useState<Salon>(initialSalon);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("09:00");
  const [simulationInterval, setSimulationInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // --- FINANCE STATE ---
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
      { id: 'tx_1', type: 'DEPOSIT', amount: 500, date: '2023-10-20 10:00', status: 'completed', description: 'Initial Deposit' },
      { id: 'tx_2', type: 'FEE_COMMISSION', amount: -10, date: '2023-10-21 14:30', status: 'completed', description: 'Booking Fee #B992' }
  ]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  
  // --- PACKAGE & CONTRACT STATE ---
  const [showPackageSelector, setShowPackageSelector] = useState(!salon.packageType); // Show if no package selected
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  // Initialize some mock appointments
  useEffect(() => {
    if (salon.staff) {
      const initialApps: Appointment[] = [];
      // Create some static bookings
      initialApps.push({
        id: 'a1', customerName: 'Nguyen Van A', serviceId: salon.services[0].id, serviceName: salon.services[0].name,
        staffId: salon.staff[0].id, startTime: '09:30', duration: 45, price: salon.services[0].price, status: 'completed', type: 'online'
      });
      initialApps.push({
        id: 'a2', customerName: 'Tran Thi B', serviceId: salon.services[1].id, serviceName: salon.services[1].name,
        staffId: salon.staff[1].id, startTime: '10:00', duration: 90, price: salon.services[1].price, status: 'in-progress', type: 'walk-in'
      });
      setAppointments(initialApps);
      updateStaffStats(initialApps);
    }
  }, []);

  // --- SMART SCHEDULING ALGORITHM ---
  // Assigns a new booking to the "fairest" staff member
  const assignFairBooking = (service: Service, type: 'online' | 'walk-in') => {
    if (!salon.staff) return;

    // --- CHECK WALLET LOGIC FOR COMMISSION MODEL ---
    if (type === 'online' && salon.packageType === 'COMMISSION') {
        if ((salon.walletBalance || 0) < 10) {
            alert("Insufficient wallet balance for new bookings (Min 10k required). Please top up.");
            setActiveTab('finance');
            return;
        }
    }

    const sortedStaff = [...salon.staff].sort((a, b) => a.revenueToday - b.revenueToday);
    const targetStaff = sortedStaff[0];
    
    const newApp: Appointment = {
      id: `app_${Date.now()}`,
      customerName: type === 'walk-in' ? `Walk-in Guest ${Math.floor(Math.random()*100)}` : `App User ${Math.floor(Math.random()*100)}`,
      serviceId: service.id,
      serviceName: service.name,
      staffId: targetStaff.id,
      startTime: currentTime, 
      duration: service.duration,
      price: service.price,
      status: 'pending',
      type: type
    };

    setAppointments(prev => {
        const updated = [...prev, newApp];
        updateStaffStats(updated);

        // --- SIMULATE COMPLETION & DEDUCTION FOR COMMISSION ---
        // In real app, this happens when status changes to 'completed'
        if (type === 'online' && salon.packageType === 'COMMISSION') {
            setTimeout(() => {
                handleCompleteAppointment(newApp);
            }, 1000);
        }

        return updated;
    });
  };

  const handleCompleteAppointment = (app: Appointment) => {
      // Logic: Deduct money if Commission Model
      if (salon.packageType === 'COMMISSION') {
          const fee = 10; // 10k VND
          const newBalance = (salon.walletBalance || 0) - fee;
          
          setSalon(prev => ({ ...prev, walletBalance: newBalance }));
          
          const newTx: WalletTransaction = {
              id: `tx_${Date.now()}`,
              type: 'FEE_COMMISSION',
              amount: -fee,
              date: new Date().toLocaleString(),
              status: 'completed',
              description: `Booking Fee for ${app.customerName}`
          };
          setTransactions(prev => [newTx, ...prev]);
      }
      
      setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'completed' } : a));
  };

  const updateStaffStats = (currentAppointments: Appointment[]) => {
      if (!salon.staff) return;
      const updatedStaff = salon.staff.map(s => {
          const staffApps = currentAppointments.filter(a => a.staffId === s.id);
          const revenue = staffApps.reduce((sum, a) => sum + a.price, 0);
          const hours = staffApps.reduce((sum, a) => sum + a.duration, 0) / 60;
          return { ...s, revenueToday: revenue, hoursWorkedToday: hours };
      });
      setSalon(prev => ({ ...prev, staff: updatedStaff }));
      onUpdateSalon({ ...salon, staff: updatedStaff }); // Sync up
  };

  // Simulate Time & Random Walk-ins
  useEffect(() => {
    if (isLiveMode) {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const randomService = salon.services[Math.floor(Math.random() * salon.services.length)];
                assignFairBooking(randomService, 'walk-in');
            }
        }, 3000);
        setSimulationInterval(interval);
    } else {
        if (simulationInterval) clearInterval(simulationInterval);
    }
    return () => { if (simulationInterval) clearInterval(simulationInterval); };
  }, [isLiveMode, salon.staff]);

  // --- ACTIONS ---
  const handleTopUpRequest = () => {
      if (!topUpAmount) return;
      const amount = parseInt(topUpAmount);
      
      const newTx: WalletTransaction = {
          id: `tx_${Date.now()}`,
          type: 'DEPOSIT',
          amount: amount,
          date: new Date().toLocaleString(),
          status: 'pending', 
          description: 'Top-up via Bank Transfer'
      };
      setTransactions(prev => [newTx, ...prev]);
      setTopUpAmount('');
      setShowTopUpModal(false);

      // Auto-approve after 3s for Demo
      setTimeout(() => {
          setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, status: 'completed' } : t));
          setSalon(prev => ({ ...prev, walletBalance: (prev.walletBalance || 0) + amount }));
          alert(`Top-up of ${amount}k approved by Admin!`);
      }, 3000);
  };

  const handleBuyAds = () => {
      const adPrice = 500; // 500k
      if ((salon.walletBalance || 0) < adPrice) {
          alert("Insufficient balance. Ads cost 500k.");
          return;
      }
      
      if (confirm("Confirm purchase of 'Top Search Ad' for 500k/week?")) {
          const newBalance = (salon.walletBalance || 0) - adPrice;
          setSalon(prev => ({ 
              ...prev, 
              walletBalance: newBalance,
              isAdBoosted: true,
              adBoostExpiresAt: '7 days'
          }));
          const newTx: WalletTransaction = {
              id: `tx_${Date.now()}`,
              type: 'FEE_ADS',
              amount: -adPrice,
              date: new Date().toLocaleString(),
              status: 'completed',
              description: 'Purchased Top Search Ad (7 days)'
          };
          setTransactions(prev => [newTx, ...prev]);
      }
  };

  const handleSignContract = () => {
      if (!selectedPackage) return;
      setSalon(prev => ({
          ...prev,
          packageType: selectedPackage,
          contract: {
              isActive: true,
              signedAt: new Date().toLocaleString(),
              termsVersion: '1.0'
          }
      }));
      setShowContractModal(false);
      setShowPackageSelector(false);
      
      if (selectedPackage === 'PRO') {
          alert("Welcome to PRO! 200k/month. Please top up to maintain service.");
          setActiveTab('finance');
      } else if (selectedPackage === 'COMMISSION') {
          alert("Commission Model Active. Please top up your wallet to receive bookings.");
          setActiveTab('finance');
      }
  };

  // --- CALCULATIONS ---
  const totalRevenue = salon.staff?.reduce((sum, s) => sum + s.revenueToday, 0) || 0;
  const totalCustomers = appointments.length;
  const topService = salon.services[0].name;

  // --- RENDERERS ---

  if (showPackageSelector) {
      return (
          <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
              <div className="max-w-5xl w-full animate-fade-in-up">
                  <div className="text-center mb-10">
                      <h1 className="text-3xl font-bold text-primary mb-2">Partner with GlowBook</h1>
                      <p className="text-gray-500">Select a business model that fits your growth stage.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* STARTER */}
                      <div className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage === 'STARTER' ? 'border-secondary shadow-xl scale-105' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setSelectedPackage('STARTER')}>
                          <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-gray-600"/></div>
                          <h3 className="text-xl font-bold mb-1">Starter</h3>
                          <p className="text-gray-500 text-sm mb-4">For small shops just getting started.</p>
                          <div className="text-3xl font-bold text-gray-900 mb-6">Free</div>
                          <ul className="space-y-3 text-sm text-gray-600">
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Basic Listing</li>
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Manual Booking Mgmt</li>
                              <li className="flex gap-2 text-gray-400"><X className="w-4 h-4"/> No Top Placement</li>
                          </ul>
                      </div>

                      {/* COMMISSION */}
                      <div className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPackage === 'COMMISSION' ? 'border-secondary shadow-xl scale-105' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setSelectedPackage('COMMISSION')}>
                          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-blue-600"/></div>
                          <h3 className="text-xl font-bold mb-1">Commission</h3>
                          <p className="text-gray-500 text-sm mb-4">Pay as you grow. No fixed costs.</p>
                          <div className="text-3xl font-bold text-gray-900 mb-6">10k <span className="text-sm font-normal text-gray-400">/ booking</span></div>
                          <ul className="space-y-3 text-sm text-gray-600">
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Priority Support</li>
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Wallet System</li>
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Pay only for success</li>
                          </ul>
                      </div>

                      {/* PRO */}
                      <div className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage === 'PRO' ? 'border-secondary shadow-xl scale-105' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setSelectedPackage('PRO')}>
                          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Settings className="w-6 h-6 text-secondary"/></div>
                          <h3 className="text-xl font-bold mb-1">Pro Salon</h3>
                          <p className="text-gray-500 text-sm mb-4">Full power for busy venues.</p>
                          <div className="text-3xl font-bold text-gray-900 mb-6">200k <span className="text-sm font-normal text-gray-400">/ month</span></div>
                          <ul className="space-y-3 text-sm text-gray-600">
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Zero Commission</li>
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Marketing Tools</li>
                              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Advanced Analytics</li>
                          </ul>
                      </div>
                  </div>

                  <div className="text-center">
                      <button 
                        disabled={!selectedPackage}
                        onClick={() => setShowContractModal(true)}
                        className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          Continue to Agreement
                      </button>
                  </div>
              </div>

              {/* CONTRACT MODAL */}
              {showContractModal && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] flex flex-col">
                          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                              <FileText className="w-6 h-6 text-secondary"/> Partner Agreement
                          </h2>
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 overflow-y-auto flex-1 mb-6 text-sm text-gray-700 space-y-4">
                              <p><strong>1. PARTIES:</strong> This agreement is between GlowBook ("Admin") and {salon.name} ("Partner").</p>
                              <p><strong>2. MODEL:</strong> The Partner has selected the <strong>{selectedPackage}</strong> model.</p>
                              {selectedPackage === 'COMMISSION' && (
                                  <p className="bg-blue-50 p-2 rounded text-blue-800 border border-blue-100">
                                      * A fee of 10,000 VND will be deducted from your Business Wallet for each successfully completed appointment booked via GlowBook.
                                      * You must maintain a minimum wallet balance of 50,000 VND to remain listed.
                                  </p>
                              )}
                              {selectedPackage === 'PRO' && (
                                  <p className="bg-purple-50 p-2 rounded text-purple-800 border border-purple-100">
                                      * A subscription fee of 200,000 VND will be deducted monthly.
                                      * Failure to pay within 7 days will result in account suspension.
                                  </p>
                              )}
                              <p><strong>3. OBLIGATIONS:</strong> Partner agrees to provide accurate availability and honor all bookings.</p>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setShowContractModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                              <button onClick={handleSignContract} className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-purple-700">I Agree & Sign</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Today's Revenue</span>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-5 h-5"/></div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalRevenue}k</div>
                <div className="text-xs text-green-600 font-bold mt-1">+15% vs yesterday</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Customers</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5"/></div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalCustomers}</div>
                <div className="text-xs text-gray-400 mt-1">{appointments.filter(a => a.type === 'walk-in').length} Walk-ins</div>
            </div>
            
            {/* Wallet Quick View in Overview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Wallet Balance</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet className="w-5 h-5"/></div>
                </div>
                <div className={`text-3xl font-bold ${(salon.walletBalance || 0) < 50 ? 'text-red-500' : 'text-gray-900'}`}>
                    {salon.walletBalance?.toLocaleString()}k
                </div>
                <div className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-secondary" onClick={() => setActiveTab('finance')}>Manage Wallet &rarr;</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Occupancy</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Zap className="w-5 h-5"/></div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{salon.currentOccupancy}%</div>
                <div className="text-xs text-orange-500 font-bold mt-1">Peak hours: 17:00 - 19:00</div>
            </div>
        </div>

        {/* Real-time Status Control */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap className={`w-5 h-5 ${isLiveMode ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-gray-400'}`} />
                    Live Shop Status: {isLiveMode ? 'AUTO-PILOT ON' : 'MANUAL'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                    {isLiveMode ? 'System is automatically assigning walk-in customers to balance staff load.' : 'Enable to simulate real-time bookings and smart distribution.'}
                </p>
            </div>
            <button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    isLiveMode 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                } shadow-lg`}
            >
                {isLiveMode ? 'Stop Simulation' : 'Start Live Mode'}
            </button>
        </div>

        {/* Helper Alert for Low Balance (Commission Model) */}
        {salon.packageType === 'COMMISSION' && (salon.walletBalance || 0) < 50 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6"/>
                    <div>
                        <span className="font-bold">Low Wallet Balance!</span>
                        <p className="text-sm">Your balance is low. Bookings may be paused. Please top up immediately.</p>
                    </div>
                </div>
                <button onClick={() => setActiveTab('finance')} className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-50">Top Up</button>
            </div>
        )}

        {/* Staff Performance Table (Payroll Preview) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Today's Staff Performance & Payroll Estimate</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Auto-calculated</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Staff Member</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-center">Customers</th>
                            <th className="px-6 py-4 text-right">Revenue Gen</th>
                            <th className="px-6 py-4 text-right">Comm. %</th>
                            <th className="px-6 py-4 text-right text-green-600">Daily Earning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {salon.staff?.map(s => {
                            const dailyBase = (s.baseSalary * 1000) / 26; // Approx daily base from monthly (in k)
                            const comm = (s.revenueToday * s.commissionRate) / 100;
                            const totalDaily = dailyBase + comm;
                            const staffApps = appointments.filter(a => a.staffId === s.id).length;

                            return (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <img 
                                          src={s.image} 
                                          className="w-8 h-8 rounded-full object-cover" 
                                          alt=""
                                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff`; }} 
                                        />
                                        {s.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{s.role}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">{staffApps}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">{s.revenueToday.toLocaleString()}k</td>
                                    <td className="px-6 py-4 text-right text-gray-500">{s.commissionRate}%</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">{Math.round(totalDaily).toLocaleString()}k</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderFinance = () => (
      <div className="space-y-8 animate-fade-in">
          {/* Header Wallet Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                      <h2 className="text-gray-400 font-medium mb-1 flex items-center gap-2"><Wallet className="w-5 h-5"/> Partner Wallet</h2>
                      <div className="text-5xl font-bold tracking-tight mb-2">{(salon.walletBalance || 0).toLocaleString()} <span className="text-xl font-normal text-gray-400">VND (k)</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${salon.contract?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {salon.contract?.isActive ? 'Active Contract' : 'No Active Contract'}
                          </span>
                          <span>•</span>
                          <span>Plan: <span className="font-bold text-white">{salon.packageType}</span></span>
                      </div>
                  </div>
                  <button 
                    onClick={() => setShowTopUpModal(true)}
                    className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                  >
                      <Plus className="w-5 h-5" /> Top Up Balance
                  </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transactions History */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Transaction History</h3>
                  </div>
                  <div className="flex-1 overflow-auto max-h-[400px]">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0">
                              <tr>
                                  <th className="px-6 py-3">Description</th>
                                  <th className="px-6 py-3">Date</th>
                                  <th className="px-6 py-3 text-right">Amount</th>
                                  <th className="px-6 py-3 text-right">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {transactions.map(tx => (
                                  <tr key={tx.id}>
                                      <td className="px-6 py-4 font-medium">{tx.description}</td>
                                      <td className="px-6 py-4 text-gray-500 text-xs">{tx.date}</td>
                                      <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                          {tx.amount > 0 ? '+' : ''}{tx.amount}k
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                                              tx.status === 'completed' ? 'bg-green-50 text-green-600' :
                                              tx.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                          }`}>
                                              {tx.status}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Boost & Ads */}
              <div className="space-y-6">
                  {/* Current Plan Card */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4">Current Plan</h3>
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-purple-50 text-secondary rounded-xl flex items-center justify-center">
                              {salon.packageType === 'STARTER' ? <Zap className="w-6 h-6"/> : salon.packageType === 'COMMISSION' ? <DollarSign className="w-6 h-6"/> : <Settings className="w-6 h-6"/>}
                          </div>
                          <div>
                              <div className="font-bold text-lg">{salon.packageType}</div>
                              <div className="text-xs text-gray-500">
                                  {salon.packageType === 'COMMISSION' ? '10k / booking' : salon.packageType === 'PRO' ? '200k / month' : 'Free'}
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setShowPackageSelector(true)} className="w-full border border-gray-200 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Change Plan</button>
                  </div>

                  {/* Ad Boost Card */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-orange-900">Boost Visibility</h3>
                          <span className="bg-yellow-200 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">ADS</span>
                      </div>
                      <p className="text-sm text-yellow-800 mb-4">Get pinned to the top of search results for 7 days.</p>
                      
                      {salon.isAdBoosted ? (
                          <div className="bg-white/50 p-3 rounded-xl border border-yellow-200 text-center">
                              <p className="text-xs font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3"/> Active</p>
                              <p className="text-[10px] text-gray-500">Expires in {salon.adBoostExpiresAt}</p>
                          </div>
                      ) : (
                          <button onClick={handleBuyAds} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 shadow-md">
                              Buy Boost (500k)
                          </button>
                      )}
                  </div>
              </div>
          </div>

          {/* Top Up Modal */}
          {showTopUpModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg text-gray-900">Top Up Wallet</h3>
                          <button onClick={() => setShowTopUpModal(false)}><Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 rotate-45"/></button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl mb-6 flex flex-col items-center">
                           {/* Mock QR */}
                           <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                               <div className="text-center">
                                   <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                                   <span className="text-xs text-gray-400">Scan Bank QR</span>
                               </div>
                           </div>
                           <p className="text-sm font-bold text-gray-700">Bank: GlowBank - 123456789</p>
                           <p className="text-xs text-gray-500">Ref: {salon.id}_TOPUP</p>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Enter Amount (k VND)</label>
                              <input 
                                type="number" 
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="e.g. 200"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary font-bold text-lg"
                              />
                          </div>
                          <button 
                            onClick={handleTopUpRequest}
                            className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-purple-700"
                          >
                              I have transferred
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  const renderCalendar = () => {
    const timeSlots = generateTimeSlots(salon.openTime || "09:00", salon.closeTime || "20:00");
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-secondary" /> Smart Schedule
                </h3>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Online
                    </div>
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div> Walk-in
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto relative">
                <div className="min-w-[800px]">
                    {/* Header Row: Times */}
                    <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="w-48 shrink-0 p-3 border-r border-gray-100 font-bold text-gray-500 text-xs uppercase bg-gray-50">Staff / Time</div>
                        {timeSlots.map(time => (
                            <div key={time} className="w-24 shrink-0 p-3 border-r border-gray-100 text-center text-xs font-bold text-gray-400">
                                {time}
                            </div>
                        ))}
                    </div>

                    {/* Staff Rows */}
                    {salon.staff?.map(staff => (
                        <div key={staff.id} className="flex border-b border-gray-100 group hover:bg-gray-50 transition-colors relative">
                            {/* Staff Column */}
                            <div className="w-48 shrink-0 p-3 border-r border-gray-100 flex items-center gap-3 bg-white sticky left-0 z-10 group-hover:bg-gray-50">
                                <div className="relative">
                                    <img 
                                      src={staff.image} 
                                      className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                                      alt="" 
                                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random&color=fff`; }}
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${staff.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-gray-900">{staff.name}</div>
                                    <div className="text-[10px] text-gray-500">{staff.role}</div>
                                </div>
                            </div>

                            {/* Time Slots (Background Grid) */}
                            {timeSlots.map(time => (
                                <div key={time} className="w-24 shrink-0 border-r border-gray-50 h-16"></div>
                            ))}

                            {/* Appointment Overlays */}
                            {appointments.filter(a => a.staffId === staff.id).map(app => {
                                // Calculate position
                                const startHour = parseInt(app.startTime.split(':')[0]);
                                const startMin = parseInt(app.startTime.split(':')[1]);
                                const openHour = parseInt(salon.openTime?.split(':')[0] || "9");
                                
                                const slotsFromOpen = ((startHour - openHour) * 60 + startMin) / 30;
                                
                                return (
                                    <div 
                                        key={app.id}
                                        className={`absolute top-2 h-12 rounded-lg border shadow-sm p-2 flex flex-col justify-center text-xs overflow-hidden cursor-pointer hover:brightness-95 transition-all z-0 ${
                                            app.type === 'online' ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-orange-100 border-orange-200 text-orange-800'
                                        }`}
                                        style={{ left: `${slotsFromOpen * 6 + 12}rem`, width: `${(app.duration / 30) * 6}rem` }}
                                        title={`${app.customerName} - ${app.serviceName}`}
                                    >
                                        <div className="font-bold truncate">{app.customerName}</div>
                                        <div className="truncate opacity-80">{app.serviceName}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderProfile = () => (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" /> Salon Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Salon Name</label>
                  <input type="text" value={salon.name} onChange={(e) => setSalon({...salon, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select value={salon.category} onChange={(e) => setSalon({...salon, category: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary">
                      <option value="Hair">Hair Salon</option>
                      <option value="Barber">Barber Shop</option>
                      <option value="Nails">Nails</option>
                      <option value="Spa">Spa</option>
                  </select>
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input type="text" value={salon.location} onChange={(e) => setSalon({...salon, location: e.target.value})} className="w-full pl-9 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input type="text" value={salon.phone || ''} onChange={(e) => setSalon({...salon, phone: e.target.value})} placeholder="0912..." className="w-full pl-9 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Seats</label>
                  <input type="number" value={salon.totalSeats || 5} onChange={(e) => setSalon({...salon, totalSeats: parseInt(e.target.value)})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time</label>
                  <input type="time" value={salon.openTime || "09:00"} onChange={(e) => setSalon({...salon, openTime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time</label>
                  <input type="time" value={salon.closeTime || "20:00"} onChange={(e) => setSalon({...salon, closeTime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
              </div>
          </div>
          
          <div className="mt-8 flex justify-end">
              <button 
                onClick={() => { onUpdateSalon(salon); alert('Settings Saved!'); }}
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                  <Save className="w-4 h-4" /> Save Changes
              </button>
          </div>
      </div>
  );

  const renderStaff = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary">Staff Management</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Staff
              </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salon.staff?.map((staff, idx) => (
                  <div key={staff.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group">
                      <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={staff.image} 
                            alt="" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-50" 
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random&color=fff`; }}
                          />
                          <div>
                              <h3 className="font-bold text-gray-900">{staff.name}</h3>
                              <span className="text-xs text-secondary bg-purple-50 px-2 py-0.5 rounded font-bold">{staff.role}</span>
                          </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                              <span className="text-gray-500">Base Salary</span>
                              <span className="font-bold text-gray-900">{staff.baseSalary}M /month</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500">Commission</span>
                              <span className="font-bold text-green-600">{staff.commissionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500">Experience</span>
                              <span className="font-bold text-gray-900">{staff.experience}</span>
                          </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50">
                          <div className="text-xs font-bold text-gray-400 mb-2">SPECIALTIES</div>
                          <div className="flex flex-wrap gap-1">
                              {staff.specialties.map(s => (
                                  <span key={s} className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] border border-gray-100">{s}</span>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderServices = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary">Service Menu & Pricing</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Service
              </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                      <tr>
                          <th className="px-6 py-4">Service Name</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {salon.services.map(svc => (
                          <tr key={svc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-gray-900">{svc.name}</div>
                                  <div className="text-xs text-gray-400">{svc.description}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration} min</span>
                              </td>
                              <td className="px-6 py-4 font-bold text-secondary">
                                  {svc.discountPrice ? (
                                      <span>
                                          <span className="line-through text-gray-300 text-xs mr-2">{svc.price}k</span>
                                          {svc.discountPrice}k
                                      </span>
                                  ) : (
                                      <span>{svc.price}k</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-gray-400 hover:text-blue-500 mr-3"><Settings className="w-4 h-4" /></button>
                                  <button className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <img 
                      src={salon.image} 
                      className="w-10 h-10 rounded-lg object-cover" 
                      alt="Logo" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"; }}
                    />
                    <div>
                        <div className="font-bold text-gray-900 text-sm truncate w-32">{salon.name}</div>
                        <div className="text-xs text-gray-400">Business Dashboard</div>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <LayoutDashboard className="w-5 h-5" /> Overview
                </button>
                <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Wallet className="w-5 h-5" /> Finance & Wallet
                </button>
                <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <CalendarIcon className="w-5 h-5" /> Schedule
                </button>
                <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Users className="w-5 h-5" /> Staff
                </button>
                <button onClick={() => setActiveTab('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Scissors className="w-5 h-5" /> Services
                </button>
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Settings className="w-5 h-5" /> Shop Profile
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" /> Exit Dashboard
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                    <p className="text-gray-500 text-sm">Manage your business in real-time.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-secondary"/>
                        <span className="text-sm font-bold">{salon.walletBalance}k</span>
                    </div>
                    <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm relative cursor-pointer">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </div>
                </div>
            </header>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'finance' && renderFinance()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'staff' && renderStaff()}
            {activeTab === 'services' && renderServices()}
        </div>
    </div>
  );
};

export default BusinessDashboard;
