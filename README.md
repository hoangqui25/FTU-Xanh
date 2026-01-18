# 🌱 FTU Xanh - Ứng Dụng Tái Chế Thông Minh

Ứng dụng khuyến khích sinh viên tái chế rác thải thông qua hệ thống tích điểm và đổi quà.

## 📱 Tính Năng Chính

### Mobile App (React Native + Expo)
- 🔐 **Đăng nhập/Đăng ký** với Firebase Authentication
- 📸 **Chụp ảnh tái chế** - AI phân loại rác tự động
- 🎁 **Đổi quà** - Tích điểm đổi phần thưởng
- 🏆 **Bảng xếp hạng** - Thi đua tái chế
- 📰 **Hoạt động xã hội** - Tin tức, sự kiện, mẹo xanh
- 🗺️ **Bản đồ xanh** - Điểm thu gom rác
- 💬 **Góp ý & Phản ánh** - Gửi feedback cho admin
- 👤 **Hồ sơ cá nhân** - Quản lý thông tin, avatar

### Admin Web (React + Vite)
- ✅ **Duyệt ảnh tái chế** - Xác nhận và cộng điểm
- 📝 **Quản lý bài viết** - Tạo tin tức, sự kiện
- 💬 **Quản lý feedback** - Xem góp ý từ người dùng
- 📊 **Dashboard** - Thống kê hoạt động

## 🛠️ Công Nghệ Sử Dụng

### Mobile App
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Image Upload**: Cloudinary
- **Icons**: Expo Vector Icons

### Admin Web
- **Framework**: React + Vite
- **Routing**: React Router DOM
- **UI**: Custom CSS
- **Icons**: React Icons
- **Backend**: Firebase (Firestore)

## 📦 Cài Đặt

### Prerequisites
- Node.js >= 16
- npm hoặc yarn
- Expo CLI (cho mobile app)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/hoangqui25/FTU-Xanh.git
cd FTU-Xanh
```

### 2. Cài Đặt Dependencies

**Mobile App:**
```bash
npm install
```

**Admin Web:**
```bash
cd admin-web
npm install
```

### 3. Cấu hình Firebase

Tạo file `.env` trong thư mục gốc (cho mobile app):
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

File `.env` đã có sẵn trong `admin-web/.env`

### 4. Chạy Ứng Dụng

**Mobile App:**
```bash
npx expo start
```
Scan QR code bằng Expo Go app (Android/iOS)

**Admin Web:**
```bash
cd admin-web
npm run dev
```
Mở http://localhost:5173

## 🚀 Deploy

### Mobile App

**Option 1: Expo Go (Testing)**
```bash
npx expo start --tunnel
```
Gửi QR code cho người dùng

**Option 2: Build APK (Android)**
```bash
eas build --platform android --profile preview
```

**Option 3: App Store/Play Store**
```bash
eas build --platform all --profile production
eas submit
```

### Admin Web

**Deploy lên Netlify:**
```bash
cd admin-web
npm run build
# Upload thư mục dist/ lên https://app.netlify.com/drop
```

**Deploy lên Vercel:**
```bash
cd admin-web
vercel
```

## 📁 Cấu Trúc Project

```
FTU-Xanh/
├── src/                      # Mobile app source
│   ├── screens/             # Màn hình
│   ├── services/            # API services
│   ├── configs/             # Firebase config
│   ├── navigation/          # Navigation setup
│   └── utils/               # Utilities
├── admin-web/               # Admin web app
│   ├── src/
│   │   ├── pages/          # Trang admin
│   │   ├── components/     # Components
│   │   ├── services/       # API services
│   │   ├── layouts/        # Layout components
│   │   └── config/         # Firebase config
│   └── public/             # Static files
├── assets/                  # Images, icons
├── app.json                # Expo config
└── package.json            # Dependencies
```

## 🔑 Tài Khoản Demo

**Admin:**
- Email: admin@ftu.edu.vn
- Password: [Liên hệ để lấy]

**User:**
- Đăng ký trực tiếp trong app

## 📸 Screenshots

[Thêm screenshots của app và admin web tại đây]

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License.

## 👥 Tác Giả

- **Hoàng Quí** - [@hoangqui25](https://github.com/hoangqui25)

## 📞 Liên Hệ

- Email: hoangqui25@example.com
- GitHub: https://github.com/hoangqui25/FTU-Xanh

## 🙏 Cảm Ơn

- Firebase - Backend services
- Expo - React Native framework
- Cloudinary - Image hosting
- React Icons - Icon library

---

⭐ Nếu project này hữu ích, hãy cho một star nhé!