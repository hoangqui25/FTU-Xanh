// src/services/activities.js

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../configs/firebase';

/**
 * Service để quản lý activities/posts trong React Native app
 */
export const ActivitiesService = {
    /**
     * Lấy tất cả posts đã xuất bản
     */
    getAllPosts: async () => {
        try {
            console.log("🔍 [ActivitiesService] Fetching all published posts...");

            // Chỉ orderBy để tránh cần composite index
            const q = query(
                collection(db, "posts"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            console.log("📊 [ActivitiesService] Found", querySnapshot.size, "posts");

            const posts = [];
            querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();

                // Filter PUBLISHED posts ở client-side
                if (data.status === "PUBLISHED") {
                    posts.push({
                        id: docSnapshot.id,
                        ...data,
                        // Convert Firestore Timestamps to Date objects
                        createdAt: data.createdAt?.toDate?.() || null,
                        updatedAt: data.updatedAt?.toDate?.() || null
                    });
                }
            });

            console.log("✅ [ActivitiesService] Filtered to", posts.length, "published posts");
            return posts;
        } catch (error) {
            console.error("❌ [ActivitiesService] Error fetching posts:", error);
            throw error;
        }
    },

    /**
     * Lấy posts theo category
     */
    getPostsByCategory: async (category) => {
        try {
            console.log("🔍 [ActivitiesService] Fetching posts by category:", category);

            // Chỉ orderBy để tránh cần composite index
            const q = query(
                collection(db, "posts"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            console.log("📊 [ActivitiesService] Found", querySnapshot.size, "total posts");

            const posts = [];
            querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();

                // Filter PUBLISHED posts và category ở client-side
                if (data.status === "PUBLISHED" && data.category === category) {
                    posts.push({
                        id: docSnapshot.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() || null,
                        updatedAt: data.updatedAt?.toDate?.() || null
                    });
                }
            });

            console.log("✅ [ActivitiesService] Filtered to", posts.length, "posts in category:", category);
            return posts;
        } catch (error) {
            console.error("❌ [ActivitiesService] Error fetching posts by category:", error);
            throw error;
        }
    }
};
