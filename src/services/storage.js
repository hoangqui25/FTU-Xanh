// src/services/storage.js

import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Lấy credentials từ environment variables
const CLOUDINARY_CLOUD_NAME = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME || "dosmdtm1s";
const CLOUDINARY_UPLOAD_PRESET = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET || "reward_upload";

export const StorageService = {
    /**
     * Upload ảnh lên Cloudinary
     * @param {string} imageUri - URI của ảnh từ thiết bị (file://...)
     * @returns {Promise<{success: boolean, url?: string, error?: string}>} - Kết quả upload
     */
    uploadImage: async (imageUri) => {
        if (!imageUri) {
            return { success: false, error: "Không có ảnh để upload" };
        }

        try {
            const data = new FormData();

            // Lấy tên file từ URI
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // Append file vào FormData
            data.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

            // Gọi API Cloudinary
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const result = await res.json();

            if (result.secure_url) {
                console.log("✅ Upload thành công:", result.secure_url);
                return { success: true, url: result.secure_url };
            } else {
                console.error("❌ Upload thất bại:", result);
                const errorMsg = result.error?.message || "Upload thất bại";
                return { success: false, error: errorMsg };
            }

        } catch (error) {
            console.error("❌ Lỗi upload ảnh:", error);
            const errorMsg = error.message || "Không thể kết nối đến server";
            Alert.alert("Lỗi Upload", errorMsg);
            return { success: false, error: errorMsg };
        }
    }
};
