
import React, { useState } from 'react';
import { Feedback, WebStats } from '../types';
import { BarChart3, Users, MessageSquare, ArrowLeft, Star, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface AdminDashboardProps {
  stats: WebStats;
  feedbacks: Feedback[];
  onExit: () => void;
}

// Mock pending top-ups for Admin to approve
interface PendingTopUp {
    id: string;
    salonName: string;
    amount: number;
    time: string;
    status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, feedbacks, onExit }) => {
  const [pendingTopUps, setPendingTopUps] = useState<PendingTopUp[]>([
      { id: 'tu_1', salonName: '30Shine Premium', amount: 500, time: '10 mins ago', status: 'pending' },
      { id: 'tu_2', salonName: 'Liem Barber', amount: 200, time: '1 hour ago', status: 'pending' }
  ]);
  
  // Enriched Stats
  const revenueStats = {
      commission: stats.revenueCommission || 1250, // 1250k
      subscription: stats.revenueSubscription || 4000, // 20 salons * 200k
      ads: stats.revenueAds || 1500 // 3 ads
  };
  const totalRev = revenueStats.commission + revenueStats.subscription + revenueStats.ads;

  const handleApprove = (id: string) => {
      // In real app: Update backend DB
      setPendingTopUps(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  const customerFeedbacks = feedbacks.filter(f => f.userType === 'customer');
  const businessFeedbacks = feedbacks.filter(f => f.userType === 'business');
  
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) 
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-secondary px-2 py-0.5 rounded text-sm font-mono">ADMIN</span> Dashboard
          </h1>
          <button 
            onClick={onExit}
            className="flex items-center text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* REVENUE SECTION */}
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                    <div className="text-gray-500 font-bold text-xs uppercase mb-2">Total Revenue</div>
                    <div className="text-3xl font-bold text-gray-900">{totalRev.toLocaleString()}k</div>
                    <div className="text-xs text-green-600 mt-1">This Month</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 font-bold text-xs uppercase mb-2">Commission (10k/book)</div>
                    <div className="text-2xl font-bold text-gray-900">{revenueStats.commission.toLocaleString()}k</div>
                    <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 font-bold text-xs uppercase mb-2">Subscriptions (200k)</div>
                    <div className="text-2xl font-bold text-gray-900">{revenueStats.subscription.toLocaleString()}k</div>
                    <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: '60%' }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 font-bold text-xs uppercase mb-2">Ads / Boost</div>
                    <div className="text-2xl font-bold text-gray-900">{revenueStats.ads.toLocaleString()}k</div>
                    <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: '15%' }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* APPROVALS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Top-up Approvals</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{pendingTopUps.filter(t => t.status === 'pending').length} Pending</span>
                </div>
                <div className="p-4">
                    {pendingTopUps.length === 0 ? <p className="text-gray-500 text-center">No pending requests.</p> : (
                        <div className="space-y-3">
                            {pendingTopUps.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <DollarSign className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{req.salonName}</div>
                                            <div className="text-xs text-gray-500">{req.time} • Transfer ID: {Math.floor(Math.random()*10000)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-lg">+{req.amount}k</div>
                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(req.id)} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 shadow-sm">
                                                    <CheckCircle className="w-5 h-5"/>
                                                </button>
                                                <button className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200">
                                                    <XCircle className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-green-600 font-bold text-sm px-3 py-1 bg-green-50 rounded-lg">Approved</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Stats Cards (Small) */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-bold text-xs uppercase">Total Visits</span>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalVisits.toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-bold text-xs uppercase">Feedback</span>
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{feedbacks.length}</div>
                </div>
            </div>
        </div>

        {/* Feedback Tables (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-900">Customer Feedback</h3>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                 {customerFeedbacks.map(f => (
                   <div key={f.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                           <span className="font-bold">{f.rating}</span> <Star className="w-3 h-3 fill-current" />
                        </div>
                        <span className="text-xs text-gray-400">{f.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">"{f.q4}"</p>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-900">Partner Feedback</h3>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                 {businessFeedbacks.map(f => (
                   <div key={f.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-blue-500">
                           <span className="font-bold">{f.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-400">{f.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">"{f.q4}"</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
