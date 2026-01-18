// src/services/feedback.js
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../configs/firebase';
import { createFeedback } from '../types/database';

/**
 * Service để quản lý feedback/góp ý
 */
export const FeedbackService = {
    /**
     * Gửi góp ý mới
     * @param {Object} params
     * @param {string} params.topic - Chủ đề
     * @param {string} params.content - Nội dung
     * @param {string} params.contact - SĐT liên hệ (optional)
     * @returns {Promise<string>} - ID của feedback
     */
    submitFeedback: async ({ topic, content, contact = '' }) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Bạn cần đăng nhập để gửi góp ý");
            }

            const feedbackData = createFeedback({
                uid: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                userEmail: user.email || '',
                topic,
                content,
                contact
            });

            const docRef = await addDoc(collection(db, 'feedbacks'), feedbackData);
            console.log("✅ [FeedbackService] Feedback submitted:", docRef.id);

            return docRef.id;
        } catch (error) {
            console.error("❌ [FeedbackService] Error submitting feedback:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách feedback của user hiện tại
     * @returns {Promise<Array>} - Danh sách feedback
     */
    getUserFeedbacks: async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Bạn cần đăng nhập");
            }

            const q = query(
                collection(db, 'feedbacks'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const feedbacks = [];

            querySnapshot.forEach((doc) => {
                feedbacks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return feedbacks;
        } catch (error) {
            console.error("❌ [FeedbackService] Error getting feedbacks:", error);
            throw error;
        }
    }
};
