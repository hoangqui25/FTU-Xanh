// src/services/location.js

import { 
  collection, 
  getDocs, 
  query, 
  where, 
} from "firebase/firestore";
import { db } from "../configs/firebase";

export const LocationService = {
  /**
   * 1️⃣ LẤY TẤT CẢ ĐỊA ĐIỂM
   * Trả về danh sách gồm: thùng rác, trạm pin, điểm thu gom nhựa
   */
  getAllLocations: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "locations"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("❌ Lỗi lấy tất cả vị trí:", error);
      return [];
    }
  },

  /**
   * 2️⃣ LỌC ĐỊA ĐIỂM THEO LOẠI
   * @param {string} type - 'RECYCLE_BIN', 'BATTERY_STATION', hoặc 'PLASTIC_DROP'
   */
  getLocationsByType: async (type) => {
    try {
      const q = query(collection(db, "locations"), where("type", "==", type));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Lỗi lấy vị trí loại ${type}:`, error);
      return [];
    }
  },
};