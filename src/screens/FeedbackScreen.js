// src/screens/FeedbackScreen.js

import { useState, useEffect } from 'react';
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
  ActivityIndicator,
  FlatList,
  RefreshControl
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
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' hoặc 'history'
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Danh sách chủ đề để chọn
  const topics = [
    { id: 'Vệ sinh', label: 'Rác thải / Vệ sinh', icon: 'trash-bin' },
    { id: 'Cơ sở vật chất', label: 'Cơ sở vật chất', icon: 'build' },
    { id: 'Ý tưởng Xanh', label: 'Ý tưởng Xanh', icon: 'bulb' },
    { id: 'Khác', label: 'Khác', icon: 'chatbubble' },
  ];

  // Load lịch sử khi chuyển sang tab history
  useEffect(() => {
    if (activeTab === 'history') {
      loadFeedbackHistory();
    }
  }, [activeTab]);

  // --- LOAD LỊCH SỬ GÓP Ý ---
  const loadFeedbackHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await FeedbackService.getUserFeedbacks();
      setFeedbackHistory(history);
    } catch (error) {
      console.error('Error loading feedback history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử góp ý');
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

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
            text: "Xem lịch sử",
            onPress: () => {
              setContent('');
              setContact('');
              setActiveTab('history');
            }
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

  // --- RENDER STATUS BADGE ---
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Chờ xử lý',
        icon: 'time-outline',
        color: '#ff9800',
        bgColor: '#fff3e0'
      },
      reviewed: {
        label: 'Đã xem',
        icon: 'eye-outline',
        color: '#2196f3',
        bgColor: '#e3f2fd'
      },
      resolved: {
        label: 'Đã giải quyết',
        icon: 'checkmark-circle-outline',
        color: '#4caf50',
        bgColor: '#e8f5e9'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  // --- RENDER TOPIC ICON ---
  const getTopicIcon = (topicName) => {
    const topicMap = {
      'Vệ sinh': 'trash-bin',
      'Cơ sở vật chất': 'build',
      'Ý tưởng Xanh': 'bulb',
      'Khác': 'chatbubble'
    };
    return topicMap[topicName] || 'chatbubble';
  };

  // --- RENDER FEEDBACK ITEM ---
  const renderFeedbackItem = ({ item }) => {
    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <View style={styles.topicBadge}>
            <Ionicons name={getTopicIcon(item.topic)} size={16} color={COLORS.primary} />
            <Text style={styles.topicBadgeText}>{item.topic}</Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <Text style={styles.feedbackContent} numberOfLines={3}>
          {item.content}
        </Text>

        <Text style={styles.feedbackDate}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    );
  };

  // --- RENDER SUBMIT FORM ---
  const renderSubmitForm = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
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
  );

  // --- RENDER HISTORY ---
  const renderHistory = () => (
    <View style={styles.historyContainer}>
      {loadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : feedbackHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa gửi góp ý nào</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setActiveTab('submit')}
          >
            <Text style={styles.emptyButtonText}>Gửi góp ý đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={feedbackHistory}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadFeedbackHistory();
              }}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'submit' && styles.tabActive]}
          onPress={() => setActiveTab('submit')}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={activeTab === 'submit' ? COLORS.primary : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'submit' && styles.tabTextActive
          ]}>
            Gửi góp ý
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'history' ? COLORS.primary : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'history' && styles.tabTextActive
          ]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'submit' ? renderSubmitForm() : renderHistory()}
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Submit Form
  tabContent: {
    padding: 20,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  headerSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  topicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    gap: 5,
  },
  topicChipActive: {
    backgroundColor: COLORS.primary,
  },
  topicText: {
    color: '#555',
  },
  topicTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 120,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
    elevation: 3,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // History View
  historyContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  historyList: {
    padding: 16,
    paddingBottom: 30,
  },
  feedbackCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  topicBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
