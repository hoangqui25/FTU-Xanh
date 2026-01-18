// src/screens/ActivitiesScreen.js

import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../utils/constants';

// --- SERVICE ---
import { ActivitiesService } from '../services/activities';

export default function ActivitiesScreen() {
    // --- STATE ---
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [posts, setPosts] = useState([]);           // Danh sách gốc từ DB
    const [filteredPosts, setFilteredPosts] = useState([]); // Danh sách hiển thị (đã lọc)
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedPost, setExpandedPost] = useState(null); // ID của post đang được mở rộng

    // Danh mục (phải khớp với database.js)
    const categories = ['Tất cả', 'Tin tức', 'Sự kiện', 'Thông báo', 'Mẹo xanh'];

    // --- 1. HÀM LOAD DỮ LIỆU TỪ FIREBASE ---
    const fetchData = async () => {
        try {
            // Lấy tất cả posts đã xuất bản
            const list = await ActivitiesService.getAllPosts();

            setPosts(list); // Lưu danh sách gốc
            filterPosts(selectedCategory, list); // Lọc ngay lần đầu

        } catch (error) {
            console.error("Lỗi load data:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu hoạt động.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- 2. HÀM LỌC DANH SÁCH (Client-side) ---
    const filterPosts = (category, sourceList) => {
        if (category === 'Tất cả') {
            setFilteredPosts(sourceList);
        } else {
            const filtered = sourceList.filter(item => item.category === category);
            setFilteredPosts(filtered);
        }
    };

    // --- 3. HIỆU ỨNG ---

    // Khi vào màn hình thì load data
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    // Khi bấm chọn Category thì lọc lại
    const handleCategoryPress = (cat) => {
        setSelectedCategory(cat);
        filterPosts(cat, posts);
    };

    // --- 4. FORMAT NGÀY ---
    const formatDate = (date) => {
        if (!date) return '';

        const now = new Date();
        const postDate = new Date(date);
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hôm nay';
        } else if (diffDays === 1) {
            return 'Hôm qua';
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return postDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

    // --- 5. LẤY ICON VÀ MÀU CHO CATEGORY ---
    const getCategoryStyle = (category) => {
        const styles = {
            'Tin tức': { icon: 'newspaper-outline', color: '#2196F3' },
            'Sự kiện': { icon: 'calendar-outline', color: '#FF9800' },
            'Thông báo': { icon: 'megaphone-outline', color: '#F44336' },
            'Mẹo xanh': { icon: 'leaf-outline', color: '#4CAF50' }
        };
        return styles[category] || { icon: 'document-text-outline', color: '#666' };
    };

    // --- RENDER ITEM ---
    const renderItem = ({ item }) => {
        const categoryStyle = getCategoryStyle(item.category);
        const isExpanded = expandedPost === item.id;

        return (
            <TouchableOpacity
                style={styles.postCard}
                onPress={() => setExpandedPost(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.postHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.color + '20' }]}>
                        <Ionicons name={categoryStyle.icon} size={16} color={categoryStyle.color} />
                        <Text style={[styles.categoryText, { color: categoryStyle.color }]}>
                            {item.category}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>

                {/* Title */}
                <Text style={styles.postTitle}>{item.title}</Text>

                {/* Content */}
                <Text
                    style={styles.postContent}
                    numberOfLines={isExpanded ? undefined : 3}
                >
                    {item.content}
                </Text>

                {/* Footer */}
                <View style={styles.postFooter}>
                    <View style={styles.authorContainer}>
                        <Ionicons name="person-circle-outline" size={16} color="#666" />
                        <Text style={styles.authorText}>{item.authorName || 'Admin'}</Text>
                    </View>
                    <Text style={styles.readMoreText}>
                        {isExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                    </Text>
                </View>
            </TouchableOpacity>
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
                            <Text style={styles.headerTitle}>Hoạt Động Xanh</Text>
                            <Text style={styles.headerSub}>Tin tức & sự kiện môi trường</Text>
                        </View>
                        <View style={styles.iconContainer}>
                            <Ionicons name="newspaper" size={32} color="white" />
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
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                />
            </View>

            {/* DANH SÁCH BÀI VIẾT */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchData();
                            }}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="newspaper-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
                            <Text style={styles.emptySubText}>
                                {selectedCategory === 'Tất cả'
                                    ? 'Hãy quay lại sau nhé!'
                                    : `Chưa có bài viết trong mục "${selectedCategory}"`}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10
    },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Category
    categoryContainer: { marginVertical: 15 },
    categoryChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        marginRight: 10,
    },
    categoryChipActive: { backgroundColor: COLORS.primary },
    categoryChipText: { color: '#555', fontWeight: '500', fontSize: 13 },
    categoryChipTextActive: { color: 'white', fontWeight: 'bold' },

    // List
    listContainer: { paddingHorizontal: 15, paddingBottom: 20 },

    // Post Card
    postCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 5
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600'
    },
    dateText: {
        fontSize: 11,
        color: '#999'
    },
    postTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        lineHeight: 24
    },
    postContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 12
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    authorText: {
        fontSize: 12,
        color: '#666'
    },
    readMoreText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600'
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40
    },
    emptyText: {
        color: '#999',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600'
    },
    emptySubText: {
        color: '#bbb',
        marginTop: 5,
        fontSize: 13,
        textAlign: 'center'
    }
});
