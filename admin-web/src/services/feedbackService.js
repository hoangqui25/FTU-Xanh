// src/services/feedbackService.js
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service để quản lý feedback trong admin web
 */
export const FeedbackService = {
    /**
     * Lấy tất cả feedback
     */
    getAllFeedbacks: async () => {
        try {
            console.log("🔍 [FeedbackService] Fetching all feedbacks...");

            const q = query(
                collection(db, "feedbacks"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            console.log("📊 [FeedbackService] Found", querySnapshot.size, "feedbacks");

            const feedbacks = [];
            querySnapshot.forEach((docSnapshot) => {
                feedbacks.push({
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                });
            });

            return feedbacks;
        } catch (error) {
            console.error("❌ [FeedbackService] Error fetching feedbacks:", error);
            throw error;
        }
    },

    /**
     * Cập nhật status của feedback
     */
    updateFeedbackStatus: async (feedbackId, newStatus) => {
        try {
            console.log("✅ [FeedbackService] Updating feedback status:", feedbackId, newStatus);

            await updateDoc(doc(db, "feedbacks", feedbackId), {
                status: newStatus
            });

            console.log("✅ [FeedbackService] Status updated");
            return true;
        } catch (error) {
            console.error("❌ [FeedbackService] Error updating status:", error);
            throw error;
        }
    }
};
