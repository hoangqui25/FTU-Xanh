// src/services/challenge.js

import { db, auth } from "../configs/firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";
import { PointService } from "./point";
import {
    CHALLENGE_TYPES,
    getTodayString,
    getYesterdayString,
    parseChallenge,
    createChallengeProgress
} from "../types/database";

export const ChallengeService = {
    /**
     * 1. Lấy danh sách thử thách và tiến độ hôm nay
     */
    getTodayChallenges: async () => {
        try {
            const user = auth.currentUser;
            if (!user) return { challenges: [], streak: 0 };

            const today = getTodayString();

            // A. Lấy danh sách thử thách từ collection 'challenges'
            const challengesRef = collection(db, "challenges");
            // Sắp xếp theo thời gian tạo mới nhất
            const q = query(challengesRef, orderBy('createdAt', 'desc'));
            const challengesSnap = await getDocs(q);

            const challengesList = [];
            challengesSnap.forEach((docSnap) => {
                const challenge = parseChallenge(docSnap.data(), docSnap.id);
                // Chỉ hiển thị thử thách đang active
                if (challenge.isActive !== false) {
                    challengesList.push(challenge);
                }
            });

            // B. Lấy tiến độ của user hôm nay
            const progressRef = doc(db, "users", user.uid, "dailyProgress", today);
            const progressSnap = await getDoc(progressRef);

            let userProgress = {};
            let streak = 0;

            if (progressSnap.exists()) {
                const data = progressSnap.data();
                userProgress = data.challenges || {};
                streak = data.streak || 0;
            } else {
                // Nếu chưa có document cho ngày hôm nay, khởi tạo
                const initialProgress = {};
                challengesList.forEach(c => {
                    initialProgress[c.id] = createChallengeProgress();
                });

                // Tính streak từ ngày hôm qua
                streak = await ChallengeService.calculateStreak();

                await setDoc(progressRef, {
                    date: today,
                    challenges: initialProgress,
                    streak: streak,
                    createdAt: serverTimestamp()
                });

                userProgress = initialProgress;
            }

            // C. Gộp thử thách với tiến độ
            const result = challengesList.map(challenge => ({
                ...challenge,
                current: userProgress[challenge.id]?.current || 0,
                completed: userProgress[challenge.id]?.completed || false,
                claimed: userProgress[challenge.id]?.claimed || false
            }));

            return { challenges: result, streak };
        } catch (error) {
            console.error("❌ Lỗi getTodayChallenges:", error);
            return { challenges: [], streak: 0 };
        }
    },

    /**
     * 2. Cập nhật tiến độ khi tái chế (gọi từ CameraScreen sau khi chụp)
     */
    updateProgress: async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const today = getTodayString();
            const progressRef = doc(db, "users", user.uid, "dailyProgress", today);
            const progressSnap = await getDoc(progressRef);

            if (!progressSnap.exists()) {
                await ChallengeService.getTodayChallenges();
            }

            const freshSnap = await getDoc(progressRef);
            if (!freshSnap.exists()) return;

            const data = freshSnap.data();
            const challenges = data.challenges || {};

            // Lấy danh sách thử thách gốc để biết targetCount
            const challengesRef = collection(db, "challenges");
            const challengesSnap = await getDocs(challengesRef);
            const challengeMap = {};
            challengesSnap.forEach((docSnap) => {
                challengeMap[docSnap.id] = docSnap.data();
            });

            // Cập nhật tất cả thử thách loại "recycle_count"
            const updatedChallenges = { ...challenges };

            Object.keys(updatedChallenges).forEach(id => {
                const original = challengeMap[id];
                if (original && original.type === CHALLENGE_TYPES.RECYCLE_COUNT) {
                    const challenge = updatedChallenges[id];

                    // Parse target count (support number or string like "3 times")
                    let target = 1;
                    if (typeof original.targetCount === 'number') {
                        target = original.targetCount;
                    } else if (typeof original.targetCount === 'string') {
                        const match = original.targetCount.match(/\d+/);
                        target = match ? parseInt(match[0]) : 1;
                    }

                    if (!challenge.completed) {
                        challenge.current = (challenge.current || 0) + 1;
                        if (challenge.current >= target) {
                            challenge.completed = true;
                        }
                    }
                }
            });

            await updateDoc(progressRef, { challenges: updatedChallenges });
            return updatedChallenges;
        } catch (error) {
            console.error("❌ Lỗi updateProgress:", error);
        }
    },

    /**
     * 3. Nhận điểm bonus khi hoàn thành thử thách
     */
    claimBonus: async (challengeId, bonusPoints) => {
        try {
            console.log(`🎁 [claimBonus] Request for challenge: ${challengeId}, points: ${bonusPoints}`);

            // Debug PointService
            console.log("🔍 [claimBonus] PointService keys:", Object.keys(PointService));
            if (typeof PointService.addBonusPoints !== 'function') {
                console.error("❌ [claimBonus] PointService.addBonusPoints is NOT a function! Please reload app.");
                throw new Error("Lỗi hệ thống: Cần reload app để cập nhật code mới");
            }

            const user = auth.currentUser;
            if (!user) throw new Error("Chưa đăng nhập");

            const today = getTodayString();
            console.log(`📅 [claimBonus] Date: ${today}`);

            const progressRef = doc(db, "users", user.uid, "dailyProgress", today);
            const progressSnap = await getDoc(progressRef);

            if (!progressSnap.exists()) {
                console.error(`❌ [claimBonus] No progress doc found for date: ${today}`);
                throw new Error("Không tìm thấy dữ liệu tiến độ ngày hôm nay");
            }

            const data = progressSnap.data();
            const challenges = data.challenges || {};
            const challenge = challenges[challengeId];

            console.log(`🔍 [claimBonus] Challenge data:`, JSON.stringify(challenge));

            if (!challenge) {
                throw new Error("Không tìm thấy thông tin thử thách này trong tiến độ");
            }

            if (!challenge.completed) {
                console.warn(`⚠️ [claimBonus] Challenge not completed. Status:`, challenge);
                throw new Error("Thử thách chưa hoàn thành");
            }

            if (challenge.claimed) {
                console.warn(`⚠️ [claimBonus] Already claimed.`);
                throw new Error("Đã nhận thưởng rồi");
            }

            // Cộng điểm bonus
            await PointService.addBonusPoints(bonusPoints);

            // Đánh dấu đã nhận thưởng
            challenges[challengeId].claimed = true;
            await updateDoc(progressRef, { challenges });

            // Cập nhật streak nếu tất cả thử thách đã hoàn thành
            const allCompleted = Object.values(challenges).every(c => c.completed);
            if (allCompleted) {
                const newStreak = (data.streak || 0) + 1;
                await updateDoc(progressRef, { streak: newStreak });
            }

            return { success: true, message: `+${bonusPoints} điểm bonus!` };
        } catch (error) {
            console.error("❌ Lỗi claimBonus:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * 4. Tính streak từ các ngày trước
     */
    calculateStreak: async () => {
        try {
            const user = auth.currentUser;
            if (!user) return 0;

            const yesterdayStr = getYesterdayString();
            const progressRef = doc(db, "users", user.uid, "dailyProgress", yesterdayStr);
            const progressSnap = await getDoc(progressRef);

            if (!progressSnap.exists()) {
                return 0;
            }

            const data = progressSnap.data();
            const challenges = data.challenges || {};

            const allCompleted = Object.values(challenges).every(c => c.completed);

            if (allCompleted) {
                return (data.streak || 0);
            }

            return 0;
        } catch (error) {
            console.error("❌ Lỗi calculateStreak:", error);
            return 0;
        }
    }
};
