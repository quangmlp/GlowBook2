
import { Feedback } from '../types';

const STORAGE_KEY = 'glowbook_feedbacks';

// Initial Mock Data to populate if empty
const INITIAL_FEEDBACKS: Feedback[] = [
    { id: '1', userType: 'customer', rating: 5, q1: 'Fast Search', q2: 'None', q3: 'Yes, absolutely', q4: 'Loyalty Points', timestamp: '10/24/2023, 10:30 AM' },
    { id: '2', userType: 'business', rating: 4, q1: 'Staff Management', q2: 'Mobile App', q3: 'Monthly Subscription', q4: 'Payroll', timestamp: '10/24/2023, 11:15 AM' },
    { id: '3', userType: 'customer', rating: 4, q1: 'Beautiful Interface', q2: 'Slow Loading', q3: 'Yes, but need more reviews', q4: 'Video Call Consultation', timestamp: '10/25/2023, 09:00 AM' },
    { id: '4', userType: 'customer', rating: 5, q1: 'Instant Confirmation', q2: 'None', q3: 'Yes, absolutely', q4: 'Home Service', timestamp: '10/25/2023, 09:30 AM' },
    { id: '5', userType: 'business', rating: 3, q1: 'Revenue Stats', q2: 'Desktop/Laptop', q3: 'Commission per booking', q4: 'Marketing Tools', timestamp: '10/25/2023, 10:00 AM' },
];

export const getStoredFeedbacks = (): Feedback[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Save initial mock data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
        return INITIAL_FEEDBACKS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
};

export const saveStoredFeedback = (feedback: Feedback): Feedback[] => {
    const current = getStoredFeedbacks();
    const updated = [feedback, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};
