import { Service, Salon, Staff } from '../types';
import emailjs from '@emailjs/browser';

// --- EMAILJS CONFIGURATION ---
// Để chức năng này hoạt động thực tế:
// 1. Vào https://www.emailjs.com/ tạo tài khoản miễn phí.
// 2. Tạo Email Service (ví dụ: kết nối với Gmail cá nhân) -> Lấy Service ID.
// 3. Tạo Email Template -> Lấy Template ID.
//    - Nội dung Template nên chứa các biến: {{to_name}}, {{to_email}}, {{salon_name}}, {{service_name}}, {{date}}, {{time}}, {{staff_name}}, {{price}}
// 4. Vào Account > API Keys -> Lấy Public Key.
// 5. Thay thế các giá trị placeholder bên dưới.

const SERVICE_ID = 'service_svi15ug'; 
const TEMPLATE_ID = 'template_t4xoe25';
const PUBLIC_KEY = 'Wquk1LzaBu1Hczs4k';

export const sendBookingConfirmationEmail = async (
  userEmail: string,
  userName: string,
  salon: Salon,
  service: Service,
  staff: Staff | null, // null implies "Any Professional"
  date: string,
  time: string
): Promise<boolean> => {
  const staffName = staff ? staff.name : "Any Available Professional";

  const templateParams = {
    to_name: userName,
    to_email: userEmail,
    salon_name: salon.name,
    salon_address: salon.location,
    service_name: service.name,
    service_duration: `${service.duration} mins`,
    price: `${service.price}k`,
    date: date,
    time: time,
    staff_name: staffName,
    message: "Thank you for booking with GlowBook! Please arrive 5 minutes early."
  };

  try {
    // Nếu chưa cấu hình key thật, hệ thống sẽ giả lập gửi để không bị crash ứng dụng khi demo
    if (SERVICE_ID.includes('placeholder')) {
        console.warn('⚠️ Chưa cấu hình EmailJS. Đang giả lập gửi email. Hãy cập nhật services/email.ts với ID thật.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("MOCK EMAIL SENT TO:", userEmail, templateParams);
        return true;
    }

    console.log("Đang gửi email qua EmailJS...", templateParams);
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Gửi email thành công!', response.status, response.text);
    return true;

  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    // Ném lỗi ra để BookingModal hiển thị thông báo (hoặc có thể return false để xử lý êm đẹp)
    throw error;
  }
};