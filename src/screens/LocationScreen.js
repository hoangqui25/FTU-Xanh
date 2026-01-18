// src/screens/LocationScreen.js

import { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Image, FlatList, ActivityIndicator, StatusBar, ScrollView, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { LocationService } from '../services/location';

export default function LocationScreen({ navigation }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await LocationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.log("Lỗi tải vị trí:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableFloors = useMemo(() => {
    const floors = locations.map(item => item.floor);
    return ['ALL', ...new Set(floors)].sort((a, b) => a - b);
  }, [locations]);

  const filteredData = useMemo(() => {
    return locations.filter(item => {
      const matchBlock = selectedBlock === 'ALL' || item.block === selectedBlock;
      const matchFloor = selectedFloor === 'ALL' || item.floor === selectedFloor;
      return matchBlock && matchFloor;
    }).sort((a, b) => a.floor - b.floor);
  }, [locations, selectedBlock, selectedFloor]);

  // RENDER ITEM - Đã bỏ nút chỉ đường
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.locImage} />
      <View style={styles.info}>
        <View style={styles.tagRow}>
          <View style={[styles.badge, {backgroundColor: '#E8F5E9'}]}>
            <Text style={styles.badgeText}>Tòa {item.block}</Text>
          </View>
          <View style={[styles.badge, {backgroundColor: '#E3F2FD'}]}>
            <Text style={styles.badgeText}>
              {item.floor == 0 ? 'Tầng trệt' : `Tầng ${item.floor}`}
            </Text>
          </View>
        </View>
        <Text style={styles.locName}>{item.name}</Text>
        <Text style={styles.locAddr} numberOfLines={2}>{item.address}</Text>
        {item.description && <Text style={styles.locDesc}>{item.description}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* BỘ LỌC 1: TÒA NHÀ */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Khu vực:</Text>
        <View style={styles.filterRow}>
          {['ALL', 'A', 'B'].map((block) => (
            <TouchableOpacity 
              key={block}
              style={[styles.filterBtn, selectedBlock === block && styles.activeBtn]}
              onPress={() => setSelectedBlock(block)}
            >
              <Text style={[styles.filterText, selectedBlock === block && styles.activeText]}>
                {block === 'ALL' ? 'Tất cả' : `Tòa ${block}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BỘ LỌC 2: TẦNG */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Tầng:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {availableFloors.map((floor) => (
            <TouchableOpacity 
              key={floor}
              style={[styles.floorBtn, selectedFloor === floor && styles.activeFloorBtn]}
              onPress={() => setSelectedFloor(floor)}
            >
              <Text style={[styles.floorText, selectedFloor === floor && styles.activeText]}>
                {floor === 'ALL' ? 'Tất cả' : floor === 0 ? 'Tầng Trệt' : `Tầng ${floor}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy vị trí nào phù hợp</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white', elevation: 2
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  filterSection: { paddingHorizontal: 20, marginTop: 12 },
  filterLabel: { fontSize: 13, color: '#888', marginBottom: 8, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row' },
  filterBtn: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    backgroundColor: 'white', marginRight: 10, borderWidth: 1, borderColor: '#EEE' 
  },
  activeBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  floorBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#DDD'
  },
  activeFloorBtn: { backgroundColor: '#FFA000', borderColor: '#FFA000' },
  filterText: { color: '#666', fontWeight: '600', fontSize: 13 },
  floorText: { color: '#444', fontSize: 12 },
  activeText: { color: 'white', fontWeight: 'bold' },
  
  // CARD STYLE: Đã tối ưu không gian khi bỏ nút điều hướng
  card: { 
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 18, 
    padding: 12, marginBottom: 15, alignItems: 'flex-start', elevation: 3 
  },
  locImage: { width: 85, height: 85, borderRadius: 12 },
  info: { flex: 1, marginLeft: 15 },
  tagRow: { flexDirection: 'row', marginBottom: 5 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 5 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
  locName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  locAddr: { fontSize: 12, color: '#666', marginTop: 2, lineHeight: 18 },
  locDesc: { fontSize: 11, color: '#999', marginTop: 4, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});