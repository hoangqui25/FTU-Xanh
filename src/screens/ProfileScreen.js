// src/screens/ProfileScreen.js

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  Alert, Switch, StatusBar, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ROUTES } from '../utils/constants';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: '',
    studentId: '',
    class: '',
    department: '',
    currentPoints: 0,
    recycleCount: 0,
    avatar: 'https://via.placeholder.com/150',
    rank: '',
    email: ''
  });

  // State cho Modal sửa thông tin
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState({ key: '', label: '', value: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    const data = await UserService.getUserProfile();
    if (data) setProfile(data);
  };

  // --- MỞ MODAL SỬA ---
  const openEditModal = (key, label, currentValue) => {
    setEditingField({ key, label, value: currentValue || '' });
    setModalVisible(true);
  };

  // --- LƯU THÔNG TIN ---
  const handleSave = async () => {
    if (!editingField.value.trim()) {
      Alert.alert("Lỗi", "Vui lòng không để trống nội dung");
      return;
    }

    try {
      const updateObj = { [editingField.key]: editingField.value.trim() };
      await UserService.updateProfile(updateObj);

      setModalVisible(false);
      loadUserProfile(); // Reload UI
      Alert.alert("Thành công", `Đã cập nhật ${editingField.label}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
    }
  };

  // --- THAY ĐỔI ẢNH ĐẠI DIỆN ---
  const handleChangeAvatar = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để thay đổi avatar');
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;

      // Hiển thị loading
      setUploading(true);

      // Upload lên Cloudinary
      const uploadResult = await StorageService.uploadImage(imageUri);

      if (uploadResult.success) {
        // Lưu URL vào Firebase
        await UserService.updateProfile({ avatar: uploadResult.url });

        // Reload profile
        await loadUserProfile();

        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
      } else {
        Alert.alert('Lỗi', uploadResult.error || 'Không thể upload ảnh');
      }

    } catch (error) {
      console.error('Error changing avatar:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi ảnh đại diện');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn thoát?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý", onPress: async () => {
          await AuthService.logout();
          navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
        }
      }
    ]);
  };

  const MenuItem = ({ icon, title, subTitle, onPress, isSwitch, color }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: color ? color + '20' : '#E8F5E9' }]}>
        <Ionicons name={icon} size={22} color={color || COLORS.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subTitle && <Text style={styles.menuSub}>{subTitle}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{ false: "#767577", true: COLORS.primary }}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* MODAL NHẬP LIỆU (Dùng thay Alert.prompt cho Android) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa {editingField.label}</Text>
            <TextInput
              style={styles.input}
              value={editingField.value}
              onChangeText={(txt) => setEditingField({ ...editingField, value: txt })}
              placeholder={`Nhập ${editingField.label}...`}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#666' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraIcon}
                onPress={handleChangeAvatar}
                disabled={uploading}
              >
                <Ionicons name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => openEditModal('name', 'Họ tên', profile.name)}>
              <Text style={styles.name}>{profile.name} <Ionicons name="pencil" size={14} color="white" /></Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{profile.studentId}</Text>
              <Text style={styles.infoDot}>•</Text>
              <Text style={styles.infoText}>{profile.class}</Text>
            </View>
            <Text style={styles.facultyText}>{profile.department}</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statNumber}>{profile.currentPoints}</Text><Text style={styles.statLabel}>Điểm</Text></View>
          <View style={styles.divider} />
          <View style={styles.statItem}><Text style={styles.statNumber}>{profile.recycleCount}</Text><Text style={styles.statLabel}>Tái chế</Text></View>
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thông tin sinh viên</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="id-card-outline" title="Mã số sinh viên" subTitle={profile.studentId || "Chưa cập nhật"}
            />
            <MenuItem
              icon="school-outline" title="Lớp" subTitle={profile.class || "Chưa cập nhật"}
              onPress={() => openEditModal('class', 'Lớp', profile.class)}
            />
            <MenuItem
              icon="business-outline" title="Khoa" subTitle={profile.department || "Chưa cập nhật"}
              onPress={() => openEditModal('department', 'Khoa', profile.department)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: COLORS.primary, paddingBottom: 25,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    alignItems: 'center', elevation: 5
  },
  headerTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, width: 350 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  profileInfo: { alignItems: 'center', marginTop: 15 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'white', backgroundColor: '#ddd' },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF9800', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  name: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', opacity: 0.9 },
  infoText: { fontSize: 14, color: 'white' },
  infoDot: { marginHorizontal: 5, color: 'white' },
  facultyText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: 8 },
  body: { paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 15, marginTop: 20, elevation: 2, justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#eee' },
  section: { marginTop: 25 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  menuGroup: { backgroundColor: 'white', borderRadius: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, color: '#333', fontWeight: '500' },
  menuSub: { fontSize: 12, color: '#999', marginTop: 2 },
  logoutBtn: { marginTop: 30, backgroundColor: '#FFEBEE', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12 },
  logoutText: { color: '#FF5252', fontWeight: 'bold', marginLeft: 8 },

  // Styles cho Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnCancel: { padding: 10, marginRight: 15 },
  btnSave: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});