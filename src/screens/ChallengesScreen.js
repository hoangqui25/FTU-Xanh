// src/screens/ChallengesScreen.js

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
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { ChallengeService } from '../services/challenge';

export default function ChallengesScreen({ navigation }) {
    const [challenges, setChallenges] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [claiming, setClaiming] = useState(null); // ID challenge đang claim

    // Load data khi vào màn hình
    const loadData = async () => {
        try {
            const result = await ChallengeService.getTodayChallenges();
            setChallenges(result.challenges);
            setStreak(result.streak);
        } catch (error) {
            console.error("Lỗi load challenges:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Nhận thưởng
    const handleClaim = async (challenge) => {
        setClaiming(challenge.id);

        const result = await ChallengeService.claimBonus(challenge.id, challenge.bonusPoints);

        setClaiming(null);

        if (result.success) {
            Alert.alert("🎉 Tuyệt vời!", result.message);
            loadData(); // Reload để cập nhật UI
        } else {
            Alert.alert("Lỗi", result.message);
        }
    };

    // Render từng thử thách
    const renderChallenge = ({ item }) => {
        const progress = item.targetCount > 0
            ? Math.min(item.current / item.targetCount, 1)
            : 0;
        const progressPercent = Math.round(progress * 100);

        return (
            <View style={styles.challengeCard}>
                {/* Icon */}
                <View style={[
                    styles.iconContainer,
                    item.completed && styles.iconContainerCompleted
                ]}>
                    <Ionicons
                        name={item.icon || "trophy"}
                        size={28}
                        color={item.completed ? "white" : COLORS.primary}
                    />
                </View>

                {/* Content */}
                <View style={styles.challengeContent}>
                    <Text style={styles.challengeTitle}>{item.title}</Text>
                    <Text style={styles.challengeDesc}>{item.description}</Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {item.current}/{item.targetCount}
                        </Text>
                    </View>
                </View>

                {/* Bonus / Button */}
                <View style={styles.bonusContainer}>
                    {item.claimed ? (
                        <View style={styles.claimedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.claimedText}>Đã nhận</Text>
                        </View>
                    ) : item.completed ? (
                        <TouchableOpacity
                            style={styles.claimBtn}
                            onPress={() => handleClaim(item)}
                            disabled={claiming === item.id}
                        >
                            {claiming === item.id ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Text style={styles.claimText}>Nhận</Text>
                                    <Text style={styles.bonusPoints}>+{item.bonusPoints}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.bonusBadge}>
                            <Ionicons name="gift" size={16} color="#FF9800" />
                            <Text style={styles.bonusText}>+{item.bonusPoints}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    // Tính số thử thách đã hoàn thành
    const completedCount = challenges.filter(c => c.completed).length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Thử thách hôm nay</Text>
                            <Text style={styles.headerSub}>
                                Hoàn thành {completedCount}/{challenges.length} thử thách
                            </Text>
                        </View>

                        {/* Streak Badge */}
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={18} color="#FF5722" />
                            <Text style={styles.streakText}>{streak}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* Streak Info Card */}
            {streak > 0 && (
                <View style={styles.streakCard}>
                    <Ionicons name="flame" size={24} color="#FF5722" />
                    <View style={styles.streakInfo}>
                        <Text style={styles.streakTitle}>🔥 Chuỗi {streak} ngày!</Text>
                        <Text style={styles.streakDesc}>
                            Tiếp tục hoàn thành thử thách để duy trì chuỗi nhé!
                        </Text>
                    </View>
                </View>
            )}

            {/* Challenge List */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={challenges}
                    renderItem={renderChallenge}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có thử thách nào</Text>
                            <Text style={styles.emptySubText}>
                                Vui lòng liên hệ Admin để thêm thử thách vào hệ thống
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 5
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10
    },
    backBtn: { padding: 8 },
    headerCenter: { flex: 1, marginLeft: 10 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4
    },
    streakText: { fontSize: 16, fontWeight: 'bold', color: '#FF5722' },

    // Streak Card
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2'
    },
    streakInfo: { marginLeft: 12, flex: 1 },
    streakTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100' },
    streakDesc: { fontSize: 12, color: '#FF8F00', marginTop: 2 },

    // List
    listContainer: { padding: 15, paddingBottom: 100 },

    // Challenge Card
    challengeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconContainerCompleted: {
        backgroundColor: COLORS.primary
    },
    challengeContent: { flex: 1, marginLeft: 12 },
    challengeTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    challengeDesc: { fontSize: 12, color: '#888', marginTop: 2 },

    // Progress
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3
    },
    progressText: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        minWidth: 30
    },

    // Bonus
    bonusContainer: { marginLeft: 10, alignItems: 'center' },
    bonusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 4
    },
    bonusText: { fontSize: 12, fontWeight: 'bold', color: '#FF9800' },

    claimBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 15,
        alignItems: 'center',
        minWidth: 60
    },
    claimText: { color: 'white', fontSize: 11, fontWeight: '600' },
    bonusPoints: { color: '#FFEB3B', fontSize: 13, fontWeight: 'bold' },

    claimedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    claimedText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },

    // Empty
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 15 },
    emptySubText: { fontSize: 12, color: '#bbb', marginTop: 5, textAlign: 'center', paddingHorizontal: 40 }
});
