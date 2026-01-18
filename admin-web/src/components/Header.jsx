// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { useSearch } from '../context/SearchContext';

import { UserService } from '../services/userService';

const Header = () => {
    const [adminInfo, setAdminInfo] = useState({ name: 'Admin', email: '', avatar: '' });
    const { searchTerm, setSearchTerm } = useSearch();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // 1. Lấy thông tin từ Auth (fallback)
                let info = {
                    name: user.displayName || "Admin",
                    email: user.email || "",
                    avatar: user.photoURL || ""
                };

                // 2. Lấy thông tin chi tiết từ Firestore
                const userProfile = await UserService.getUserById(user.uid);
                if (userProfile) {
                    info.name = userProfile.name || info.name;
                    info.avatar = userProfile.avatar || info.avatar;
                }

                // 3. Avatar fallback nếu vẫn trống
                if (!info.avatar || info.avatar === "https://via.placeholder.com/150") {
                    info.avatar = `https://ui-avatars.com/api/?name=${info.name}&background=4CAF50&color=fff`;
                }

                setAdminInfo(info);
            } else {
                // Reset nếu logout
                setAdminInfo({ name: 'Admin', email: '', avatar: '' });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <header style={{
            height: '70px', background: 'white', borderBottom: '1px solid #e3e3e4',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px',
            position: 'sticky', top: 0, zIndex: 100
        }}>
            {/* Thanh tìm kiếm */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f1f2', padding: '10px 15px', borderRadius: '99px', width: '300px' }}>
                <FaSearch color="#a6a6a6" />
                <input
                    placeholder="Tìm kiếm..."
                    style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', textTransform: 'capitalize' }}>{adminInfo.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{adminInfo.email}</div>
                </div>
                <img
                    src={adminInfo.avatar}
                    alt="Admin"
                    style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #eee', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${adminInfo.name}&background=4CAF50&color=fff`;
                    }}
                />
            </div>
        </header>
    );
};

export default Header;
