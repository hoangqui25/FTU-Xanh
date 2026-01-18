// src/services/postService.js
import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service để quản lý posts trong admin web
 */
export const PostService = {
    /**
     * Lấy tất cả posts
     */
    getAllPosts: async () => {
        try {
            console.log("🔍 [PostService] Fetching all posts...");

            const q = query(
                collection(db, "posts"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            console.log("📊 [PostService] Found", querySnapshot.size, "posts");

            const posts = [];
            querySnapshot.forEach((docSnapshot) => {
                posts.push({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                    // Convert Firestore Timestamps to Date objects
                    createdAt: docSnapshot.data().createdAt?.toDate?.() || null,
                    updatedAt: docSnapshot.data().updatedAt?.toDate?.() || null
                });
            });

            return posts;
        } catch (error) {
            console.error("❌ [PostService] Error fetching posts:", error);
            throw error;
        }
    },

    /**
     * Lấy một post theo ID
     */
    getPostById: async (postId) => {
        try {
            console.log("🔍 [PostService] Fetching post:", postId);

            const docRef = doc(db, "posts", postId);
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists()) {
                throw new Error("Post not found");
            }

            return {
                id: docSnapshot.id,
                ...docSnapshot.data(),
                createdAt: docSnapshot.data().createdAt?.toDate?.() || null,
                updatedAt: docSnapshot.data().updatedAt?.toDate?.() || null
            };
        } catch (error) {
            console.error("❌ [PostService] Error fetching post:", error);
            throw error;
        }
    },

    /**
     * Tạo post mới
     */
    createPost: async (postData) => {
        try {
            console.log("✅ [PostService] Creating new post:", postData);

            const docRef = await addDoc(collection(db, "posts"), {
                ...postData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log("✅ [PostService] Post created with ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ [PostService] Error creating post:", error);
            throw error;
        }
    },

    /**
     * Cập nhật post
     */
    updatePost: async (postId, postData) => {
        try {
            console.log("✅ [PostService] Updating post:", postId, postData);

            await updateDoc(doc(db, "posts", postId), {
                ...postData,
                updatedAt: serverTimestamp()
            });

            console.log("✅ [PostService] Post updated");
            return true;
        } catch (error) {
            console.error("❌ [PostService] Error updating post:", error);
            throw error;
        }
    },

    /**
     * Xóa post
     */
    deletePost: async (postId) => {
        try {
            console.log("🗑️ [PostService] Deleting post:", postId);

            await deleteDoc(doc(db, "posts", postId));

            console.log("✅ [PostService] Post deleted");
            return true;
        } catch (error) {
            console.error("❌ [PostService] Error deleting post:", error);
            throw error;
        }
    },

    /**
     * Cập nhật status của post
     */
    updatePostStatus: async (postId, newStatus) => {
        try {
            console.log("✅ [PostService] Updating post status:", postId, newStatus);

            await updateDoc(doc(db, "posts", postId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            console.log("✅ [PostService] Status updated");
            return true;
        } catch (error) {
            console.error("❌ [PostService] Error updating status:", error);
            throw error;
        }
    }
};
