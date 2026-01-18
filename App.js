import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// 1. CÁI NÀY QUAN TRỌNG NHẤT (Fix lỗi đơ cảm ứng Android)
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 2. Quản lý vùng tai thỏ/camera
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 3. Gọi bộ điều hướng của App
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // Bắt buộc phải có style={{ flex: 1 }} thì GestureHandler mới chạy
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Thanh trạng thái (Pin, Sóng, Giờ...) tự động đổi màu */}
        <StatusBar style="auto" />
        
        {/* Toàn bộ nội dung App nằm ở đây */}
        <AppNavigator />
        
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}