
import React, { useState, useMemo } from 'react';
import { Feedback, WebStats } from '../types';
import { BarChart3, Users, MessageSquare, ArrowLeft, Star, DollarSign, CheckCircle, XCircle, PieChart, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  stats: WebStats;
  feedbacks: Feedback[];
  onExit: () => void;
}

// Simple Chart Components using Tailwind/CSS
const BarChart = ({ title, data, colorClass = "bg-blue-500" }: { title: string, data: Record<string, number>, colorClass?: string }) => {
    const maxVal = Math.max(...Object.values(data));
    const sortedKeys = Object.keys(data).sort((a, b) => data[b] - data[a]); // Sort descending

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                {sortedKeys.map(key => {
                    const val = data[key];
                    const percent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700 truncate w-3/4" title={key}>{key}</span>
                                <span className="font-bold text-gray-900">{val}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`${colorClass} h-2 rounded-full transition-all duration-500`} 
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
                {sortedKeys.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
            </div>
        </div>
    );
};

const SimpleDonutChart = ({ title, data }: { title: string, data: Record<string, number> }) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const keys = Object.keys(data);
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
    
    // Create conical gradient string
    let currentDeg = 0;
    const gradientParts = keys.map((key, index) => {
        const val = data[key];
        const deg = (val / total) * 360;
        const start = currentDeg;
        const end = currentDeg + deg;
        currentDeg = end;
        return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    });
    
    const gradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
            <div className="flex items-center justify-between">
                <div className="relative w-32 h-32 rounded-full shrink-0" style={{ background: total > 0 ? gradient : '#f3f4f6' }}>
                    <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center">
                        <span className="font-bold text-lg text-gray-700">{total}</span>
                    </div>
                </div>
                <div className="flex-1 ml-6 space-y-2 text-xs">
                    {keys.map((key, idx) => (
                        <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                                <span className="truncate w-24" title={key}>{key}</span>
                            </div>
                            <span className="font-bold">{data[key]}</span>
                        </div>
                    ))}
                    {keys.length === 0 && <p className="text-gray-400">No data.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, feedbacks, onExit }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customer_feedback' | 'business_feedback'>('overview');

  const customerFeedbacks = feedbacks.filter(f => f.userType === 'customer');
  const businessFeedbacks = feedbacks.filter(f => f.userType === 'business');

  // Helper to aggregate data for charts
  const aggregate = (data: Feedback[], field: keyof Feedback) => {
      const counts: Record<string, number> = {};
      data.forEach(item => {
          const val = String(item[field]);
          counts[val] = (counts[val] || 0) + 1;
      });
      return counts;
  };

  // Aggregated Data
  const custStats = {
      q1: aggregate(customerFeedbacks, 'q1'), // Like most
      q2: aggregate(customerFeedbacks, 'q2'), // Difficulties
      q3: aggregate(customerFeedbacks, 'q3'), // Trust
      q4: aggregate(customerFeedbacks, 'q4'), // Feature add
      rating: aggregate(customerFeedbacks, 'rating')
  };

  const bizStats = {
      q1: aggregate(businessFeedbacks, 'q1'), // Important feature
      q2: aggregate(businessFeedbacks, 'q2'), // Device
      q3: aggregate(businessFeedbacks, 'q3'), // Payment
      q4: aggregate(businessFeedbacks, 'q4'), // Missing
      rating: aggregate(businessFeedbacks, 'rating')
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 shadow-md sticky top-0 z-30">
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-4 text-sm font-bold border-b-2 ${activeTab === 'overview' ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Overview & Revenue
              </button>
              <button 
                onClick={() => setActiveTab('customer_feedback')}
                className={`py-4 text-sm font-bold border-b-2 ${activeTab === 'customer_feedback' ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Customer Insights ({customerFeedbacks.length})
              </button>
              <button 
                onClick={() => setActiveTab('business_feedback')}
                className={`py-4 text-sm font-bold border-b-2 ${activeTab === 'business_feedback' ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Partner Insights ({businessFeedbacks.length})
              </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
            <>
                {/* Revenue Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue & Traffic</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                            <div className="text-gray-500 font-bold text-xs uppercase mb-2">Total Revenue</div>
                            <div className="text-3xl font-bold text-gray-900">{(stats.revenueCommission || 0) + (stats.revenueSubscription || 0) + (stats.revenueAds || 0)}k</div>
                            <div className="text-xs text-green-600 mt-1">This Month</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-gray-500 font-bold text-xs uppercase mb-2">Commission</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.revenueCommission}k</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-gray-500 font-bold text-xs uppercase mb-2">Subscriptions</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.revenueSubscription}k</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-gray-500 font-bold text-xs uppercase mb-2">Feedback Total</div>
                            <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BarChart title="Customer Ratings Distribution" data={custStats.rating} colorClass="bg-yellow-400" />
                    <BarChart title="Partner Ratings Distribution" data={bizStats.rating} colorClass="bg-blue-500" />
                </div>
            </>
        )}

        {/* TAB: CUSTOMER FEEDBACK */}
        {activeTab === 'customer_feedback' && (
            <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-secondary"/> Customer Feedback Analysis
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                    <BarChart title="Q1: What they liked most" data={custStats.q1} colorClass="bg-purple-500" />
                    <BarChart title="Q2: Difficulties Faced" data={custStats.q2} colorClass="bg-red-500" />
                    <SimpleDonutChart title="Q3: Trust in Platform" data={custStats.q3} />
                    <BarChart title="Q4: Requested Features" data={custStats.q4} colorClass="bg-green-500" />
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-900">Raw Feedback Data</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Rating</th>
                                    <th className="px-4 py-3">Liked</th>
                                    <th className="px-4 py-3">Issues</th>
                                    <th className="px-4 py-3">Wishlist</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customerFeedbacks.map(f => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500 text-xs">{f.timestamp}</td>
                                        <td className="px-4 py-3 font-bold text-yellow-600">{f.rating} ★</td>
                                        <td className="px-4 py-3">{f.q1}</td>
                                        <td className="px-4 py-3 text-red-600">{f.q2 !== 'None' ? f.q2 : '-'}</td>
                                        <td className="px-4 py-3 text-green-700 font-medium">{f.q4}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}

        {/* TAB: PARTNER FEEDBACK */}
        {activeTab === 'business_feedback' && (
            <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600"/> Partner Feedback Analysis
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                    <BarChart title="Q1: Most Important Feature" data={bizStats.q1} colorClass="bg-blue-500" />
                    <SimpleDonutChart title="Q2: Device Preference" data={bizStats.q2} />
                    <SimpleDonutChart title="Q3: Preferred Payment Model" data={bizStats.q3} />
                    <BarChart title="Q4: Missing Features" data={bizStats.q4} colorClass="bg-orange-500" />
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-900">Raw Partner Data</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3">Top Feature</th>
                                    <th className="px-4 py-3">Device</th>
                                    <th className="px-4 py-3">Missing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {businessFeedbacks.map(f => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500 text-xs">{f.timestamp}</td>
                                        <td className="px-4 py-3 font-bold text-blue-600">{f.rating}/10</td>
                                        <td className="px-4 py-3">{f.q1}</td>
                                        <td className="px-4 py-3">{f.q2}</td>
                                        <td className="px-4 py-3 text-red-600 font-medium">{f.q4}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
