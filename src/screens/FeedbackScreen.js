// src/screens/FeedbackScreen.js

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ROUTES } from '../utils/constants';
import { FeedbackService } from '../services/feedback';

export default function FeedbackScreen({ navigation }) {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('Vệ sinh'); // Chủ đề mặc định
  const [content, setContent] = useState('');    // Nội dung góp ý
  const [contact, setContact] = useState('');    // SĐT liên hệ

  // Danh sách chủ đề để chọn
  // Danh sách chủ đề để chọn
  const topics = [
    { id: 'Vệ sinh', label: 'Rác thải / Vệ sinh', icon: 'trash-bin' },
    { id: 'Cơ sở vật chất', label: 'Cơ sở vật chất', icon: 'build' },
    { id: 'Ý tưởng Xanh', label: 'Ý tưởng Xanh', icon: 'bulb' },
    { id: 'Khác', label: 'Khác', icon: 'chatbubble' },
  ];

  // --- XỬ LÝ GỬI ---
  const handleSubmit = async () => {
    // 1. Validate
    if (content.trim().length < 10) {
      Alert.alert('Chưa nhập đủ', 'Nội dung góp ý cần dài hơn 10 ký tự để chúng mình hiểu rõ vấn đề nhé!');
      return;
    }

    setLoading(true);

    try {
      // 2. Gửi feedback thật lên Firebase
      await FeedbackService.submitFeedback({
        topic,
        content,
        contact
      });

      setLoading(false);

      Alert.alert(
        "Đã gửi thành công! 🚀",
        "Cảm ơn bạn đã đóng góp ý kiến để xây dựng FTU2 xanh sạch đẹp hơn.",
        [
          {
            text: "Về trang chủ",
            onPress: () => navigation.navigate(ROUTES.HOME)
          },
          {
            text: "Gửi thêm",
            onPress: () => {
              setContent(''); // Xóa nội dung cũ
              setContact('');
            }
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi gửi góp ý",
        error.message || "Không thể gửi góp ý lúc này. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* Tiêu đề */}
        <Text style={styles.headerTitle}>Gửi phản ánh & Góp ý</Text>
        <Text style={styles.headerSub}>
          Hãy cho chúng mình biết vấn đề bạn gặp phải hoặc ý tưởng của bạn.
        </Text>

        {/* 1. Chọn chủ đề */}
        <Text style={styles.label}>Chủ đề:</Text>
        <View style={styles.topicContainer}>
          {topics.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.topicChip,
                topic === item.id && styles.topicChipActive
              ]}
              onPress={() => setTopic(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={topic === item.id ? 'white' : '#666'}
              />
              <Text style={[
                styles.topicText,
                topic === item.id && styles.topicTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Nội dung */}
        <Text style={styles.label}>Nội dung chi tiết (*):</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ví dụ: Thùng rác ở sảnh B đã đầy..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* 3. Liên hệ */}
        <Text style={styles.label}>SĐT liên hệ (Tùy chọn):</Text>
        <TextInput
          style={styles.input}
          placeholder="Để chúng mình liên hệ lại khi cần"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        {/* Nút Gửi */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="white" />
              <Text style={styles.submitText}>Gửi Góp Ý</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },

  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  headerSub: { fontSize: 14, color: '#666', marginBottom: 25 },

  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 10 },

  topicContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  topicChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#eee', paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 20, marginRight: 10, marginBottom: 10, gap: 5
  },
  topicChipActive: { backgroundColor: COLORS.primary },
  topicText: { color: '#555' },
  topicTextActive: { color: 'white', fontWeight: 'bold' },

  input: {
    backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 15
  },
  textArea: { height: 120 },

  submitBtn: {
    backgroundColor: COLORS.primary, padding: 15, borderRadius: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 20, gap: 10, elevation: 3
  },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});