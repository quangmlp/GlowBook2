
import { Feedback } from '../types';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

const STORAGE_KEY = 'glowbook_feedbacks';

// Initial Mock Data (Expanded to ~33 items)
const INITIAL_FEEDBACKS: Feedback[] = [
    { id: '1', userType: 'customer', rating: 5, q1: 'Fast Search', q2: 'None', q3: 'Yes, absolutely', q4: 'Loyalty Points', timestamp: '10/24/2023, 10:30 AM' },
    { id: '2', userType: 'business', rating: 4, q1: 'Staff Management', q2: 'Mobile App', q3: 'Monthly Subscription', q4: 'Payroll', timestamp: '10/24/2023, 11:15 AM' },
    { id: '3', userType: 'customer', rating: 4, q1: 'Beautiful Interface', q2: 'Slow Loading', q3: 'Yes, but need more reviews', q4: 'Video Call Consultation', timestamp: '10/25/2023, 09:00 AM' },
    { id: '4', userType: 'customer', rating: 5, q1: 'Instant Confirmation', q2: 'None', q3: 'Yes, absolutely', q4: 'Home Service', timestamp: '10/25/2023, 09:30 AM' },
    { id: '5', userType: 'business', rating: 3, q1: 'Revenue Stats', q2: 'Desktop/Laptop', q3: 'Commission per booking', q4: 'Marketing Tools', timestamp: '10/25/2023, 10:00 AM' },
    // --- 28 NEW ENTRIES BELOW ---
    { id: '6', userType: 'customer', rating: 5, q1: 'Quality of Salons', q2: 'None', q3: 'Yes, absolutely', q4: 'Gift Cards', timestamp: '10/26/2023, 08:15 AM' },
    { id: '7', userType: 'customer', rating: 5, q1: 'Other', q2: 'None', q3: 'Yes, absolutely', q4: 'Chat with Stylist', timestamp: '10/26/2023, 09:20 AM' }, // Custom: AI Stylist feature
    { id: '8', userType: 'business', rating: 5, q1: 'Auto Email', q2: 'Mobile App', q3: 'Commission per booking', q4: 'SMS Marketing', timestamp: '10/26/2023, 10:00 AM' },
    { id: '9', userType: 'customer', rating: 3, q1: 'Clear Information', q2: 'Booking Errors', q3: 'Maybe, if payment is secure', q4: 'Home Service', timestamp: '10/26/2023, 11:45 AM' },
    { id: '10', userType: 'business', rating: 4, q1: 'Inventory', q2: 'Tablet', q3: 'Freemium', q4: 'POS Integration', timestamp: '10/26/2023, 02:30 PM' },
    { id: '11', userType: 'customer', rating: 5, q1: 'Beautiful Interface', q2: 'None', q3: 'Yes, absolutely', q4: 'Dark Mode', timestamp: '10/27/2023, 09:00 AM' },
    { id: '12', userType: 'customer', rating: 4, q1: 'Fast Search', q2: 'Other', q3: 'Yes, but need more reviews', q4: 'Loyalty Points', timestamp: '10/27/2023, 10:10 AM' }, // Custom Q2: Map lagging
    { id: '13', userType: 'business', rating: 5, q1: 'Revenue Stats', q2: 'Both equally', q3: 'Commission per booking', q4: 'Marketing Tools', timestamp: '10/27/2023, 11:00 AM' },
    { id: '14', userType: 'customer', rating: 5, q1: 'Instant Confirmation', q2: 'None', q3: 'Yes, absolutely', q4: 'Video Call Consultation', timestamp: '10/27/2023, 01:20 PM' },
    { id: '15', userType: 'business', rating: 2, q1: 'CRM (Customer Profile)', q2: 'Desktop/Laptop', q3: 'Monthly Subscription', q4: 'Payroll', timestamp: '10/27/2023, 04:00 PM' },
    { id: '16', userType: 'customer', rating: 5, q1: 'Other', q2: 'None', q3: 'Yes, absolutely', q4: 'Other', timestamp: '10/28/2023, 08:30 AM' }, // AI suggestion was spot on
    { id: '17', userType: 'customer', rating: 4, q1: 'Quality of Salons', q2: 'Slow Loading', q3: 'Yes, absolutely', q4: 'Chat with Stylist', timestamp: '10/28/2023, 09:45 AM' },
    { id: '18', userType: 'business', rating: 5, q1: 'Staff Management', q2: 'Mobile App', q3: 'Commission per booking', q4: 'Inventory Management', timestamp: '10/28/2023, 10:30 AM' },
    { id: '19', userType: 'customer', rating: 3, q1: 'Clear Information', q2: 'Login Issues', q3: 'No, looks fake', q4: 'Dark Mode', timestamp: '10/28/2023, 12:15 PM' },
    { id: '20', userType: 'customer', rating: 5, q1: 'Beautiful Interface', q2: 'None', q3: 'Yes, absolutely', q4: 'Home Service', timestamp: '10/28/2023, 03:00 PM' },
    { id: '21', userType: 'business', rating: 4, q1: 'Revenue Stats', q2: 'Tablet', q3: 'Prepaid Credits', q4: 'SMS Marketing', timestamp: '10/29/2023, 09:00 AM' },
    { id: '22', userType: 'customer', rating: 5, q1: 'Fast Search', q2: 'None', q3: 'Yes, absolutely', q4: 'Loyalty Points', timestamp: '10/29/2023, 10:30 AM' },
    { id: '23', userType: 'customer', rating: 4, q1: 'Instant Confirmation', q2: 'Confusing Navigation', q3: 'Yes, but need more reviews', q4: 'Video Call Consultation', timestamp: '10/29/2023, 11:45 AM' },
    { id: '24', userType: 'business', rating: 5, q1: 'Auto Email', q2: 'Both equally', q3: 'Commission per booking', q4: 'Other', timestamp: '10/29/2023, 02:00 PM' }, // Need API access
    { id: '25', userType: 'customer', rating: 5, q1: 'Quality of Salons', q2: 'None', q3: 'Yes, absolutely', q4: 'Gift Cards', timestamp: '10/30/2023, 08:45 AM' },
    { id: '26', userType: 'customer', rating: 2, q1: 'Other', q2: 'Booking Errors', q3: 'Maybe, if payment is secure', q4: 'Chat with Stylist', timestamp: '10/30/2023, 10:00 AM' },
    { id: '27', userType: 'business', rating: 4, q1: 'Staff Management', q2: 'Mobile App', q3: 'Monthly Subscription', q4: 'Payroll', timestamp: '10/30/2023, 11:30 AM' },
    { id: '28', userType: 'customer', rating: 5, q1: 'Beautiful Interface', q2: 'None', q3: 'Yes, absolutely', q4: 'Dark Mode', timestamp: '10/30/2023, 01:15 PM' },
    { id: '29', userType: 'customer', rating: 4, q1: 'Clear Information', q2: 'Other', q3: 'Yes, absolutely', q4: 'Home Service', timestamp: '10/30/2023, 03:30 PM' }, // 30Shine info is great
    { id: '30', userType: 'business', rating: 5, q1: 'Revenue Stats', q2: 'Desktop/Laptop', q3: 'Commission per booking', q4: 'Marketing Tools', timestamp: '10/31/2023, 09:00 AM' },
    { id: '31', userType: 'customer', rating: 5, q1: 'Fast Search', q2: 'None', q3: 'Yes, absolutely', q4: 'Loyalty Points', timestamp: '10/31/2023, 10:45 AM' },
    { id: '32', userType: 'customer', rating: 1, q1: 'Other', q2: 'Login Issues', q3: 'No, looks fake', q4: 'Video Call Consultation', timestamp: '10/31/2023, 12:00 PM' },
    { id: '33', userType: 'business', rating: 3, q1: 'CRM (Customer Profile)', q2: 'Tablet', q3: 'Freemium', q4: 'POS Integration', timestamp: '10/31/2023, 02:30 PM' }
];

/**
 * Lấy feedback từ Cloud (Firebase) hoặc LocalStorage
 */
export const getStoredFeedbacks = async (): Promise<Feedback[]> => {
    // 1. Ưu tiên lấy từ Firebase nếu đã cấu hình
    if (db) {
        try {
            const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const firebaseData: Feedback[] = [];
            querySnapshot.forEach((doc) => {
                firebaseData.push({ id: doc.id, ...doc.data() } as Feedback);
            });
            
            if (firebaseData.length > 0) return firebaseData;
            return INITIAL_FEEDBACKS; // Trả về mock nếu DB rỗng để demo đẹp
        } catch (e) {
            console.error("Error fetching from Firebase, falling back to LocalStorage", e);
        }
    }

    // 2. Fallback về LocalStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
        return INITIAL_FEEDBACKS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
};

/**
 * Lưu feedback mới vào Cloud và LocalStorage
 */
export const saveStoredFeedback = async (feedback: Feedback): Promise<Feedback[]> => {
    // 1. Lưu vào Firebase
    if (db) {
        try {
            // Thêm field createdAt để sort
            await addDoc(collection(db, "feedbacks"), {
                ...feedback,
                createdAt: Timestamp.now()
            });
        } catch (e) {
            console.error("Error saving to Firebase", e);
            alert("Could not save to Cloud Database. Saving locally instead.");
        }
    }

    // 2. Luôn lưu vào LocalStorage để backup/hiển thị nhanh
    const currentLocal = localStorage.getItem(STORAGE_KEY);
    let localData: Feedback[] = currentLocal ? JSON.parse(currentLocal) : INITIAL_FEEDBACKS;
    
    const updated = [feedback, ...localData];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Nếu dùng Firebase, ta nên fetch lại dữ liệu mới nhất
    if (db) {
        return await getStoredFeedbacks();
    }

    return updated;
};
