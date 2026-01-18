// src/services/auth.js
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const loginAdmin = async (email, password) => {
    try {
        // 1. Đăng nhập Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Kiểm tra Role trong Firestore
        // Giả sử collection 'users' lưu thông tin user
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await signOut(auth);
            throw new Error("Tài khoản không tồn tại trong hệ thống.");
        }

        const userData = userSnap.data();
        if (userData.role !== 'admin') {
            await signOut(auth);
            throw new Error("Bạn không có quyền truy cập Admin!");
        }

        // 3. Lưu session
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminEmail', user.email);

        return user;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

export const logoutAdmin = async () => {
    await signOut(auth);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    window.location.href = "/login";
};
