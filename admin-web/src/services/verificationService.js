// src/services/verificationService.js
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserService } from './userService';

/**
 * Service để quản lý việc duyệt ảnh tái chế
 */
export const VerificationService = {
    /**
     * Lấy tất cả yêu cầu tái chế (pending, approved, rejected)
     */
    getAllRequests: async () => {
        try {
            console.log("🔍 [VerificationService] Fetching all requests...");

            // Query tất cả RECYCLE requests
            const q = query(
                collection(db, "history"),
                where("action", "==", "RECYCLE")
            );

            const querySnapshot = await getDocs(q);
            console.log("📊 [VerificationService] Found", querySnapshot.size, "documents");

            // Collect all requests and UIDs
            const requests = [];
            const uids = [];

            querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                if (data.imageUrl) {
                    requests.push({
                        id: docSnapshot.id,
                        ...data,
                        createdAt: data.createdAt
                    });
                    uids.push(data.uid);
                }
            });

            // Fetch all user data in batch using UserService
            console.log("👥 [VerificationService] Fetching user data for", uids.length, "users");
            const userCache = await UserService.getUsersByIds(uids);

            // Attach user data to requests
            requests.forEach(req => {
                req.userData = userCache[req.uid];
                console.log(`📄 User ${req.uid.slice(0, 6)}: ${req.userData?.displayName || req.userData?.email || 'No data'}`);
            });

            // Sort: PENDING trước, sau đó theo thời gian
            requests.sort((a, b) => {
                // PENDING lên đầu
                if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                if (a.status !== "PENDING" && b.status === "PENDING") return 1;

                // Cùng status thì sort theo thời gian
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.seconds - a.createdAt.seconds;
            });

            console.log("📋 [VerificationService] Total requests:", requests.length);
            return requests;

        } catch (error) {
            console.error("❌ [VerificationService] Error fetching requests:", error);

            // Nếu lỗi là do thiếu index, log link tạo index
            if (error.code === 'failed-precondition') {
                console.error("⚠️ [VerificationService] Cần tạo composite index!");
                console.error("Link:", error.message);
            }

            throw error;
        }
    },

    /**
     * Duyệt yêu cầu và cộng điểm cho user
     */
    approveRequest: async (request) => {
        try {
            console.log("✅ [VerificationService] Approving request:", request.id);

            // 1. Cộng điểm cho user trước
            const userRef = doc(db, "users", request.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Tạo user mới
                await setDoc(userRef, {
                    uid: request.uid,
                    currentPoints: request.points,
                    totalRecycled: 1,
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp()
                });
                console.log("✅ [VerificationService] Created new user");
            } else {
                // Cộng điểm cho user hiện tại
                await updateDoc(userRef, {
                    currentPoints: increment(request.points),
                    totalRecycled: increment(1),
                    lastUpdated: serverTimestamp()
                });
                console.log("✅ [VerificationService] Updated user points");
            }

            // 2. Cập nhật status thành APPROVED (giữ lại lịch sử)
            await updateDoc(doc(db, "history", request.id), {
                status: "APPROVED",
                reviewedAt: serverTimestamp()
            });
            console.log("✅ [VerificationService] Updated status to APPROVED");

            console.log("✅ [VerificationService] Approval completed");
            return true;

        } catch (error) {
            console.error("❌ [VerificationService] Error approving:", error);
            throw error;
        }
    },

    /**
     * Từ chối yêu cầu
     */
    rejectRequest: async (request) => {
        try {
            console.log("❌ [VerificationService] Rejecting request:", request.id);

            await updateDoc(doc(db, "history", request.id), {
                status: "REJECTED",
                reviewedAt: serverTimestamp()
            });

            console.log("✅ [VerificationService] Rejection completed");
            return true;

        } catch (error) {
            console.error("❌ [VerificationService] Error rejecting:", error);
            throw error;
        }
    }
};
