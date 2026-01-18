// src/services/userService.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service để quản lý thông tin người dùng
 * Dựa theo cấu trúc trong database.js
 */
export const UserService = {
    /**
     * Lấy thông tin user từ Firebase
     * @param {string} uid - User ID
     * @returns {Promise<Object|null>} User data hoặc null nếu không tìm thấy
     */
    getUserById: async (uid) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                    uid,
                    email: data.email || "",
                    name: data.name || "",
                    studentId: data.studentId || "",
                    phone: data.phone || "",
                    class: data.class || "",
                    department: data.department || "",
                    avatar: data.avatar || "https://via.placeholder.com/150",
                    role: data.role || "user",
                    currentPoints: data.currentPoints || 0,
                    totalRecycled: data.totalRecycled || 0,
                    rank: data.rank || "Thành viên mới"
                };
            }

            console.warn(`[UserService] User not found: ${uid}`);
            return null;
        } catch (error) {
            console.error(`[UserService] Error fetching user ${uid}:`, error);
            return null;
        }
    },

    /**
     * Lấy thông tin nhiều users cùng lúc
     * @param {string[]} uids - Array of user IDs
     * @returns {Promise<Object>} Object với key là uid, value là user data
     */
    getUsersByIds: async (uids) => {
        const uniqueUids = [...new Set(uids)]; // Remove duplicates
        const userCache = {};

        await Promise.all(
            uniqueUids.map(async (uid) => {
                userCache[uid] = await UserService.getUserById(uid);
            })
        );

        return userCache;
    },

    /**
     * Format user display name
     * @param {Object} userData - User data object
     * @param {string} fallbackUid - UID để fallback nếu không có tên
     * @returns {string} Display name
     */
    getDisplayName: (userData, fallbackUid) => {
        if (userData?.name) return userData.name;
        if (userData?.email) return userData.email.split('@')[0];
        if (userData?.studentId) return userData.studentId;
        return `User ${fallbackUid.slice(0, 6)}`;
    },

    /**
     * Get avatar URL hoặc initials
     * @param {Object} userData - User data object
     * @param {string} fallbackUid - UID để fallback
     * @returns {Object} { type: 'url' | 'initials', value: string }
     */
    getAvatar: (userData, fallbackUid) => {
        if (userData?.avatar && userData.avatar !== "https://via.placeholder.com/150") {
            return { type: 'url', value: userData.avatar };
        }

        const initials = userData?.name
            ? userData.name.slice(0, 2).toUpperCase()
            : fallbackUid.slice(0, 2).toUpperCase();

        return { type: 'initials', value: initials };
    }
};
