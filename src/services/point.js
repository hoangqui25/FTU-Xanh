// src/services/point.js

import { db, auth } from "../configs/firebase";
import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { createHistory, HISTORY_ACTIONS } from "../types/database";

export const PointService = {
  /**
   * 1. Tạo yêu cầu tái chế (chờ admin duyệt)
   * @param {number} amount - Số điểm sẽ được cộng khi duyệt
   * @param {string} [imageUrl] - URL ảnh chứng minh (required)
   * @returns {Promise<string>} - ID của request
   */
  createRecycleRequest: async (amount, imageUrl) => {
    try {
      console.log("🔵 [createRecycleRequest] Bắt đầu tạo yêu cầu...");

      const user = auth.currentUser;
      console.log("👤 [createRecycleRequest] User:", user ? user.uid : "CHƯA ĐĂNG NHẬP");

      if (!user) throw new Error("Bạn cần đăng nhập để gửi yêu cầu");
      if (!imageUrl) throw new Error("Cần có ảnh chứng minh");

      console.log("📸 [createRecycleRequest] Image URL:", imageUrl);
      console.log("💰 [createRecycleRequest] Points:", amount);

      // Tạo lịch sử với trạng thái PENDING
      const historyData = createHistory({
        uid: user.uid,
        action: HISTORY_ACTIONS.RECYCLE,
        title: "Tái chế rác thải",
        points: amount,
        imageUrl: imageUrl
        // status sẽ tự động được set thành PENDING trong createHistory
      });

      console.log("📝 [createRecycleRequest] History data:", JSON.stringify(historyData, null, 2));
      console.log("🔥 [createRecycleRequest] Đang ghi vào Firebase...");

      const docRef = await addDoc(collection(db, "history"), historyData);

      console.log("✅ [createRecycleRequest] Thành công! Document ID:", docRef.id);
      console.log("✅ Yêu cầu tái chế đã được gửi, chờ admin duyệt");

      return docRef.id;

    } catch (error) {
      console.error("❌ [createRecycleRequest] LỖI:", error);
      console.error("❌ [createRecycleRequest] Error code:", error.code);
      console.error("❌ [createRecycleRequest] Error message:", error.message);
      throw error;
    }
  },

  /**
   * 2. Lấy tổng điểm hiện tại
   */
  getCurrentPoints: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return 0;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().currentPoints || 0;
      }
      return 0;
    } catch (error) {
      console.error("❌ Lỗi PointService (getCurrentPoints):", error);
      return 0;
    }
  },

  /**
   * 3. Cộng điểm trực tiếp (dùng cho Bonus, Rewards...)
   * @param {number} amount - Số điểm cộng
   * @param {string} reason - Lý do cộng điểm (title history)
   */
  addBonusPoints: async (amount, reason = "Thưởng thử thách") => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      // 1. Cộng điểm vào user
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        currentPoints: increment(amount),
        lastUpdated: serverTimestamp()
      });

      // 2. Ghi lịch sử
      const historyData = createHistory({
        uid: user.uid,
        action: HISTORY_ACTIONS.BONUS,
        title: reason,
        points: amount,
        status: "APPROVED" // Bonus được duyệt ngay lập tức
      });

      await addDoc(collection(db, "history"), historyData);

      console.log(`✅ Đã cộng ${amount} điểm cho user ${user.uid}`);
      return true;
    } catch (error) {
      console.error("❌ Lỗi PointService (addBonusPoints):", error);
      throw error;
    }
  }
};