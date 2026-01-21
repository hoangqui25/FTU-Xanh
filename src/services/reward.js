// src/services/reward.js

import { db } from "../configs/firebase";
import {
  doc,
  runTransaction,
  collection,
  serverTimestamp
} from "firebase/firestore";
import {
  createRedemption,
  createHistory,
  HISTORY_ACTIONS,
  generateVoucherCode
} from "../types/database";

export const RewardService = {
  /**
   * Đổi quà: Trừ điểm User + Trừ tồn kho Reward + Lưu lịch sử
   * @param {string} uid - ID của người dùng (từ Auth)
   * @param {object} rewardItem - Object quà (Bắt buộc phải có id, price, name)
   */
  redeemReward: async (uid, rewardItem) => {
    try {
      if (!uid || !rewardItem?.id) throw new Error("Thiếu thông tin User hoặc Quà tặng");

      // Bắt đầu Transaction (Giao dịch nguyên tử)
      // Transaction đảm bảo: Hoặc thành công tất cả, hoặc thất bại tất cả.
      await runTransaction(db, async (transaction) => {

        // --- BƯỚC 1: TẠO THAM CHIẾU (REFS) ---
        const userRef = doc(db, "users", uid);
        const rewardRef = doc(db, "rewards", rewardItem.id); // Collection chứa thông tin gốc của quà

        // Tạo tham chiếu cho các document mới sẽ sinh ra
        const historyRef = doc(collection(db, "history"));
        const myRewardRef = doc(collection(db, "my_rewards"));

        // --- BƯỚC 2: ĐỌC DỮ LIỆU (GET) ---
        // Phải đọc tất cả dữ liệu cần thiết trước khi thực hiện ghi (write/update)
        const userDoc = await transaction.get(userRef);
        const rewardDoc = await transaction.get(rewardRef);

        // --- BƯỚC 3: KIỂM TRA ĐIỀU KIỆN (VALIDATION) ---

        // 3.1 Kiểm tra User
        if (!userDoc.exists()) {
          throw "Tài khoản người dùng không tồn tại!";
        }

        // 3.2 Kiểm tra Quà (Quan trọng: Lấy dữ liệu tươi từ DB, không tin dữ liệu từ Client gửi lên)
        if (!rewardDoc.exists()) {
          throw "Món quà này không còn tồn tại hệ thống!";
        }

        const userData = userDoc.data();
        const rewardData = rewardDoc.data(); // Dữ liệu gốc từ DB (chứa stock chuẩn nhất)

        // 3.3 Kiểm tra Tồn kho (Stock)
        if (rewardData.stock <= 0) {
          throw "Rất tiếc, món quà này vừa hết hàng!";
        }

        // 3.4 Kiểm tra Điểm
        const currentPoints = userData.currentPoints || 0;
        const price = rewardData.points || rewardItem.points; // Ưu tiên lấy giá từ DB

        if (currentPoints < price) {
          throw `Bạn cần ${price} điểm, nhưng chỉ có ${currentPoints} điểm.`;
        }

        // --- BƯỚC 4: THỰC HIỆN GHI (WRITE/UPDATE) ---

        // 4.1 Trừ điểm User
        const newPoints = currentPoints - price;
        transaction.update(userRef, { currentPoints: newPoints });

        // 4.2 Trừ tồn kho Quà (Giảm 1 cái)
        transaction.update(rewardRef, { stock: rewardData.stock - 1 });

        // 4.3 Lưu lịch sử giao dịch (History)
        transaction.set(historyRef, {
          uid: uid,
          action: 'REDEEM',
          title: `Đổi quà: ${rewardData.name}`,
          points: -price, // Số âm
          rewardId: rewardItem.id,
          createdAt: serverTimestamp()
        });

        // 4.4 Thêm vào "Quà của tôi" (My Rewards)
        // 4.4 Thêm vào "Quà của tôi" (My Rewards)
        // Sử dụng helper createRedemption để đảm bảo dữ liệu chuẩn và có expiryDate đúng
        const redemptionData = createRedemption({
          uid: uid,
          rewardId: rewardItem.id,
          rewardName: rewardData.name,
          rewardImage: rewardData.image || "",
          pointsUsed: price,
          expiryDays: 30
        });

        transaction.set(myRewardRef, redemptionData);
      });

      return { success: true, message: "Đổi quà thành công!" };

    } catch (error) {
      console.error("Transaction Error:", error);
      // Nếu throw string ở trên thì trả về string, nếu lỗi hệ thống trả về message
      const errorMessage = typeof error === 'string' ? error : (error.message || "Lỗi xử lý đổi quà");
      return { success: false, message: errorMessage };
    }
  }
};
