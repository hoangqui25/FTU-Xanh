// src/services/user.js

import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../configs/firebase";
import { parseUser } from "../types/database";

export const UserService = {

  /**
   * 1️⃣ LẤY THÔNG TIN NGƯỜI DÙNG
   * @returns {Promise<import('../types/database').User|null>}
   */
  getUserProfile: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return null;

      // Sử dụng parseUser từ database.js
      return parseUser(snap.data(), user.uid);

    } catch (error) {
      console.error("❌ Lỗi lấy Profile:", error);
      return null;
    }
  },

  /**
   * 2️⃣ CẬP NHẬT PROFILE CHUNG (DÙNG KHI UPDATE NHIỀU FIELD)
   */
  updateProfile: async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      const forbiddenFields = [
        'currentPoints',
        'lifetimePoints',
        'rank',
        'role',
        'uid',
        'email'
      ];

      const safeData = { ...data };
      forbiddenFields.forEach(f => delete safeData[f]);

      safeData.updatedAt = serverTimestamp();

      await updateDoc(doc(db, "users", user.uid), safeData);
      return true;

    } catch (error) {
      console.error("❌ Lỗi updateProfile:", error);
      throw error;
    }
  },

  /**
   * 3️⃣ CẬP NHẬT TÊN
   */
  updateName: async (name) => {
    try {
      if (!name) return;

      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("❌ Lỗi cập nhật tên:", error);
      throw error;
    }
  },

  /**
   * 4️⃣ CẬP NHẬT LỚP
   */
  updateClass: async (className) => {
    try {
      if (!className) return;

      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      await updateDoc(doc(db, "users", user.uid), {
        class: className.trim(),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("❌ Lỗi cập nhật lớp:", error);
      throw error;
    }
  },

  /**
   * 5️⃣ CẬP NHẬT KHOA
   */
  updateDepartment: async (department) => {
    try {
      if (!department) return;

      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      await updateDoc(doc(db, "users", user.uid), {
        department: department.trim(),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("❌ Lỗi cập nhật khoa:", error);
      throw error;
    }
  },

  /**
   * 6️⃣ CẬP NHẬT ẢNH ĐẠI DIỆN
   */
  updateAvatar: async (imageUrl) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Chưa đăng nhập");

      await updateDoc(doc(db, "users", user.uid), {
        avatar: imageUrl,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("❌ Lỗi cập nhật Avatar:", error);
      throw error;
    }
  }
};
