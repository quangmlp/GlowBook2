
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SalonCard from './components/SalonCard';
import BookingModal from './components/BookingModal';
import AIStylist from './components/AIStylist';
import CategoryCard from './components/CategoryCard';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import SearchBar from './components/SearchBar';
import ReviewList from './components/ReviewList';
import StaffList from './components/StaffList';
import StaffDetailModal from './components/StaffDetailModal';
import HorizontalScrollList from './components/HorizontalScrollList';
import HairConsultantModal from './components/HairConsultantModal';
import FeedbackModal from './components/FeedbackModal';
import FloatingFeedbackButton from './components/FloatingFeedbackButton';
import AdminDashboard from './components/AdminDashboard';
import BusinessDashboard from './components/BusinessDashboard';
import UserDashboard from './components/UserDashboard'; // New Import
import { Salon, ViewState, Service, User, Staff, Review, HairRecommendation, StaffStatus, Feedback, WebStats, Appointment, Notification, UserStats } from './types';
import { generateSalonDescription } from './services/gemini';
import { getStoredFeedbacks, saveStoredFeedback } from './services/storage';
import { ChevronLeft, MapPin, Scissors, Sparkles, Smile, Footprints, User as UserIcon, Heart, TrendingUp, ThumbsUp, Calendar, Camera, Activity, Clock, Users, AlertCircle } from 'lucide-react';

// --- DATA POOLS FOR GENERATION ---
const MALE_NAMES = ['Tuan', 'Hung', 'Minh', 'Duc', 'Nam', 'Hoang', 'Hieu', 'Trung', 'Kien', 'Lam', 'Son', 'Dat', 'Cuong', 'Thang', 'Dung', 'Hai', 'Long', 'Khanh', 'Bao', 'Viet'];
const FEMALE_NAMES = ['Lan', 'Mai', 'Huong', 'Trang', 'Huyen', 'Linh', 'Thu', 'Ha', 'Ngoc', 'Vy', 'Phuong', 'Thao', 'Chi', 'Quynh', 'Anh', 'Nhung', 'Diep', 'Yen', 'Tram', 'Oanh'];

// Updated Reliable Unsplash IDs
const STAFF_IMAGES_MALE = [
    '1539571696357-5a69c17a67c6', 
    '1500648767791-00dcc994a43e', 
    '1507003211169-0a1dd7228f2d', 
    '1480429370139-e0132c086e2a', 
    '1519085360753-af0119f7cbe7', 
    '1506794778202-cad84cf45f1d', 
    '1583195764036-6dc248ac07d9', 
    '1568602471122-7832951cc4c5',
    '1492562080023-ab3db95bfbce',
    '1504257432398-4346305031ba'
];

const STAFF_IMAGES_FEMALE = [
    '1494790108377-be9c29b29330', 
    '1573496359142-b8d87734a5a2', 
    '1544005313-94ddf0286df2',    
    '1580489944761-15a19d654956', 
    '1559839734-2b71ea197ec2',    
    '1517365830460-955ce3ccd263', 
    '1525186402429-b4ff38bedec6', 
    '1589156280159-27698a70f29e', 
    '1534528741775-53994a69daeb',
    '1438761681033-6461ffad8d80'
];

const SPECIALTIES = {
    Barber: ['Fade Cut', 'Beard Trim', 'Tattoo Hair', 'Pompadour', 'Hot Towel', 'Side Part'],
    Hair: ['Layer Cut', 'Balayage', 'Perm', 'Bleaching', 'Keratin', 'Bob Cut'],
    Nails: ['Gel Art', 'Acrylics', 'Ombre', 'Stone Art', 'Cuticle Care'],
    Spa: ['Acne Treatment', 'Laser', 'Skin Care', 'Whitening', 'Peeling'],
    Massage: ['Thai Massage', 'Shiatsu', 'Hot Stone', 'Foot Reflexology', 'Oil Massage'],
    Face: ['Deep Cleansing', 'Anti-Aging', 'Mask', 'Lifting', 'Hydration']
};

const ROLES = {
    Barber: ['Master Barber', 'Senior Barber', 'Stylist', 'Top Stylist'],
    Hair: ['Creative Director', 'Senior Stylist', 'Colorist', 'Junior Stylist'],
    Nails: ['Master Tech', 'Senior Tech', 'Nail Artist', 'Junior Tech'],
    Spa: ['Dermatologist', 'Senior Therapist', 'Esthetician'],
    Massage: ['Master Therapist', 'Senior Therapist', 'Therapist'],
    Face: ['Skin Expert', 'Doctor', 'Therapist']
};

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Updated Reliable Salon IDs
const SALON_IMAGES = {
    Barber: ['1585747860715-2ba37e788b70', '1503951914875-befca64fae3a', '1621605815971-fbc98d665033', '1599351436213-9971f64d6d29', '1534351590666-bcbf8d836476', '1593702295094-d925d3146543'],
    Hair: ['1560066984-138dadb4c035', '1634449571079-bf1a806d4285', '1522337660859-02fbefca4702', '1562322140-8baeececf3df', '1595476108692-38d707d90343', '1521590860650-85d48084a58e'],
    Nails: ['1604654894610-df63bc536371', '1632345031435-8727f6897d53', '1516975080664-ed2fc6a32937', '1519014816548-bf5fe059e98b', '1522337360705-255b818a7ecb', '1613978627464-9043597d8c6b'],
    Spa: ['1544161515-4ab6ce6db874', '1570172619644-dfd03ed5d881', '1600334089648-b0d9d3028eb2', '1540555700478-4be289fbecef', '1515377905703-c47889512026', '1600334129128-685c529f3237'],
    Massage: ['1600334089648-b0d9d3028eb2', '1544161515-4ab6ce6db874', '1519823551278-64ac92734fb1', '1570172619644-dfd03ed5d881', '1540555700478-4be289fbecef'],
    Face: ['1616394584738-fc6e612e71b9', '1598209279122-8541213a0383', '1559839734-2b71ea197ec2', '1512290923902-8a92f1cfa0b3', '1570172619644-dfd03ed5d881', '1600334129128-685c529f3237']
};

const createUniqueStaff = (salonId: string, category: keyof typeof SPECIALTIES, count: number): Staff[] => {
    const staff: Staff[] = [];
    for (let i = 0; i < count; i++) {
        const isMale = category === 'Barber' || (category === 'Hair' && Math.random() > 0.5);
        const namePool = isMale ? MALE_NAMES : FEMALE_NAMES;
        const imgPool = isMale ? STAFF_IMAGES_MALE : STAFF_IMAGES_FEMALE;
        
        const firstName = getRandom(namePool);
        const name = `${firstName} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`; 
        
        const imgId = getRandom(imgPool);

        const rand = Math.random();
        let status: StaffStatus = 'available';
        let activity = 'Free';
        let nextTime = 'Now';

        if (rand > 0.8) {
            status = 'off';
            activity = 'Off Duty';
            nextTime = 'Tomorrow';
        } else if (rand > 0.7) {
            status = 'break';
            activity = 'On Break';
            nextTime = '30 mins';
        } else if (rand > 0.3) {
            status = 'busy';
            activity = getRandom(['Cutting', 'Washing', 'Styling', 'Treatment', 'Consulting']);
            nextTime = `${Math.floor(Math.random() * 45) + 10} mins`;
        }

        staff.push({
            id: `st_${salonId}_${i}`,
            name: name,
            role: getRandom(ROLES[category] || ROLES.Hair),
            experience: `${Math.floor(Math.random() * 10) + 1} years`,
            image: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&q=80&w=200`,
            specialties: getRandomItems(SPECIALTIES[category] || SPECIALTIES.Hair, 3),
            bio: `Passionate ${category.toLowerCase()} expert with a focus on details and customer satisfaction.`,
            status,
            currentActivity: activity,
            nextAvailableTime: nextTime,
            baseSalary: Math.floor(Math.random() * 6) + 4, 
            commissionRate: Math.floor(Math.random() * 15) + 5,
            revenueToday: 0,
            hoursWorkedToday: 0
        });
    }
    return staff;
};

const createUniqueReviews = (salonId: string, staffList: Staff[]): Review[] => {
    const reviews: Review[] = [];
    const count = Math.floor(Math.random() * 5) + 3; 
    
    const comments = ["Dịch vụ tuyệt vời, sẽ quay lại.", "Nhân viên nhiệt tình.", "Không gian đẹp, sạch sẽ.", "Làm rất cẩn thận, ưng ý.", "Giá cả hợp lý so với chất lượng."];
    
    for (let i = 0; i < count; i++) {
        reviews.push({
            id: `r_${salonId}_${i}`,
            userName: getRandom([...MALE_NAMES, ...FEMALE_NAMES]) + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".",
            rating: Math.random() > 0.7 ? 5 : 4,
            date: `${Math.floor(Math.random() * 30) + 1} days ago`,
            comment: getRandom(comments),
            staffId: getRandom(staffList)?.id
        });
    }
    return reviews;
};

const createSalon = (id: string, name: string, type: 'Barber' | 'Hair' | 'Nails' | 'Spa' | 'Massage' | 'Face', location: string, rating: number, reviews: number): Salon => {
    const staffCount = Math.floor(Math.random() * 4) + 3;
    const uniqueStaff = createUniqueStaff(id, type, staffCount);
    const uniqueReviews = createUniqueReviews(id, uniqueStaff);
    const imgId = getRandom(SALON_IMAGES[type] || SALON_IMAGES.Hair);
    const busyStaff = uniqueStaff.filter(s => s.status === 'busy').length;
    const occupancy = Math.round((busyStaff / staffCount) * 100);

    return {
        id, name, category: type, location, phone: '0912345678', openTime: '09:00', closeTime: '20:00', rating, reviewCount: reviews,
        image: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&q=80&w=800`,
        services: [
            { id: `s_${id}_1`, name: 'Standard Service', duration: 45, price: 100, description: 'High quality service.' },
            { id: `s_${id}_2`, name: 'Premium Treatment', duration: 90, price: 300, description: 'Full package care.' },
            { id: `s_${id}_3`, name: 'Express Care', duration: 30, price: 80, description: 'Quick and effective.' }
        ],
        reviews: uniqueReviews,
        staff: uniqueStaff,
        isTrending: Math.random() > 0.6, isNew: Math.random() > 0.7, isRecommended: Math.random() > 0.5, discount: Math.random() > 0.7 ? 15 : undefined,
        currentOccupancy: occupancy, liveStatusMessage: "Normal hours", availableSeats: staffCount - busyStaff, totalSeats: staffCount + 2,
    };
};

// --- MOCK DATA ---
const MOCK_SALONS: Salon[] = [
  createSalon('1', '30Shine Premium', 'Barber', '346 Bach Mai, Hai Ba Trung', 4.8, 3240),
  createSalon('2', 'Liem Barber Shop', 'Barber', '82 Le Thanh Nghi, Bach Khoa', 4.9, 2100),
  createSalon('3', 'Phong Bvlb', 'Barber', '15 Ta Quang Buu, Bach Khoa', 4.7, 890),
  createSalon('4', 'Mane Man Barber House', 'Barber', 'K10B Bach Khoa, Hai Ba Trung', 4.8, 560),
  createSalon('5', 'House of Barbaard', 'Barber', '36 Hang Chao (Near BK)', 5.0, 1200),
  createSalon('11', '1900 Hair Salon', 'Hair', '108 Nguyen An Ninh', 4.7, 1500),
  createSalon('12', 'Sinh Anh Hair', 'Hair', '466 De La Thanh', 4.6, 2200),
  createSalon('21', 'Hale\'i Nail & Spa', 'Nails', '48 Tran Dai Nghia', 4.9, 890),
  createSalon('26', 'Seoul Spa', 'Face', '80 Pho Hue', 4.9, 5000),
];

const TRENDING_SALONS = MOCK_SALONS.slice(0, 5);
const RECOMMENDED_SALONS = MOCK_SALONS.slice(2, 7);
const NEW_SALONS = MOCK_SALONS.slice(4, 9);

const CATEGORIES = [
    { label: 'Hair', icon: Scissors }, { label: 'Nails', icon: Sparkles }, { label: 'Massage', icon: Footprints },
    { label: 'Face', icon: Smile }, { label: 'Barber', icon: UserIcon }, { label: 'Spa', icon: Sparkles }
];

// --- MOCK USER HISTORY & NOTIFICATIONS ---
const MOCK_USER_HISTORY: Appointment[] = [
    { id: 'h1', customerName: 'Me', serviceId: 's_1_2', serviceName: 'Premium Treatment', staffId: 'st_1_0', startTime: '17:30', duration: 90, price: 300, status: 'completed', type: 'online', date: 'Oct 20', salonName: '30Shine Premium', salonImage: MOCK_SALONS[0].image },
    { id: 'h2', customerName: 'Me', serviceId: 's_2_1', serviceName: 'Fade Cut', staffId: 'st_2_1', startTime: '18:00', duration: 45, price: 150, status: 'completed', type: 'online', date: 'Sep 25', salonName: 'Liem Barber Shop', salonImage: MOCK_SALONS[1].image },
    { id: 'h3', customerName: 'Me', serviceId: 's_1_1', serviceName: 'Standard Cut', staffId: 'st_1_0', startTime: '17:00', duration: 45, price: 100, status: 'completed', type: 'online', date: 'Aug 28', salonName: '30Shine Premium', salonImage: MOCK_SALONS[0].image },
    { id: 'h4', customerName: 'Me', serviceId: 's_5_2', serviceName: 'Beard Trim', staffId: 'st_5_1', startTime: '19:00', duration: 30, price: 200, status: 'completed', type: 'online', date: 'Aug 05', salonName: 'House of Barbaard', salonImage: MOCK_SALONS[4].image },
];

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', title: 'Booking Confirmed', message: 'Your appointment at 30Shine Premium is confirmed for tomorrow.', type: 'success', timestamp: '2 hours ago', isRead: false },
    { id: 'n2', title: 'Discount Alert', message: 'Liem Barber Shop has a 20% flash sale today!', type: 'info', timestamp: '1 day ago', isRead: true }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [salons, setSalons] = useState<Salon[]>(MOCK_SALONS);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>(MOCK_SALONS);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); 
  
  const [isHairConsultantOpen, setIsHairConsultantOpen] = useState(false);
  const [consultationImage, setConsultationImage] = useState<string | null>(null);
  const [consultationResult, setConsultationResult] = useState<HairRecommendation | null>(null);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Use persistent storage for feedbacks
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  useEffect(() => {
      // Load initial feedbacks from local storage
      setFeedbacks(getStoredFeedbacks());
  }, []);

  const [webStats, setWebStats] = useState<WebStats>({
      totalVisits: 15420, uniqueVisitors: 8340, bounceRate: '42%', avgSession: '4m 32s',
      revenueCommission: 1250, revenueSubscription: 4000, revenueAds: 1500
  });

  const [generatedDescriptions, setGeneratedDescriptions] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // USER DASHBOARD DATA
  const [userHistory, setUserHistory] = useState<Appointment[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
      totalSpent: 0, totalBookings: 0, favoriteSalon: '', favoriteStaff: '', mostBookedService: '', usualTimeSlot: ''
  });

  const [mySalonData, setMySalonData] = useState<Salon>(MOCK_SALONS[0]);

  useEffect(() => {
      setWebStats(prev => ({ ...prev, totalVisits: prev.totalVisits + Math.floor(Math.random() * 5) }));
  }, []);

  useEffect(() => {
    if (selectedSalon && !generatedDescriptions[selectedSalon.id]) {
      generateSalonDescription(selectedSalon.name, selectedSalon.category)
        .then(desc => {
          setGeneratedDescriptions(prev => ({ ...prev, [selectedSalon.id]: desc }));
        });
    }
  }, [selectedSalon]);

  // Handle Role Login redirection & Data Loading
  useEffect(() => {
      if (currentUser?.type === 'admin') {
          setView(ViewState.ADMIN_DASHBOARD);
      } else if (currentUser?.type === 'business') {
          setView(ViewState.BUSINESS_DASHBOARD);
      } else if (currentUser?.type === 'customer') {
          // Load Mock User Data
          setUserHistory(MOCK_USER_HISTORY);
          setUserNotifications(MOCK_NOTIFICATIONS);
          
          // Calculate stats
          const totalSpent = MOCK_USER_HISTORY.reduce((sum, app) => sum + app.price, 0);
          setUserStats({
              totalSpent,
              totalBookings: MOCK_USER_HISTORY.length,
              favoriteSalon: '30Shine Premium', // Mock calculation
              favoriteStaff: 'Tuan A.', // Mock
              mostBookedService: 'Premium Treatment',
              usualTimeSlot: 'Evening (17:00 - 19:00)'
          });
      }
      
      if (currentUser && (view === ViewState.ADMIN_DASHBOARD || view === ViewState.BUSINESS_DASHBOARD || view === ViewState.USER_DASHBOARD)) {
          // Keep current view if appropriate
      } else {
          setView(ViewState.HOME);
      }
  }, [currentUser]);

  // --- REAL-TIME NOTIFICATION SIMULATOR ---
  useEffect(() => {
      if (!currentUser || currentUser.type !== 'customer') return;

      const interval = setInterval(() => {
          const rand = Math.random();
          let newNotif: Notification | null = null;
          
          if (rand > 0.95) { // 5% chance every tick
              const alerts = [
                  { title: 'Emergency Closure', msg: '30Shine Premium is closing early today due to power outage.', type: 'alert' },
                  { title: 'Schedule Change', msg: 'Stylist Tuan A. is now available at 19:00 today.', type: 'info' },
                  { title: 'Reminder', msg: 'It has been 3 weeks since your last cut. Time to book?', type: 'reminder' }
              ];
              const item = getRandom(alerts);
              newNotif = {
                  id: `n_${Date.now()}`,
                  title: item.title,
                  message: item.msg,
                  type: item.type as any,
                  timestamp: 'Just now',
                  isRead: false
              };
          }

          if (newNotif) {
              setUserNotifications(prev => [newNotif!, ...prev]);
          }
      }, 5000); // Check every 5s

      return () => clearInterval(interval);
  }, [currentUser]);

  const handleSalonClick = (salon: Salon) => {
    setSelectedSalon(salon);
    setView(ViewState.SALON_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBookClick = (service: Service) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setBookingService(service);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const update = (prev: Salon[]) => prev.map(salon => 
        salon.id === id ? { ...salon, isFavorite: !salon.isFavorite } : salon
    );
    setSalons(update);
    setFilteredSalons(update);
  };

  const handleSearch = (query: string, location: string, date: string) => {
    setIsSearching(!!query || !!location || !!date);
    let result = salons;
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(lowerQuery) || s.category.toLowerCase().includes(lowerQuery) || s.services.some(svc => svc.name.toLowerCase().includes(lowerQuery)));
    }
    if (location) {
      result = result.filter(s => s.location.toLowerCase().includes(location.toLowerCase()));
    }
    setFilteredSalons(result);
  };

  const handleFeedbackSubmit = (newFeedback: Feedback) => {
      const updated = saveStoredFeedback(newFeedback);
      setFeedbacks(updated);
  };

  const handleSalonUpdate = (updated: Salon) => {
      setMySalonData(updated);
      const newGlobalList = salons.map(s => s.id === updated.id ? updated : s);
      setSalons(newGlobalList);
  };

  const savedSalons = salons.filter(s => s.isFavorite);

  // VIEW ROUTING
  if (view === ViewState.ADMIN_DASHBOARD && currentUser?.type === 'admin') {
      return (
          <AdminDashboard stats={webStats} feedbacks={feedbacks} onExit={() => { setCurrentUser(null); setView(ViewState.HOME); }} />
      );
  }

  if (view === ViewState.BUSINESS_DASHBOARD && currentUser?.type === 'business') {
      return (
          <BusinessDashboard salonData={mySalonData} onUpdateSalon={handleSalonUpdate} onExit={() => { setCurrentUser(null); setView(ViewState.HOME); }} />
      );
  }

  if (view === ViewState.USER_DASHBOARD && currentUser?.type === 'customer') {
      return (
          <UserDashboard 
            user={currentUser}
            appointments={userHistory}
            notifications={userNotifications}
            stats={userStats}
            onExit={() => { setCurrentUser(null); setView(ViewState.HOME); }}
            onReadNotification={(id) => setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
          />
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
      <Navbar 
        setView={setView} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW: HOME */}
        {view === ViewState.HOME && (
          <div className="animate-fade-in space-y-12">
            <div className="text-center max-w-5xl mx-auto pt-4 md:pt-10 pb-2">
              <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight leading-tight">
                Book local beauty <br className="hidden md:block"/> & wellness in Hanoi
              </h1>
              <button 
                onClick={() => setIsHairConsultantOpen(true)}
                className="mb-8 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
              >
                <Camera className="w-4 h-4" /> Try AI Hair Consultant
              </button>
              <SearchBar onSearch={handleSearch} />
            </div>

            {isSearching ? (
               <div>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-primary">Search Results ({filteredSalons.length})</h2>
                      <button onClick={() => { setIsSearching(false); setFilteredSalons(salons); }} className="text-secondary font-medium">Clear Search</button>
                  </div>
                  {filteredSalons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredSalons.map((salon) => (
                        <SalonCard key={salon.id} salon={salon} onClick={handleSalonClick} onToggleFavorite={toggleFavorite} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No venues found matching your criteria.</p>
                    </div>
                  )}
               </div>
            ) : (
               <>
                <div>
                    <h2 className="text-xl font-bold text-primary mb-4 px-1">Browse by category</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
                        {CATEGORIES.map((cat) => (
                            <CategoryCard key={cat.label} label={cat.label} icon={cat.icon} onClick={() => handleSearch(cat.label, '', '')} />
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-purple-900 to-primary rounded-2xl p-6 md:p-10 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">New to GlowBook?</h3>
                        <p className="text-purple-200 mb-6">Get 100k off your first booking when you use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">GLOW100</span> at checkout.</p>
                        <button onClick={() => setIsAuthOpen(true)} className="bg-white text-primary px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">Claim Offer</button>
                    </div>
                    <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                </div>
                <div className="space-y-8">
                  <HorizontalScrollList title="Trending Near Bach Khoa" icon={TrendingUp} items={TRENDING_SALONS} onItemClick={handleSalonClick} onToggleFavorite={toggleFavorite} />
                  <HorizontalScrollList title="Recommended For You" icon={ThumbsUp} items={RECOMMENDED_SALONS} onItemClick={handleSalonClick} onToggleFavorite={toggleFavorite} />
                  <HorizontalScrollList title="New on GlowBook" icon={Sparkles} items={NEW_SALONS} onItemClick={handleSalonClick} onToggleFavorite={toggleFavorite} />
                </div>
               </>
            )}
          </div>
        )}

        {/* VIEW: SAVED */}
        {view === ViewState.SAVED && (
            <div className="animate-fade-in max-w-4xl mx-auto min-h-[60vh]">
                <h1 className="text-3xl font-bold text-primary mb-8">Saved Venues</h1>
                {savedSalons.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No saved venues yet</h3>
                        <p className="text-gray-500 mt-2">Start exploring to find your next favorite spot.</p>
                        <button onClick={() => setView(ViewState.HOME)} className="mt-6 px-6 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-purple-700">Explore Venues</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedSalons.map(salon => (
                            <SalonCard key={salon.id} salon={salon} onClick={handleSalonClick} onToggleFavorite={toggleFavorite} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* VIEW: SALON DETAIL */}
        {view === ViewState.SALON_DETAIL && selectedSalon && (
          <div className="animate-fade-in">
            <button onClick={() => setView(ViewState.HOME)} className="mb-6 flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Search
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-start justify-between">
                            <h1 className="text-4xl font-extrabold text-primary mb-2">{selectedSalon.name}</h1>
                            {selectedSalon.discount && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Up to {selectedSalon.discount}% off</span>}
                        </div>
                        <div className="flex items-center text-gray-500 mb-4 gap-4">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedSalon.location}</span>
                            <span className="flex items-center"><Heart className="w-4 h-4 mr-1" /> {selectedSalon.reviewCount} reviews</span>
                        </div>
                        <div className="mb-6">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSalon.name + ' ' + selectedSalon.location)}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-secondary font-bold text-sm hover:underline"><MapPin className="w-4 h-4 mr-1" /> View on Google Maps</a>
                        </div>
                        {/* LIVE SITUATION DASHBOARD */}
                        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 mb-8 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-3">
                                 <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold border border-green-100 animate-pulse">
                                     <div className="w-2 h-2 bg-green-500 rounded-full" /> LIVE UPDATE
                                 </div>
                             </div>
                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-secondary" /> Live Situation</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Status</div>
                                     <div className="font-bold text-gray-900 text-sm flex items-center gap-1"><Clock className="w-3 h-3 text-secondary" /> {selectedSalon.liveStatusMessage}</div>
                                 </div>
                                 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Seats</div>
                                     <div className="font-bold text-gray-900 text-sm">{selectedSalon.availableSeats} Available</div>
                                 </div>
                                 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Crowd</div>
                                     <div className="font-bold text-gray-900 text-sm flex items-center gap-1"><Users className="w-3 h-3 text-secondary" /> {selectedSalon.currentOccupancy > 80 ? 'Heavy' : selectedSalon.currentOccupancy > 40 ? 'Moderate' : 'Light'} ({selectedSalon.currentOccupancy}%)</div>
                                 </div>
                                 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Wait Time</div>
                                     <div className="font-bold text-gray-900 text-sm">~{selectedSalon.currentOccupancy > 70 ? '20' : '5'} mins</div>
                                 </div>
                             </div>
                             {selectedSalon.currentOccupancy > 80 && <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span>High traffic detected. We recommend booking in advance.</span></div>}
                        </div>
                        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 relative overflow-hidden mb-8">
                            <div className="relative z-10">
                                <h3 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Our Vibe</h3>
                                <p className="text-gray-800 leading-relaxed font-medium">{generatedDescriptions[selectedSalon.id] || "Generating description..."}</p>
                            </div>
                        </div>
                         <div className="mb-10">
                            <h2 className="text-xl font-bold text-primary mb-4">Services</h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                                {selectedSalon.services.map(service => (
                                    <div key={service.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleBookClick(service)}>
                                        <div className="mb-4 sm:mb-0">
                                            <h3 className="font-bold text-gray-900 group-hover:text-secondary transition-colors text-lg">{service.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{service.duration} mins • <span className="text-gray-400 line-clamp-1">{service.description}</span></p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                            <div className="text-right">
                                                {service.discountPrice ? <div className="flex flex-col items-end"><span className="font-bold text-gray-900 text-lg">{service.discountPrice}k</span><span className="text-sm text-gray-400 line-through">{service.price}k</span></div> : <span className="font-bold text-gray-900 text-lg">{service.price}k</span>}
                                            </div>
                                            <button className="px-6 py-2.5 bg-white border-2 border-secondary text-secondary font-bold text-sm rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">Book</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <StaffList staff={selectedSalon.staff} onStaffClick={setSelectedStaff} />
                        <ReviewList reviews={selectedSalon.reviews} />
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <img 
                          src={selectedSalon.image} 
                          alt={selectedSalon.name} 
                          className="w-full h-64 object-cover rounded-xl" 
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"; }} 
                        />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Opening Hours</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between pb-2 border-b border-gray-50"><span className="text-gray-500">Monday - Friday</span><span className="text-gray-900 font-bold">{selectedSalon.openTime || "09:00"} - {selectedSalon.closeTime || "20:00"}</span></div>
                            <div className="flex justify-between pb-2 border-b border-gray-50"><span className="text-gray-500">Saturday</span><span className="text-gray-900 font-bold">10:00 AM - 6:00 PM</span></div>
                            <div className="flex justify-between text-red-500 font-medium"><span>Sunday</span><span>Closed</span></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {view === ViewState.APPOINTMENTS && (
            <div className="animate-fade-in max-w-2xl mx-auto text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-10 h-10 text-gray-400" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No upcoming appointments</h2>
                <p className="text-gray-500 mb-8">Schedule your first treatment today.</p>
                <button onClick={() => setView(ViewState.HOME)} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">Find a Salon</button>
            </div>
        )}
      </main>

      <FloatingFeedbackButton onClick={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} onSubmit={handleFeedbackSubmit} initialUserType={currentUser?.type === 'business' ? 'business' : 'customer'} />
      {isHairConsultantOpen && <HairConsultantModal onClose={() => setIsHairConsultantOpen(false)} onSearchStyle={(style) => { handleSearch(style, '', ''); setIsHairConsultantOpen(false); }} persistedImage={consultationImage} setPersistedImage={setConsultationImage} persistedResult={consultationResult} setPersistedResult={setConsultationResult} />}
      {selectedStaff && selectedSalon && <StaffDetailModal staff={selectedStaff} reviews={selectedSalon.reviews} onClose={() => setSelectedStaff(null)} />}
      {bookingService && selectedSalon && <BookingModal service={bookingService} salon={selectedSalon} onClose={() => setBookingService(null)} onOpenFeedback={() => setIsFeedbackOpen(true)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onLogin={(user) => { setCurrentUser(user); setIsAuthOpen(false); }} />}
      <AIStylist />
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;
