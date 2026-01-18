// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { SearchProvider } from '../context/SearchContext';

const AdminLayout = () => {
    return (
        <SearchProvider>
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

                {/* Sidebar cố định */}
                <Sidebar />

                {/* Cột bên phải */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

                    {/* Header cố định */}
                    <Header />

                    {/* Nội dung cuộn được */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#f8f9fa', padding: '20px' }}>
                        <Outlet />
                    </div>

                </div>
            </div>
        </SearchProvider>
    );
};

export default AdminLayout;
