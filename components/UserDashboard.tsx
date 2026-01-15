
import React, { useState } from 'react';
import { Appointment, Notification, User, UserStats } from '../types';
import { 
  User as UserIcon, Calendar, Clock, DollarSign, 
  MapPin, Bell, Scissors, ChevronRight, LogOut, 
  TrendingUp, Star, AlertCircle, CheckCircle, RefreshCcw, MessageSquare, Edit3
} from 'lucide-react';
import SalonReviewModal from './SalonReviewModal';

interface UserDashboardProps {
  user: User;
  appointments: Appointment[];
  notifications: Notification[];
  stats: UserStats;
  onExit: () => void;
  onReadNotification: (id: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
    user, appointments, notifications, stats, onExit, onReadNotification 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notifications'>('overview');
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenReview = (app: Appointment) => {
      setReviewTarget(app);
      setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (id: string, rating: number, comment: string) => {
      // Update local state to show "Reviewed" status
      setLocalAppointments(prev => prev.map(app => 
          app.id === id ? { ...app, isReviewed: true } : app
      ));
      
      setIsReviewModalOpen(false);
      setReviewTarget(null);
      
      // In a real app, this would post to the backend
      alert(`Thank you! Review submitted for ${reviewTarget?.salonName}.\nRating: ${rating}/5`);
  };

  const renderOverview = () => (
      <div className="space-y-6 animate-fade-in">
          {/* Hero Stats */}
          <div className="bg-gradient-to-r from-primary to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="text-gray-300 font-medium mb-1">Total Spending</h2>
                  <div className="text-5xl font-bold tracking-tight mb-4">{stats.totalSpent.toLocaleString()} <span className="text-xl font-normal text-gray-400">VND (k)</span></div>
                  
                  <div className="flex gap-6">
                      <div>
                          <div className="text-xs text-gray-400 uppercase font-bold">Bookings</div>
                          <div className="text-xl font-bold">{stats.totalBookings}</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-400 uppercase font-bold">Usual Time</div>
                          <div className="text-xl font-bold">{stats.usualTimeSlot}</div>
                      </div>
                  </div>
              </div>
              {/* Background Decoration */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
              <TrendingUp className="absolute bottom-4 right-4 text-white/10 w-32 h-32" />
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-secondary">
                      <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                      <div className="text-xs text-gray-500 uppercase font-bold">Top Salon</div>
                      <div className="font-bold text-gray-900 text-lg">{stats.favoriteSalon}</div>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                      <div className="text-xs text-gray-500 uppercase font-bold">Favorite Stylist</div>
                      <div className="font-bold text-gray-900 text-lg">{stats.favoriteStaff}</div>
                  </div>
              </div>
          </div>

          {/* Spending Chart (Visual only using Tailwind) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Spending Analysis (Last 6 Months)</h3>
              <div className="flex items-end justify-between h-40 gap-2">
                  {[450, 300, 600, 200, 800, 150].map((val, idx) => {
                      const height = Math.min((val / 1000) * 100, 100); 
                      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
                      return (
                          <div key={idx} className="flex-1 flex flex-col items-center group">
                              <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-secondary/10" style={{ height: '100%' }}>
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-lg transition-all duration-700"
                                    style={{ height: `${height}%` }}
                                  ></div>
                              </div>
                              <span className="text-xs text-gray-400 mt-2 font-medium">{months[idx]}</span>
                              <span className="text-[10px] font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 bg-white shadow px-1 rounded">{val}k</span>
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>
  );

  const renderHistory = () => (
      <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold text-primary mb-2">Booking History</h2>
          {localAppointments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No appointments yet.</p>
              </div>
          ) : (
              localAppointments.map((app) => (
                  <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                          <img 
                            src={app.salonImage || 'https://via.placeholder.com/150'} 
                            className="w-16 h-16 rounded-xl object-cover" 
                            alt=""
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"; }}
                          />
                          <div>
                              <h3 className="font-bold text-gray-900">{app.salonName}</h3>
                              <div className="text-sm text-gray-600 font-medium">{app.serviceName}</div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {app.date || 'Today'}</span>
                                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {app.startTime}</span>
                                  <span className="flex items-center text-secondary font-bold"><DollarSign className="w-3 h-3 mr-1"/> {app.price}k</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === 'completed' ? 'bg-green-100 text-green-700' :
                              app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </div>
                          
                          <div className="flex gap-2">
                             {app.status === 'completed' && !app.isReviewed && (
                                 <button 
                                   onClick={() => handleOpenReview(app)}
                                   className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 shadow-sm"
                                 >
                                     <Edit3 className="w-3 h-3" /> Write Review
                                 </button>
                             )}
                             {app.isReviewed && (
                                 <div className="px-3 py-2 text-gray-400 text-xs font-bold flex items-center gap-1">
                                     <CheckCircle className="w-3 h-3" /> Reviewed
                                 </div>
                             )}
                             
                             <button className="p-2 text-gray-400 hover:text-secondary hover:bg-purple-50 rounded-full transition-colors" title="Rebook">
                                 <RefreshCcw className="w-5 h-5" />
                             </button>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>
  );

  const renderNotifications = () => (
      <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-primary">Notifications</h2>
              {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount} new</span>
              )}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-800 font-medium">
                  Real-time connection active. You will receive updates about salon schedules instantly.
              </span>
          </div>

          <div className="space-y-3">
              {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onMouseEnter={() => !notif.isRead && onReadNotification(notif.id)}
                    className={`p-5 rounded-2xl border transition-all ${
                        notif.isRead 
                        ? 'bg-white border-gray-100 text-gray-500' 
                        : 'bg-white border-secondary/30 shadow-md shadow-purple-50 border-l-4 border-l-secondary'
                    }`}
                  >
                      <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full shrink-0 ${
                              notif.type === 'alert' ? 'bg-red-100 text-red-500' :
                              notif.type === 'reminder' ? 'bg-yellow-100 text-yellow-600' :
                              notif.type === 'success' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                              {notif.type === 'alert' ? <AlertCircle className="w-5 h-5" /> :
                               notif.type === 'reminder' ? <Clock className="w-5 h-5" /> :
                               notif.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                               <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-start">
                                  <h4 className={`font-bold text-sm mb-1 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.timestamp}</span>
                              </div>
                              <p className="text-sm">{notif.message}</p>
                          </div>
                      </div>
                  </div>
              ))}
              {notifications.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No notifications yet.</div>
              )}
          </div>
      </div>
  );

  return (
    <>
        <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                        {user.avatar ? 
                            <img 
                            src={user.avatar} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`; }}
                            /> 
                            : user.name.charAt(0)
                        }
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-sm truncate w-32">{user.name}</div>
                        <div className="text-xs text-gray-400">Member since 2023</div>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5" /> My Stats</div>
                </button>
                <button onClick={() => setActiveTab('history')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><Calendar className="w-5 h-5" /> Bookings</div>
                </button>
                <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><Bell className="w-5 h-5" /> Updates</div>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" /> Sign Out
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        {activeTab === 'overview' ? 'My Activity' : activeTab === 'history' ? 'Booking History' : 'Notification Center'}
                    </h1>
                    <p className="text-gray-500 text-sm">Welcome back, {user.name}!</p>
                </div>
            </header>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'notifications' && renderNotifications()}
        </div>
        </div>

        {/* Review Modal */}
        <SalonReviewModal 
            isOpen={isReviewModalOpen} 
            onClose={() => setIsReviewModalOpen(false)}
            appointment={reviewTarget}
            onSubmit={handleReviewSubmit}
        />
    </>
  );
};

export default UserDashboard;
