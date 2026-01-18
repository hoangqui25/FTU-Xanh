// src/services/auth.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// Import config
import { auth, db } from "../configs/firebase";
import { createUser, parseUser } from "../types/database";

export const AuthService = {

  // ==============================
  // 1. ĐĂNG KÝ (Register)
  // ==============================
  register: async (email, password, name, studentId) => {
    try {
      // 1. Validate cơ bản (Tránh gửi dữ liệu rỗng lên server)
      if (!email || !password || !name) {
        throw new Error("Vui lòng điền đầy đủ Email, Mật khẩu và Tên.");
      }

      // 2. Tạo tài khoản Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Cập nhật DisplayName ngay lập tức (Để UI hiển thị đẹp ngay)
      await updateProfile(user, {
        displayName: name.trim()
      }).catch(e => console.log("Warning: Update profile name failed", e));

      // 4. Tạo dữ liệu User trong Firestore sử dụng createUser từ database.js
      const userData = createUser({
        uid: user.uid,
        email: email.trim(),
        name: name.trim(),
        studentId: studentId || ""
      });

      // Lưu vào Collection 'users' với ID là uid của Auth
      await setDoc(doc(db, "users", user.uid), userData);

      return user;
    } catch (error) {
      throw handleFirebaseError(error);
    }
  },

  // ==============================
  // 2. ĐĂNG NHẬP (Login)
  // ==============================
  login: async (email, password) => {
    try {
      if (!email || !password) throw new Error("Vui lòng nhập Email và Mật khẩu.");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cập nhật thời gian đăng nhập lần cuối (Fire & Forget - không cần await để app nhanh hơn)
      updateDoc(doc(db, "users", user.uid), {
        lastLogin: serverTimestamp()
      }).catch(err => console.log("Log time error:", err));

      return user;
    } catch (error) {
      throw handleFirebaseError(error);
    }
  },

  // ==============================
  // 3. ĐĂNG XUẤT (Logout)
  // ==============================
  logout: async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  },

  // ==============================
  // 4. LẤY PROFILE USER
  // ==============================
  getUserProfile: async (uid) => {
    try {
      if (!uid) return null;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Xử lý chuyển đổi Timestamp sang Date object (nếu cần dùng trong UI)
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          // Nếu data.currentPoints bị thiếu thì mặc định là 0
          currentPoints: data.currentPoints || 0
        };
      } else {
        return null;
      }
    } catch (error) {
      console.log("Lỗi lấy profile:", error);
      return null;
    }
  },

  // Helper lấy ID hiện tại
  getCurrentUserId: () => auth.currentUser?.uid || null,
};

// ==============================
// XỬ LÝ LỖI (Việt hóa chi tiết)
// ==============================
const handleFirebaseError = (error) => {
  console.error("🔥 Auth Error:", error.code, error.message);

  // Nếu error là chuỗi text thường (do mình tự throw)
  if (!error.code) {
    return new Error(error.message);
  }

  let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

  switch (error.code) {
    case 'auth/email-already-in-use':
      msg = 'Email này đã được sử dụng bởi tài khoản khác.'; break;
    case 'auth/user-not-found':
      msg = 'Tài khoản không tồn tại.'; break;
    case 'auth/wrong-password':
      msg = 'Mật khẩu không chính xác.'; break;
    case 'auth/invalid-email':
      msg = 'Định dạng Email không hợp lệ.'; break;
    case 'auth/weak-password':
      msg = 'Mật khẩu quá yếu (cần ít nhất 6 ký tự).'; break;
    case 'auth/too-many-requests':
      msg = 'Bạn đã nhập sai quá nhiều lần. Vui lòng đợi lát nữa.'; break;
    case 'auth/network-request-failed':
      msg = 'Không có kết nối mạng.'; break;
    case 'auth/invalid-credential':
      msg = 'Thông tin đăng nhập không hợp lệ.'; break;
  }

  return new Error(msg);
};