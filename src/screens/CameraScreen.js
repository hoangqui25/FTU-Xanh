// src/screens/CameraScreen.js

import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
  Modal
} from 'react-native';

// 1. Dùng SafeAreaView từ thư viện chuẩn
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 2. Import CameraView
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../utils/constants';

// 3. IMPORT SERVICE ĐỂ CỘNG ĐIỂM
import { PointService } from '../services/point';
import { ChallengeService } from '../services/challenge';
import { StorageService } from '../services/storage';

const TUTORIAL_KEY = 'camera_tutorial_seen';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const cameraRef = useRef(null);

  // Kiểm tra xem user đã xem tutorial chưa và reset photo
  useFocusEffect(
    useCallback(() => {
      checkTutorialStatus();
      // Reset photo mỗi khi quay lại camera screen
      setPhoto(null);

      // Lock orientation to portrait
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

      // Cleanup: unlock when leaving screen
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, [])
  );

  const checkTutorialStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem(TUTORIAL_KEY);
      if (!seen) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.log('Error checking tutorial status:', error);
    }
  };

  const dismissTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      setShowTutorial(false);
    } catch (error) {
      console.log('Error saving tutorial status:', error);
    }
  };

  // --- 1. XỬ LÝ QUYỀN CAMERA ---
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Ionicons name="camera-outline" size={60} color="white" />
        <Text style={styles.permissionText}>App cần quyền Camera để phân loại rác</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnPermission}>
          <Text style={styles.btnPermissionText}>Cấp quyền ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: 'gray' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 2. HÀM CHỤP ẢNH (TỐI ƯU HÓA) ---
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.3,       // Ảnh nhẹ -> Chụp nhanh
          skipProcessing: true, // Bỏ qua xử lý thừa -> Không lag
          shutterSound: false,  // Tắt tiếng
        });
        setPhoto(data.uri); // Hiện ảnh Preview ngay lập tức
      } catch (error) {
        console.log(error);
        Alert.alert("Lỗi", "Không thể chụp ảnh lúc này");
      }
    }
  };

  // --- 3. HÀM GỬI ẢNH & TẠO YÊU CẦU ---
  const handleSubmit = async () => {
    setAnalyzing(true);
    try {
      // 1. Upload ảnh lên Cloudinary (BẮT BUỘC)
      if (!photo) {
        throw new Error("Không có ảnh để gửi");
      }

      const uploadResult = await StorageService.uploadImage(photo);

      // Kiểm tra upload thành công
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Upload ảnh thất bại");
      }

      const REWARD_POINTS = 10;

      // 2. Tạo yêu cầu tái chế (chờ admin duyệt)
      const requestId = await PointService.createRecycleRequest(REWARD_POINTS, uploadResult.url);

      console.log("✅ Request ID:", requestId);

      Alert.alert(
        "Gửi yêu cầu thành công!",
        `Ảnh của bạn đã được gửi đến admin.\nBạn sẽ nhận ${REWARD_POINTS} điểm sau khi được duyệt.`,
        [
          { text: "Chụp tiếp", onPress: () => setPhoto(null) },
          { text: "Đổi quà", onPress: () => navigation.navigate('Rewards') }
        ]
      );
    } catch (error) {
      console.log("Submit Error:", error);

      Alert.alert(
        "Lỗi gửi yêu cầu",
        error.message || "Không thể gửi yêu cầu lúc này. Vui lòng thử lại."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // --- GIAO DIỆN PREVIEW (XEM LẠI ẢNH) ---
  if (photo) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ImageBackground source={{ uri: photo }} style={styles.preview}>
          <SafeAreaView style={styles.uiOverlay}>

            {/* Nếu đang phân tích thì hiện vòng quay, ngược lại hiện nút bấm */}
            {analyzing ? (
              <View style={styles.analyzingBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.analyzingText}>Đang xử lý...</Text>
                <Text style={styles.subText}>Upload ảnh và gửi yêu cầu</Text>
              </View>
            ) : (
              <View style={styles.previewControls}>
                <TouchableOpacity style={styles.btnCircle} onPress={() => setPhoto(null)}>
                  <Ionicons name="close" size={30} color="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.btnText}>Gửi yêu cầu (+10)</Text>
                </TouchableOpacity>
              </View>
            )}

          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  // --- TUTORIAL MODAL ---
  const TutorialModal = () => (
    <Modal visible={showTutorial} transparent animationType="fade">
      <View style={styles.tutorialOverlay}>
        <View style={styles.tutorialCard}>
          <View style={styles.tutorialIconCircle}>
            <Ionicons name="camera" size={40} color={COLORS.primary} />
          </View>

          <Text style={styles.tutorialTitle}>Hướng dẫn chụp hình</Text>

          <View style={styles.tutorialSteps}>
            <View style={styles.tutorialStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Đặt vật phẩm tái chế vào giữa khung hình</Text>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Đảm bảo đủ ánh sáng, hình ảnh rõ nét</Text>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Nhấn nút chụp và đợi Admin duyệt</Text>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>Nhận điểm thưởng sau khi xác nhận!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.tutorialBtn} onPress={dismissTutorial}>
            <Text style={styles.tutorialBtnText}>Đã hiểu, bắt đầu chụp!</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- GIAO DIỆN CAMERA (MÀN HÌNH CHỤP) ---
  return (
    <View style={styles.container}>
      <TutorialModal />
      <StatusBar hidden />

      {/* 1. Camera View (Nền dưới) */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        ref={cameraRef}
      />

      {/* 2. UI Overlay (Nằm đè lên trên) */}
      <SafeAreaView style={styles.uiOverlay}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>CAMERA</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setShowTutorial(true)} style={styles.iconBtn}>
              <Ionicons name="help-circle-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              style={styles.iconBtn}
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Khung hướng dẫn */}
        <View style={styles.guideFrame}>
          <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />

          <Text style={styles.guideText}>Đặt rác vào khung hình</Text>
        </View>

        {/* Nút chụp */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.captureBtnOuter} onPress={takePicture}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  // Overlay trong suốt đè lên Camera
  uiOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },

  permissionContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { color: 'white', fontSize: 16, marginVertical: 20, textAlign: 'center' },
  btnPermission: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnPermissionText: { color: 'white', fontWeight: 'bold' },

  // Header Styles
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 10
  },
  iconBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25 },
  badge: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)', // Xanh lá mờ
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: 'white'
  },

  // Khung hướng dẫn (Guide Frame)
  guideFrame: {
    alignSelf: 'center', width: 280, height: 280,
    justifyContent: 'center', alignItems: 'center', position: 'relative'
  },
  corner: { position: 'absolute', width: 25, height: 25, borderColor: 'white' },
  guideText: {
    color: 'rgba(255,255,255,0.9)', fontSize: 14,
    marginTop: 320, fontWeight: '600', letterSpacing: 1,
    textShadowColor: 'black', textShadowRadius: 3
  },

  // Nút chụp
  bottomBar: { alignItems: 'center', paddingBottom: 50 },
  captureBtnOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  captureBtnInner: {
    width: 65, height: 65, borderRadius: 32.5, backgroundColor: 'white'
  },

  // Preview Styles
  preview: { flex: 1, width: '100%', height: '100%' },
  previewControls: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 30, paddingBottom: 50
  },
  btnCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3
  },
  btnSubmit: {
    flex: 1, marginLeft: 20, height: 50,
    backgroundColor: COLORS.primary, borderRadius: 25,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Hộp loading
  analyzingBox: {
    alignSelf: 'center', marginBottom: '60%',
    backgroundColor: 'white', padding: 30, borderRadius: 20,
    alignItems: 'center', elevation: 10, width: 220,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10
  },
  analyzingText: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold', marginTop: 15 },
  subText: { fontSize: 12, color: '#888', marginTop: 5 },

  // Tutorial Modal Styles
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  tutorialCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  tutorialIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  tutorialSteps: {
    width: '100%',
    marginBottom: 25
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  tutorialBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 8,
    width: '100%'
  },
  tutorialBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});