import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 1. IMPORT HOOK ĐỂ LẤY KHOẢNG CÁCH AN TOÀN (QUAN TRỌNG)
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES, COLORS } from '../utils/constants';

// 2. IMPORT CÁC MÀN HÌNH THẬT
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import RewardsScreen from '../screens/RewardsScreen';
import LocationScreen from '../screens/LocationScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- CẤU HÌNH TAB BAR (MENU DƯỚI) ---
function MainTabs() {
  // 4. LẤY THÔNG SỐ AN TOÀN CỦA MÀN HÌNH
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,

        // 👇 XỬ LÝ ĐỘNG TẠI ĐÂY (DYNAMIC) 👇
        tabBarStyle: {
          // Chiều cao = 60px (Cố định) + Khoảng cách an toàn đáy
          // Nếu máy có nút ảo -> insets.bottom sẽ lớn -> Tab cao lên để né
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),

          // Đệm đáy = Khoảng cách an toàn
          // Nếu máy không có nút ảo (insets=0) -> Đệm thêm 10px cho thoáng
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,

          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 10, // Bóng đổ Android
        },
        // 👆 ----------------------------- 👆

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === ROUTES.HOME) iconName = focused ? 'home' : 'home-outline';
          else if (route.name === ROUTES.CAMERA) {
            iconName = focused ? 'scan-circle' : 'scan-outline';
            size = focused ? 32 : 28;
          }
          else if (route.name === ROUTES.REWARDS) iconName = focused ? 'gift' : 'gift-outline';
          else if (route.name === ROUTES.PROFILE) iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name={ROUTES.CAMERA} component={CameraScreen} options={{ title: 'Chụp hình' }} />
      <Tab.Screen name={ROUTES.REWARDS} component={RewardsScreen} options={{ title: 'Đổi quà' }} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}

// --- APP NAVIGATOR ---
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
        {/* Login */}
        <Stack.Screen name={ROUTES.LOGIN} component={AuthScreen} />

        {/* Main Tabs */}
        <Stack.Screen name={ROUTES.MAIN} component={MainTabs} />

        {/* Các màn hình phụ */}
        <Stack.Screen
          name={ROUTES.FEEDBACK}
          component={FeedbackScreen}
          options={{ headerShown: true, title: 'Góp ý & Phản ánh', headerTintColor: COLORS.primary }}
        />
        <Stack.Screen
          name={ROUTES.ACTIVITIES}
          component={ActivitiesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.LOCATIONS}
          component={LocationScreen}
          options={{ headerShown: true, title: 'Bản đồ xanh', headerTintColor: COLORS.primary }}
        />
        <Stack.Screen
          name={ROUTES.CHALLENGES}
          component={ChallengesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});