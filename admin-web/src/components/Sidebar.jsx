// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaRecycle, FaComments, FaSignOutAlt, FaLeaf, FaNewspaper } from 'react-icons/fa';
import { logoutAdmin } from '../services/auth';

const Sidebar = () => {
    const location = useLocation();

    const handleLogout = async () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            await logoutAdmin();
        }
    };

    const getLinkStyle = (path) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

        return {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: isActive ? '700' : '500',
            color: isActive ? '#4CAF50' : '#161823', // Xanh lá
            backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
            borderRight: isActive ? '4px solid #4CAF50' : '4px solid transparent',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '0 8px 8px 0',
            marginRight: '10px'
        };
    };

    return (
        <aside style={{
            width: '260px',
            background: '#ffffff',
            height: '100vh',
            borderRight: '1px solid #e3e3e4',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            paddingTop: '20px',
            overflowY: 'hidden' // Ngăn scroll sidebar
        }}>
            {/* --- LOGO --- */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0 24px 30px 24px',
                fontSize: '22px', fontWeight: '800'
            }}>
                <FaLeaf size={26} color="#4CAF50" />
                <span>FTU Xanh <span style={{ color: '#4CAF50' }}>Admin</span></span>
            </div>

            {/* --- MENU --- */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Link to="/" style={getLinkStyle('/')}>
                    <FaRecycle size={18} />
                    <span>Duyệt Ảnh Tái Chế</span>
                </Link>

                <Link to="/feedback" style={getLinkStyle('/feedback')}>
                    <FaComments size={18} />
                    <span>Góp Ý Phản Hồi</span>
                </Link>

                <Link to="/posts" style={getLinkStyle('/posts')}>
                    <FaNewspaper size={18} />
                    <span>Quản Lý Bài Viết</span>
                </Link>
            </nav>

            {/* --- LOGOUT BUTTON --- */}
            <div style={{ padding: '20px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        width: '100%', padding: '12px',
                        background: '#f1f1f2', color: '#161823',
                        border: 'none', borderRadius: '8px',
                        fontWeight: '600', cursor: 'pointer', transition: '0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e4e4e6'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f1f1f2'}
                >
                    <FaSignOutAlt /> Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
