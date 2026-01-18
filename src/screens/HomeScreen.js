// src/screens/HomeScreen.js

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar,
  ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// --- SERVICES & CONFIG ---
import { AuthService } from '../services/auth';
import { UserService } from '../services/user';
import { COLORS, ROUTES } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. HÀM LOAD DỮ LIỆU TỪ FIREBASE ---
  const loadData = async () => {
    try {
      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Lỗi tải thông tin Home:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động cập nhật điểm khi quay lại màn hình này (Ví dụ: vừa đổi quà xong quay về Home)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn chắc chắn muốn thoát?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý", onPress: async () => {
          await AuthService.logout();
          navigation.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  // Component phụ cho Grid Menu
  const FeatureItem = ({ title, icon, color, route }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => route ? navigation.navigate(route) : Alert.alert("Thông báo", "Tính năng đang phát triển")}
    >
      <View style={[styles.gridIcon, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.gridLabel}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Xin chào sinh viên 👋</Text>
            <Text style={styles.userName}>{user?.name || "Bạn mới"}</Text>
            <Text style={styles.mssvText}>
              {user?.studentId ? `MSSV: ${user.studentId}` : "Chưa cập nhật MSSV"}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* --- CARD ĐIỂM THƯỞNG --- */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(ROUTES.REWARDS)}
          >
            <View>
              <Text style={styles.cardLabel}>Điểm tích lũy hiện có</Text>
              <Text style={styles.cardPoints}>
                {(user?.currentPoints || 0).toLocaleString()} <Text style={{ fontSize: 18 }}>pts</Text>
              </Text>
              <Text style={styles.cardSub}>
                {user?.currentPoints >= 50
                  ? "Đủ điểm đổi quà mới rồi kìa! ✨"
                  : `Tích thêm ${50 - (user?.currentPoints || 0)} điểm để nhận quà nhé.`}
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="gift" size={32} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>

          <View style={styles.grid}>
            <FeatureItem
              title="Chụp hình"
              icon="camera"
              color="#4CAF50"
              route={ROUTES.CAMERA}
            />
            <FeatureItem
              title="Đổi quà"
              icon="cart"
              color="#FF9800"
              route={ROUTES.REWARDS}
            />
            <FeatureItem
              title="Hoạt động"
              icon="newspaper"
              color="#2196F3"
              route={ROUTES.ACTIVITIES}
            />
            <FeatureItem
              title="Bản đồ xanh"
              icon="map"
              color="#009688"
              route={ROUTES.LOCATIONS}
            />
            <FeatureItem
              title="Góp ý xanh"
              icon="chatbox-ellipses"
              color="#9C27B0"
              route={ROUTES.FEEDBACK}
            />
            <FeatureItem
              title="Thử thách"
              icon="trophy"
              color="#FF5722"
              route={ROUTES.CHALLENGES}
            />
          </View>
        </View>

        {/* --- BANNER (GIỮ NGUYÊN SLOGAN CŨ) --- */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            "Một hành động nhỏ, ý nghĩa lớn. Hãy cùng nhau giữ gìn FTU2 xanh sạch đẹp!" 🌱
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 10, marginBottom: 20
  },
  welcomeText: { fontSize: 13, color: '#666' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  mssvText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  logoutBtn: { padding: 10, backgroundColor: 'white', borderRadius: 12, elevation: 2 },

  cardContainer: { paddingHorizontal: 20, marginBottom: 25 },
  card: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 25,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 8, shadowColor: COLORS.primary, shadowOpacity: 0.3
  },
  cardLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 5 },
  cardPoints: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  cardSub: { color: '#E8F5E9', fontSize: 12, fontStyle: 'italic', marginTop: 5 },
  iconCircle: {
    width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30, justifyContent: 'center', alignItems: 'center'
  },

  sectionContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: {
    width: '48%', backgroundColor: 'white', paddingVertical: 20,
    borderRadius: 16, alignItems: 'center', marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05
  },
  gridIcon: {
    width: 55, height: 55, borderRadius: 27.5,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  gridLabel: { fontWeight: '600', color: '#444', fontSize: 14 },

  banner: {
    margin: 20, padding: 18, backgroundColor: '#E0F2F1',
    borderRadius: 12, borderWidth: 1, borderColor: '#B2DFDB'
  },
  bannerText: { textAlign: 'center', color: '#00695C', fontStyle: 'italic', lineHeight: 20 }
});