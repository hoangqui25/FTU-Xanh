# FTU2 Xanh - App Phân loại Rác

Ứng dụng mobile giúp sinh viên tăng cường ý thức phân loại rác tại nguồn, tích điểm và đổi quà.

## Tính năng chính

1. **Chụp ảnh tích điểm**: Chụp ảnh bỏ rác đúng thùng, được cộng 2 điểm/lần
2. **Hoạt động môi trường**: Thông báo và đăng ký tham gia các hoạt động xã hội
3. **Bản đồ xanh**: Vị trí thùng rác và đổi pin
4. **Phản ánh góp ý**: Gửi ý kiến đóng góp xây dựng trường xanh-sạch-đẹp
5. **Đổi quà**: Đổi điểm lấy phần thưởng (50 điểm, 100 điểm...)

## Cài đặt

### Phiên bản node
- Node.js 24.12.0

### Các bước cài đặt

1. Clone project hoặc tạo thư mục mới:
```bash
git clone ...
```
2. Cài đặt dependencies:
```bash
npm install 
```

2. Chạy app trên expo go:
```bash
npx expo start
```

## Cấu trúc thư mục

```
RecycleRewardApp/
├── src/
│   ├── configs         # Firebase config
│   │   └──firebase.js
│   ├── screens/          # Các màn hình
│   │   ├── AuthScreen.js
│   │   ├── HomeScreen.js
│   │   ├── CameraScreen.js
│   │   ├── ActivitiesScreen.js
│   │   ├── LocationScreen.js
│   │   ├── FeedbackScreen.js
│   │   ├── RewardsScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/       # Navigation config
│   │   └── AppNavigator.js
│   ├── services/         # API services
│   │   ├── auth.js
│   │   ├── location.js
│   │   ├── point.js
│   │   ├── reward.js
│   │   └── user.js
│   └── utils/            # Constants và utilities
│       └── constants.js
├── App.js
├── app.json
├── package.json
└── README.md
```

1. **Camera**: App cần quyền truy cập camera
2. **Network**: Đảm bảo kết nối internet khi sử dụng

## License

MIT License