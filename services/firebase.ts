
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- HƯỚNG DẪN CẤU HÌNH ---
// 1. Vào https://console.firebase.google.com/
// 2. Tạo project mới > Add app (Web)
// 3. Copy config dán vào bên dưới
// 4. Vào Firestore Database > Create Database > Start in Test Mode (quan trọng để cho phép ghi không cần auth)

const firebaseConfig = {
  // Thay thế bằng config thật của bạn để dữ liệu đồng bộ online
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Khởi tạo an toàn (tránh lỗi crash app nếu chưa config đúng)
let db: any = null;

try {
    // Chỉ khởi tạo nếu config đã được thay đổi từ giá trị mặc định hoặc có key thật
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase config is missing. App will use LocalStorage (data won't sync across devices).");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { db };
