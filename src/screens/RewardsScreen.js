// src/screens/RewardsScreen.js

import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl // Thêm kéo để reload
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../utils/constants';

// --- FIREBASE IMPORTS ---
import { auth, db } from '../configs/firebase';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';

// --- SERVICE ---
import { RewardService } from '../services/reward';

export default function RewardsScreen() {
  // --- STATE ---
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [rewards, setRewards] = useState([]);      // Danh sách gốc từ DB
  const [filteredRewards, setFilteredRewards] = useState([]); // Danh sách hiển thị (đã lọc)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Danh mục cứng (Hoặc bạn có thể fetch từ DB nếu muốn)
  const categories = ['Tất cả', 'Voucher', 'Vật phẩm', 'Cây xanh'];

  // --- 1. HÀM LOAD DỮ LIỆU TỪ FIREBASE ---
  const fetchData = async () => {
    try {
      if (!auth.currentUser) return;

      // A. Lấy điểm hiện tại của User
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserPoints(userSnap.data().currentPoints || 0);
      }

      // B. Lấy danh sách Quà từ Collection 'rewards'
      const rewardsRef = collection(db, "rewards");
      const q = query(rewardsRef); // Có thể thêm orderBy('points') nếu cần
      const querySnapshot = await getDocs(q);

      const list = [];
      querySnapshot.forEach((doc) => {
        // Gom ID và Data lại thành 1 object
        list.push({ id: doc.id, ...doc.data() });
      });

      setRewards(list); // Lưu danh sách gốc
      filterRewards(selectedCategory, list); // Lọc ngay lần đầu

    } catch (error) {
      console.error("Lỗi load data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu quà tặng.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- 2. HÀM LỌC DANH SÁCH (Client-side) ---
  const filterRewards = (category, sourceList) => {
    if (category === 'Tất cả') {
      setFilteredRewards(sourceList);
    } else {
      const filtered = sourceList.filter(item => item.category === category);
      setFilteredRewards(filtered);
    }
  };

  // --- 3. HIỆU ỨNG ---
  
  // Khi vào màn hình thì load data
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Khi bấm chọn Category thì lọc lại (không cần gọi API lại)
  const handleCategoryPress = (cat) => {
    setSelectedCategory(cat);
    filterRewards(cat, rewards);
  };

  // --- 4. XỬ LÝ ĐỔI QUÀ ---
  const handleRedeem = async (item) => {
    if (!auth.currentUser) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để đổi quà");
      return;
    }

    Alert.alert(
      "Xác nhận đổi quà",
      `Dùng ${item.points} điểm để đổi "${item.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đổi ngay", 
          onPress: async () => {
            setLoading(true);
            
            // GỌI SERVICE TRANSACTION BẠN VỪA VIẾT
            const result = await RewardService.redeemReward(auth.currentUser.uid, item);
            
            setLoading(false);

            if (result.success) {
              Alert.alert("Thành công! 🎁", result.message);
              fetchData(); // Load lại để cập nhật điểm mới và tồn kho mới
            } else {
              Alert.alert("Thất bại 😢", result.message);
            }
          } 
        }
      ]
    );
  };

  // --- RENDER ITEM ---
  const renderItem = ({ item }) => {
    // Logic hiển thị nút bấm
    const price = item.points || item.price || 0; // Đề phòng field tên khác nhau
    const stock = item.stock || 0;
    
    const isAffordable = userPoints >= price;
    const isInStock = stock > 0;
    const canRedeem = isAffordable && isInStock;

    return (
      <View style={styles.itemContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
          style={styles.itemImage} 
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.rowBetween}>
            <Text style={styles.itemPoints}>{price} pts</Text>
            <Text style={[styles.itemStock, {color: isInStock ? '#666' : 'red'}]}>
              {isInStock ? `Còn: ${stock}` : 'Hết hàng'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.redeemBtn, 
              { backgroundColor: canRedeem ? COLORS.primary : '#ccc' }
            ]}
            onPress={() => handleRedeem(item)}
            disabled={!canRedeem}
          >
            <Text style={styles.redeemText}>
              {!isInStock ? 'Hết hàng' : isAffordable ? 'Đổi quà' : 'Thiếu điểm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Kho Quà Xanh</Text>
              <Text style={styles.headerSub}>Tích điểm đổi quà - Vì môi trường</Text>
            </View>
            <View style={styles.pointBox}>
              <Text style={styles.pointLabel}>Điểm</Text>
              <Text style={styles.pointValue}>{userPoints}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* DANH MỤC */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryChip, 
                selectedCategory === item && styles.categoryChipActive
              ]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* DANH SÁCH QUÀ */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredRewards}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={50} color="#ccc" />
              <Text style={{color: '#999', marginTop: 10}}>Chưa có quà trong mục này</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// GIỮ NGUYÊN STYLE NHƯ CŨ CỦA BẠN
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.2
  },
  headerContent: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', paddingHorizontal: 20, marginTop: 10 
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  pointBox: { 
    backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 8, 
    borderRadius: 12, alignItems: 'center' 
  },
  pointLabel: { fontSize: 10, color: '#666' },
  pointValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  categoryContainer: { marginVertical: 15 },
  categoryChip: {
    paddingHorizontal: 15, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10,
  },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryText: { color: '#555', fontWeight: '500' },
  categoryTextActive: { color: 'white', fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  itemContainer: {
    width: '48%', backgroundColor: 'white', borderRadius: 15,
    marginBottom: 15, elevation: 3, overflow: 'hidden'
  },
  itemImage: { width: '100%', height: 120, resizeMode: 'cover' },
  itemInfo: { padding: 10 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, height: 40 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemPoints: { fontSize: 16, fontWeight: 'bold', color: '#FF9800' }, 
  itemStock: { fontSize: 10 },
  redeemBtn: { paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  redeemText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 50 }
});