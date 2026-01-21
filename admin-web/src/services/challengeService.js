// admin-web/src/services/challengeService.js
import { db } from '../config/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

export const ChallengeService = {
    /**
     * Lấy tất cả thử thách
     */
    getAllChallenges: async () => {
        try {
            const q = query(
                collection(db, 'challenges'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const challenges = [];

            querySnapshot.forEach((doc) => {
                challenges.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return challenges;
        } catch (error) {
            console.error('Error getting challenges:', error);
            throw error;
        }
    },

    /**
     * Lấy một thử thách theo ID
     */
    getChallengeById: async (id) => {
        try {
            const docRef = doc(db, 'challenges', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                throw new Error('Challenge not found');
            }
        } catch (error) {
            console.error('Error getting challenge:', error);
            throw error;
        }
    },

    /**
     * Tạo thử thách mới
     */
    createChallenge: async (data) => {
        try {
            const challengeData = {
                title: data.title?.trim() || '',
                description: data.description?.trim() || '',
                icon: data.icon?.trim() || 'trophy',
                targetCount: Number(data.targetCount) || 1,
                bonusPoints: Number(data.bonusPoints) || 0,
                type: data.type || 'recycle_count',
                isActive: data.isActive !== false,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'challenges'), challengeData);
            console.log('✅ Challenge created:', docRef.id);

            return {
                id: docRef.id,
                ...challengeData
            };
        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    },

    /**
     * Cập nhật thử thách
     */
    updateChallenge: async (id, data) => {
        try {
            const docRef = doc(db, 'challenges', id);

            const updateData = {
                title: data.title?.trim() || '',
                description: data.description?.trim() || '',
                icon: data.icon?.trim() || 'trophy',
                targetCount: Number(data.targetCount) || 1,
                bonusPoints: Number(data.bonusPoints) || 0,
                type: data.type || 'recycle_count',
                isActive: data.isActive !== false,
                updatedAt: serverTimestamp()
            };

            await updateDoc(docRef, updateData);
            console.log('✅ Challenge updated:', id);

            return {
                id,
                ...updateData
            };
        } catch (error) {
            console.error('Error updating challenge:', error);
            throw error;
        }
    },

    /**
     * Xóa thử thách
     */
    deleteChallenge: async (id) => {
        try {
            const docRef = doc(db, 'challenges', id);
            await deleteDoc(docRef);
            console.log('✅ Challenge deleted:', id);
        } catch (error) {
            console.error('Error deleting challenge:', error);
            throw error;
        }
    },

    /**
     * Bật/tắt trạng thái thử thách
     */
    toggleChallengeStatus: async (id, isActive) => {
        try {
            const docRef = doc(db, 'challenges', id);
            await updateDoc(docRef, {
                isActive,
                updatedAt: serverTimestamp()
            });
            console.log('✅ Challenge status updated:', id, isActive);
        } catch (error) {
            console.error('Error toggling challenge status:', error);
            throw error;
        }
    }
};
