// src/screens/AuthScreen.js

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Keyboard
} from 'react-native';

// Import các file logic
import { AuthService } from '../services/auth';
import { COLORS, ROUTES } from '../utils/constants';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- DỮ LIỆU NHẬP LIỆU ---
  // Đã xóa state 'phone'
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  
  // Dữ liệu chỉ dùng cho đăng ký
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');

  // --- HÀM RESET FORM (Làm sạch ô nhập) ---
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setStudentId('');
    Keyboard.dismiss();
  };

  // --- XỬ LÝ ĐĂNG NHẬP ---
  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập Email và Mật khẩu');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 1. Gọi đăng nhập
      await AuthService.login(email, password);
      
      // 2. Log ra để chắc chắn đã chạy đến đây
      console.log("Đăng nhập thành công!");

      // 3. CHUYỂN TRANG THỦ CÔNG
      // Thay 'Main' bằng tên màn hình chính của bạn (ví dụ: 'Home', 'MainTab', v.v.)
      // ROUTES.MAIN là biến bạn định nghĩa trong constants, hãy chắc chắn nó đúng.
      if (navigation) {
          // Dùng replace để người dùng không bấm Back quay lại màn hình Login được
          navigation.replace('MainTabs'); // <--- Sửa 'Main' thành tên màn hình chính của bạn trong AppNavigator
      }
      
    } catch (error) {
      console.log("Lỗi đăng nhập:", error);
      Alert.alert('Đăng nhập thất bại', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ ĐĂNG KÝ ---
  // --- XỬ LÝ ĐĂNG KÝ (Đã sửa lỗi bị đơ) ---
  const handleRegister = async () => {
    // 1. Kiểm tra nhập liệu
    if (!email || !password || !name || !studentId) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin: Tên, MSSV, Email và Mật khẩu');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 2. Gọi hàm đăng ký
      await AuthService.register(email, password, name, studentId);
      
      // QUAN TRỌNG: Vì Firebase tự động đăng nhập sau khi đăng ký, 
      // ta cần Đăng xuất ngay lập tức để người dùng có thể tự đăng nhập lại.
      await AuthService.logout(); 

      // 3. Tắt loading TRƯỚC khi hiện thông báo để tránh bị đơ UI
      setLoading(false); 
      
      // 4. Hiện thông báo, khi người dùng bấm OK thì mới chuyển tab
      Alert.alert(
        'Đăng ký thành công', 
        'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLogin(true); // Chuyển sang tab Đăng nhập
              resetForm();      // Xóa trắng form
            }
          }
        ]
      );
      
    } catch (error) {
      setLoading(false); // Tắt loading nếu có lỗi
      Alert.alert('Lỗi Đăng Ký', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>♻️</Text>
          <Text style={styles.title}>FTU2 Xanh</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Đăng nhập để tích điểm' : 'Đăng ký thành viên mới'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* --- CÁC TRƯỜNG RIÊNG CHO ĐĂNG KÝ --- */}
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="MSSV"
                value={studentId}
                onChangeText={setStudentId}
                autoCorrect={false}
                autoCapitalize="characters"
              />
            </>
          )}

          {/* --- CÁC TRƯỜNG CHUNG (EMAIL & PASS) --- */}
          {/* Đã xóa TextInput Số điện thoại ở đây */}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* --- NÚT CHÍNH --- */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ')}
            </Text>
          </TouchableOpacity>

          {/* --- NÚT CHUYỂN ĐỔI --- */}
          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm(); // Xóa dữ liệu cũ khi chuyển tab
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },
  
  form: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15, 
    fontSize: 16,
    backgroundColor: '#FAFAFA' 
  },
  
  button: { 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  switchButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchText: { color: COLORS.primary, fontSize: 16, fontWeight: '500' }
});