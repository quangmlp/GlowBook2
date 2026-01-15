
export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  discountPrice?: number;
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  staffId?: string; // Link review to specific staff
}

export type StaffStatus = 'available' | 'busy' | 'break' | 'off';

export interface Staff {
  id: string;
  name: string;
  role: string;
  experience: string; // e.g. "5 years"
  image: string;
  specialties: string[]; // e.g. ["Fade", "Coloring"]
  bio?: string;
  // Real-time fields
  status: StaffStatus;
  nextAvailableTime?: string; // e.g. "14:30" or "15 mins"
  currentActivity?: string; // e.g. "Cutting Hair", "Washing"
  // Business fields
  baseSalary: number; // Monthly base salary in millions (e.g., 5, 8, 10)
  commissionRate: number; // Percentage (e.g., 10, 15)
  revenueToday: number;
  hoursWorkedToday: number;
}

// Business Model Types
export type PackageType = 'STARTER' | 'COMMISSION' | 'PRO';

export interface BusinessContract {
    signedAt: string;
    termsVersion: string;
    isActive: boolean;
}

export interface WalletTransaction {
    id: string;
    type: 'DEPOSIT' | 'FEE_COMMISSION' | 'FEE_SUBSCRIPTION' | 'FEE_ADS';
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed';
    description: string;
}

export interface Salon {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string; 
  openTime: string; 
  closeTime: string; 
  coordinates?: { lat: number; lng: number }; 
  image: string;
  category: string;
  services: Service[];
  reviews: Review[];
  staff?: Staff[]; 
  discount?: number; 
  isFavorite?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  // Real-time fields
  currentOccupancy: number; 
  liveStatusMessage: string; 
  availableSeats: number;
  totalSeats: number; 
  
  // Business & Finance Fields
  packageType?: PackageType;
  contract?: BusinessContract;
  walletBalance?: number;
  isAdBoosted?: boolean;
  adBoostExpiresAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface User {
  email: string;
  name: string;
  type: 'customer' | 'business' | 'admin';
  avatar?: string;
}

export enum ViewState {
  HOME = 'HOME',
  SALON_DETAIL = 'SALON_DETAIL',
  SAVED = 'SAVED',
  APPOINTMENTS = 'APPOINTMENTS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  BUSINESS_DASHBOARD = 'BUSINESS_DASHBOARD',
  USER_DASHBOARD = 'USER_DASHBOARD', // New view for User Stats
}

export interface HairRecommendation {
  faceShape: string;
  analysis: string;
  styles: {
    name: string;
    description: string;
    reasoning: string;
    generatedImage?: string; 
  }[];
}

export interface Feedback {
  id: string;
  userType: 'customer' | 'business';
  rating: number; 
  q1: string; 
  q2: string; 
  q3: string; 
  q4: string; 
  timestamp: string;
}

export interface WebStats {
  totalVisits: number;
  uniqueVisitors: number;
  bounceRate: string;
  avgSession: string;
  revenueCommission?: number;
  revenueSubscription?: number;
  revenueAds?: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startTime: string; // "HH:mm"
  duration: number; // minutes
  price: number;
  status: 'completed' | 'pending' | 'cancelled' | 'in-progress';
  type: 'online' | 'walk-in';
  // Optional for history
  date?: string; 
  salonName?: string;
  salonImage?: string;
  isReviewed?: boolean;
}

// NEW: User Notifications & Stats
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'reminder' | 'info' | 'success';
    timestamp: string;
    isRead: boolean;
}

export interface UserStats {
    totalSpent: number;
    totalBookings: number;
    favoriteSalon: string;
    favoriteStaff: string;
    mostBookedService: string;
    usualTimeSlot: string; // e.g., "Evening (17:00-20:00)"
}
