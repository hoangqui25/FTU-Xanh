// src/types/database.js
// =====================================================
// ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU CHO FIREBASE DATABASE
// Sử dụng để tạo và query dữ liệu một cách nhất quán
// =====================================================

import { serverTimestamp } from "firebase/firestore";

// =====================================================
// 1. USER - Thông tin người dùng
// Collection: users/{uid}
// =====================================================

/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} email
 * @property {string} name
 * @property {string} studentId
 * @property {string} phone
 * @property {string} class
 * @property {string} department
 * @property {string} avatar
 * @property {string} role
 * @property {number} currentPoints
 * @property {number} totalRecycled
 * @property {string} rank
 * @property {Date} createdAt
 * @property {Date} lastLogin
 */

/**
 * Tạo đối tượng User mới để lưu vào Firestore
 * @param {Object} params
 * @returns {Object}
 */
export const createUser = ({
    uid,
    email,
    name = "",
    studentId = "",
    phone = "",
    className = "",
    department = "",
    avatar = "https://via.placeholder.com/150",
    role = "user"
}) => ({
    uid,
    email: email?.trim() || "",
    name: name?.trim() || "",
    studentId: studentId?.trim().toUpperCase() || "",
    phone: phone?.trim() || "",
    class: className?.trim() || "",
    department: department?.trim() || "",
    avatar,
    role: role || "user",
    currentPoints: 0,
    totalRecycled: 0,
    rank: "Tân binh",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
});

/**
 * Parse User từ Firestore document
 * @param {Object} doc - Firestore document data
 * @param {string} uid - User ID
 * @returns {User}
 */
export const parseUser = (doc, uid) => ({
    uid,
    email: doc.email || "",
    name: doc.name || "",
    studentId: doc.studentId || "",
    phone: doc.phone || "",
    class: doc.class || "",
    department: doc.department || "",
    avatar: doc.avatar || "https://via.placeholder.com/150",
    role: doc.role || "user",
    currentPoints: doc.currentPoints || 0,
    totalRecycled: doc.totalRecycled || 0,
    recycleCount: doc.totalRecycled || doc.recycleCount || 0, // Alias cho ProfileScreen
    rank: doc.rank || "Thành viên mới",
    createdAt: doc.createdAt?.toDate?.() || null,
    lastLogin: doc.lastLogin?.toDate?.() || null
});

// =====================================================
// 2. REWARD - Quà đổi thưởng
// Collection: rewards/{id}
// =====================================================

/**
 * @typedef {Object} Reward
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} image
 * @property {number} points
 * @property {number} stock
 * @property {string} category
 * @property {boolean} isActive
 */

export const REWARD_CATEGORIES = {
    VOUCHER: "Voucher",
    ITEM: "Vật phẩm",
    PLANT: "Cây xanh"
};

/**
 * Tạo đối tượng Reward mới để lưu vào Firestore
 */
export const createReward = ({
    name,
    description = "",
    image = "",
    points,
    stock = 0,
    category = REWARD_CATEGORIES.ITEM
}) => ({
    name: name?.trim() || "",
    description: description?.trim() || "",
    image,
    points: Number(points) || 0,
    stock: Number(stock) || 0,
    category,
    isActive: true,
    createdAt: serverTimestamp()
});

/**
 * Parse Reward từ Firestore document
 */
export const parseReward = (doc, id) => ({
    id,
    name: doc.name || "",
    description: doc.description || "",
    image: doc.image || "",
    points: doc.points || 0,
    stock: doc.stock || 0,
    category: doc.category || REWARD_CATEGORIES.ITEM,
    isActive: doc.isActive !== false
});

// =====================================================
// 3. CHALLENGE - Thử thách hàng ngày
// Collection: challenges/{id}
// =====================================================

/**
 * @typedef {Object} Challenge
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {number} targetCount
 * @property {number} bonusPoints
 * @property {string} type
 * @property {boolean} isActive
 */

export const CHALLENGE_TYPES = {
    RECYCLE_COUNT: "recycle_count",
    RECYCLE_CATEGORY: "recycle_category",
    STREAK: "streak"
};

/**
 * Tạo đối tượng Challenge mới để lưu vào Firestore
 */
export const createChallenge = ({
    title,
    description = "",
    icon = "trophy",
    targetCount,
    bonusPoints,
    type = CHALLENGE_TYPES.RECYCLE_COUNT
}) => ({
    title: title?.trim() || "",
    description: description?.trim() || "",
    icon,
    targetCount: Number(targetCount) || 1,
    bonusPoints: Number(bonusPoints) || 0,
    type,
    isActive: true,
    createdAt: serverTimestamp()
});

/**
 * Parse Challenge từ Firestore document
 */
export const parseChallenge = (doc, id) => ({
    id,
    title: doc.title || "",
    description: doc.description || "",
    icon: doc.icon || "trophy",
    targetCount: doc.targetCount || 1,
    bonusPoints: doc.bonusPoints || 0,
    type: doc.type || CHALLENGE_TYPES.RECYCLE_COUNT,
    isActive: doc.isActive !== false
});

// Mẫu thử thách để thêm vào Firebase Console
export const SAMPLE_CHALLENGES = [
    createChallenge({ title: "Tái chế 1 lần", description: "Chụp hình tái chế 1 lần trong ngày", icon: "camera", targetCount: 1, bonusPoints: 5 }),
    createChallenge({ title: "Tái chế 3 lần", description: "Chụp hình tái chế 3 lần trong ngày", icon: "leaf", targetCount: 3, bonusPoints: 15 }),
    createChallenge({ title: "Chiến binh xanh", description: "Chụp hình tái chế 5 lần trong ngày", icon: "trophy", targetCount: 5, bonusPoints: 30 })
];

// =====================================================
// 4. DAILY PROGRESS - Tiến độ thử thách hàng ngày
// Collection: users/{uid}/dailyProgress/{date}
// =====================================================

/**
 * @typedef {Object} ChallengeProgress
 * @property {number} current
 * @property {boolean} completed
 * @property {boolean} claimed
 */

/**
 * @typedef {Object} DailyProgress
 * @property {string} date
 * @property {Object.<string, ChallengeProgress>} challenges
 * @property {number} streak
 */

/**
 * Tạo progress mặc định cho 1 thử thách
 */
export const createChallengeProgress = () => ({
    current: 0,
    completed: false,
    claimed: false
});

/**
 * Tạo đối tượng DailyProgress mới
 * @param {string} date - YYYY-MM-DD
 * @param {string[]} challengeIds - Danh sách ID thử thách
 * @param {number} streak
 */
export const createDailyProgress = (date, challengeIds = [], streak = 0) => {
    const challenges = {};
    challengeIds.forEach(id => {
        challenges[id] = createChallengeProgress();
    });

    return {
        date,
        challenges,
        streak,
        createdAt: serverTimestamp()
    };
};

/**
 * Parse DailyProgress từ Firestore document
 */
export const parseDailyProgress = (doc) => ({
    date: doc.date || "",
    challenges: doc.challenges || {},
    streak: doc.streak || 0,
    createdAt: doc.createdAt?.toDate?.() || null
});

// =====================================================
// 5. REDEMPTION - Lịch sử đổi quà
// Collection: users/{uid}/redemptions/{id} hoặc my_rewards
// =====================================================

/**
 * @typedef {Object} Redemption
 * @property {string} id
 * @property {string} uid
 * @property {string} rewardId
 * @property {string} rewardName
 * @property {string} rewardImage
 * @property {number} pointsUsed
 * @property {string} code
 * @property {string} status
 * @property {Date} expiryDate
 */

export const REDEMPTION_STATUS = {
    UNUSED: "UNUSED",
    USED: "USED",
    EXPIRED: "EXPIRED"
};

/**
 * Tạo đối tượng Redemption khi đổi quà
 */
export const createRedemption = ({
    uid,
    rewardId,
    rewardName,
    rewardImage = "",
    pointsUsed,
    expiryDays = 30
}) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return {
        uid,
        rewardId,
        rewardName: rewardName?.trim() || "",
        rewardImage,
        pointsUsed: Number(pointsUsed) || 0,
        code: generateVoucherCode(),
        status: REDEMPTION_STATUS.UNUSED,
        expiryDate,
        createdAt: serverTimestamp()
    };
};

/**
 * Parse Redemption từ Firestore document
 */
export const parseRedemption = (doc, id) => ({
    id,
    uid: doc.uid || "",
    rewardId: doc.rewardId || "",
    rewardName: doc.rewardName || "",
    rewardImage: doc.rewardImage || "",
    pointsUsed: doc.pointsUsed || 0,
    code: doc.code || "",
    status: doc.status || REDEMPTION_STATUS.UNUSED,
    expiryDate: doc.expiryDate?.toDate?.() || null,
    createdAt: doc.createdAt?.toDate?.() || null
});

// =====================================================
// 6. FEEDBACK - Góp ý phản hồi
// Collection: feedbacks/{id}
// =====================================================

/**
 * @typedef {Object} Feedback
 * @property {string} id
 * @property {string} uid
 * @property {string} userName
 * @property {string} userEmail
 * @property {string} content
 * @property {string} type
 * @property {string} status
 */

export const FEEDBACK_TOPICS = {
    VEISINH: "Vệ sinh",
    FACILITIES: "Cơ sở vật chất",
    IDEA: "Ý tưởng Xanh",
    OTHER: "Khác"
};

export const FEEDBACK_STATUS = {
    PENDING: "pending",
    REVIEWED: "reviewed",
    RESOLVED: "resolved"
};

/**
 * Tạo đối tượng Feedback mới
 */
export const createFeedback = ({
    uid,
    userName = "",
    userEmail = "",
    topic,
    content,
    contact = ""
}) => ({
    uid,
    userName: userName?.trim() || "",
    userEmail: userEmail?.trim() || "",
    topic: topic || 'Other',
    content: content?.trim() || "",
    contact: contact?.trim() || "",
    status: FEEDBACK_STATUS.PENDING,
    createdAt: serverTimestamp()
});

/**
 * Parse Feedback từ Firestore document
 */
export const parseFeedback = (doc, id) => ({
    id,
    uid: doc.uid || "",
    userName: doc.userName || "",
    userEmail: doc.userEmail || "",
    topic: doc.topic || 'Other',
    content: doc.content || "",
    contact: doc.contact || "",
    status: doc.status || FEEDBACK_STATUS.PENDING,
    createdAt: doc.createdAt?.toDate?.() || null,
    resolvedAt: doc.resolvedAt?.toDate?.() || null
});

// =====================================================
// 7. HISTORY - Lịch sử giao dịch điểm
// Collection: history/{id}
// =====================================================

/**
 * @typedef {Object} History
 * @property {string} id
 * @property {string} uid
 * @property {string} action
 * @property {string} title
 * @property {number} points
 * @property {string} rewardId
 */

export const HISTORY_ACTIONS = {
    RECYCLE: "RECYCLE",
    REDEEM: "REDEEM",
    BONUS: "BONUS",
    ADMIN: "ADMIN"
};

export const RECYCLE_REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
};

/**
 * Tạo đối tượng History mới
 */
export const createHistory = ({
    uid,
    action,
    title,
    points,
    rewardId = null,
    imageUrl = null,
    status = null
}) => ({
    uid,
    action,
    title: title?.trim() || "",
    points: Number(points) || 0,
    rewardId,
    imageUrl,
    status: status || (action === HISTORY_ACTIONS.RECYCLE ? RECYCLE_REQUEST_STATUS.PENDING : null),
    createdAt: serverTimestamp()
});

/**
 * Parse History từ Firestore document
 */
export const parseHistory = (doc, id) => ({
    id,
    uid: doc.uid || "",
    action: doc.action || "",
    title: doc.title || "",
    points: doc.points || 0,
    rewardId: doc.rewardId || null,
    imageUrl: doc.imageUrl || null,
    status: doc.status || null,
    createdAt: doc.createdAt?.toDate?.() || null
});

// =====================================================
// 8. POST - Bài viết/Tin tức
// Collection: posts/{id}
// =====================================================

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} category
 * @property {string} status
 * @property {string[]} images
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export const POST_CATEGORIES = {
    NEWS: "Tin tức",
    EVENT: "Sự kiện",
    ANNOUNCEMENT: "Thông báo",
    TIP: "Mẹo xanh"
};

export const POST_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED"
};

/**
 * Tạo đối tượng Post mới để lưu vào Firestore
 */
export const createPost = ({
    title,
    content = "",
    authorId,
    authorName = "",
    category = POST_CATEGORIES.NEWS,
    status = POST_STATUS.DRAFT,
    images = []
}) => ({
    title: title?.trim() || "",
    content: content?.trim() || "",
    authorId,
    authorName: authorName?.trim() || "",
    category,
    status,
    images: Array.isArray(images) ? images : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
});

/**
 * Parse Post từ Firestore document
 */
export const parsePost = (doc, id) => ({
    id,
    title: doc.title || "",
    content: doc.content || "",
    authorId: doc.authorId || "",
    authorName: doc.authorName || "",
    category: doc.category || POST_CATEGORIES.NEWS,
    status: doc.status || POST_STATUS.DRAFT,
    images: Array.isArray(doc.images) ? doc.images : [],
    createdAt: doc.createdAt?.toDate?.() || null,
    updatedAt: doc.updatedAt?.toDate?.() || null
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Lấy ngày hôm nay theo format YYYY-MM-DD
 */
export const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Lấy ngày hôm qua theo format YYYY-MM-DD
 */
export const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
};

/**
 * Format số điểm với dấu phẩy
 */
export const formatPoints = (points) => {
    return (points || 0).toLocaleString();
};

/**
 * Tạo mã voucher ngẫu nhiên
 */
export const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VOUCHER-${result}`;
};

// =====================================================
// EXPORT DEFAULT VALUES (cho backward compatibility)
// =====================================================

export const DEFAULT_USER = {
    name: "",
    studentId: "",
    class: "",
    department: "",
    avatar: "https://via.placeholder.com/150",
    currentPoints: 0,
    totalRecycled: 0,
    recycleCount: 0,
    rank: "Thành viên mới"
};

export const DEFAULT_CHALLENGE_PROGRESS = {
    current: 0,
    completed: false,
    claimed: false
};


