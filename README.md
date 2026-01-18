# FTU Xanh - Ứng Dụng Tái Chế Thông Minh

Ứng dụng khuyến khích sinh viên tái chế rác thải thông qua hệ thống tích điểm và đổi quà.

## Tính Năng Chính

### Mobile App (React Native + Expo)
- Đăng nhập/Đăng ký với Firebase Authentication
- Chụp ảnh tái chế - AI phân loại rác tự động
- Đổi quà - Tích điểm đổi phần thưởng
- Bảng xếp hạng - Thi đua tái chế
- Hoạt động xã hội - Tin tức, sự kiện, mẹo xanh
- Bản đồ xanh - Điểm thu gom rác
- Góp ý & Phản ánh - Gửi feedback cho admin
- Hồ sơ cá nhân - Quản lý thông tin, avatar

### Admin Web (React + Vite)
- Duyệt ảnh tái chế - Xác nhận và cộng điểm
- Quản lý bài viết - Tạo tin tức, sự kiện
- Quản lý feedback - Xem góp ý từ người dùng
- Dashboard - Thống kê hoạt động

## Công Nghệ Sử Dụng

### Mobile App
- Framework: React Native + Expo
- Navigation: React Navigation
- Backend: Firebase (Authentication, Firestore, Storage)
- Image Upload: Cloudinary
- Icons: Expo Vector Icons

### Admin Web
- Framework: React + Vite
- Routing: React Router DOM
- UI: Custom CSS
- Backend: Firebase (Firestore)

## Cài Đặt

### Prerequisites
- Node.js >= 16
- npm hoặc yarn
- Expo CLI
- Git

### Clone Repository
```bash
git clone https://github.com/hoangqui25/FTU-Xanh.git
cd FTU-Xanh
```

### Cài Đặt Dependencies

Mobile App:
```bash
npm install
```

Admin Web:
```bash
cd admin-web
npm install
```

### Cấu hình Firebase

Cập nhật thông tin Firebase trong:
- `app.json` (Mobile app)
- `admin-web/.env` (Admin web)

## Deploy

### Mobile App

Build APK cho Android:
```bash
eas build --platform android --profile preview
```

Publish lên App Store/Play Store:
```bash
eas build --platform all --profile production
eas submit
```

### Admin Web

Deploy lên Netlify:
```bash
cd admin-web
npm run build
# Upload thư mục dist/ lên https://app.netlify.com/drop
```

Deploy lên Vercel:
```bash
cd admin-web
vercel
```

## Cấu Trúc Project

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
│   │   └── config/         # Firebase config
│   └── public/             # Static files
├── assets/                  # Images, icons
├── app.json                # Expo config
└── package.json            # Dependencies
```

## Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Tác Giả

- Qui Hoang
- Chau Nguyen
- Quan Phung

## Cảm Ơn

- Firebase - Backend services
- Expo - React Native framework
- Cloudinary - Image hosting