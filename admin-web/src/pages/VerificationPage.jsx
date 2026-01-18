// src/pages/VerificationPage.jsx
import { useState, useEffect } from 'react';
import { FaSync, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';
import { VerificationService } from '../services/verificationService';
import { UserService } from '../services/userService';

export default function VerificationPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm } = useSearch();
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const data = await VerificationService.getAllRequests();
            console.log("📋 [VerificationPage] Received requests:", data);
            console.log("📋 [VerificationPage] First request userData:", data[0]?.userData);
            setRequests(data);
        } catch (error) {
            console.error("Error in VerificationPage:", error);
            alert("Lỗi tải dữ liệu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (req) => {
        if (!window.confirm(`Xác nhận duyệt yêu cầu của User: ${req.uid.slice(0, 6)}... ?`)) return;

        try {
            await VerificationService.approveRequest(req);

            // Cập nhật status trong state thay vì xóa
            setRequests(prev => prev.map(item =>
                item.id === req.id
                    ? { ...item, status: "APPROVED", reviewedAt: new Date() }
                    : item
            ));

            alert(`✅ Đã duyệt và cộng ${req.points} điểm cho user!`);
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    const handleReject = async (req) => {
        if (!window.confirm("Xác nhận từ chối yêu cầu này?")) return;

        try {
            await VerificationService.rejectRequest(req);

            // Cập nhật status trong state thay vì xóa
            setRequests(prev => prev.map(item =>
                item.id === req.id
                    ? { ...item, status: "REJECTED", reviewedAt: new Date() }
                    : item
            ));

            alert("✅ Đã từ chối yêu cầu");
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    // Formatter ngày tháng
    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredRequests = requests.filter(req => {
        const term = searchTerm.toLowerCase();
        return (
            req.id.toLowerCase().includes(term) ||
            req.uid.toLowerCase().includes(term) ||
            (req.title && req.title.toLowerCase().includes(term))
        );
    });

    // Helper function để hiển thị status badge
    const getStatusBadge = (status) => {
        if (status === "APPROVED") {
            return (
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>
                    ✅ Đã duyệt
                </span>
            );
        } else if (status === "REJECTED") {
            return (
                <span style={{ background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>
                    ❌ Từ chối
                </span>
            );
        }
        return (
            <span style={{ background: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>
                ⏳ Chờ duyệt
            </span>
        );
    };

    // --- Modal xem ảnh phóng to ---
    const ImageModal = ({ url, onClose }) => {
        if (!url) return null;

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    cursor: 'zoom-out'
                }}
                onClick={onClose}
            >
                {/* Image container */}
                <div
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking on image
                >
                    <img
                        src={url}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            cursor: 'default'
                        }}
                    />
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
            {selectedImage && <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Duyệt Ảnh Tái Chế</h2>
                <button onClick={fetchPendingRequests} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: '#333', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                    <FaSync /> Làm mới
                </button>
            </div>

            {/* Thông báo tìm kiếm */}
            {searchTerm && (
                <div style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666' }}>
                    🔍 Kết quả tìm kiếm cho: "<b>{searchTerm}</b>" ({filteredRequests.length} kết quả)
                </div>
            )}

            {/* Bảng dữ liệu */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                        <tr style={{ textAlign: 'left', color: '#666', fontSize: '14px' }}>
                            <th style={{ padding: '16px' }}>Ảnh Minh Chứng</th>
                            <th style={{ padding: '16px' }}>Tiêu đề / Mô tả</th>
                            <th style={{ padding: '16px' }}>Người dùng</th>
                            <th style={{ padding: '16px' }}>Điểm thưởng</th>
                            <th style={{ padding: '16px' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                    {searchTerm ? "Không tìm thấy yêu cầu phù hợp." : "Tuyệt vời! Đã duyệt hết tất cả yêu cầu."}
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map(req => {
                                const isPending = req.status === "PENDING";
                                const rowStyle = {
                                    borderBottom: '1px solid #eee',
                                    opacity: isPending ? 1 : 0.5,
                                    background: isPending ? 'white' : '#f9f9f9'
                                };

                                return (
                                    <tr key={req.id} style={rowStyle}>

                                        {/* Cột 1: Ảnh */}
                                        <td style={{ padding: '16px' }}>
                                            <div
                                                onClick={() => setSelectedImage(req.imageUrl)}
                                                style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#eee', cursor: 'pointer' }}
                                            >
                                                {req.imageUrl ? (
                                                    <img
                                                        src={req.imageUrl}
                                                        alt="Proof"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                        <FaExclamationCircle />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
                                                {formatDate(req.createdAt)}
                                            </div>
                                        </td>

                                        {/* Cột 2: Tiêu đề + Status */}
                                        <td style={{ padding: '16px', verticalAlign: 'top', maxWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>{req.title || "Tái chế rác thải"}</p>
                                                {getStatusBadge(req.status)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>ID: {req.id.substring(0, 8)}...</div>
                                        </td>

                                        {/* Cột 3: User */}
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#e0e0e0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {req.userData?.avatar && req.userData.avatar !== "https://via.placeholder.com/150" ? (
                                                        <img
                                                            src={req.userData.avatar}
                                                            alt="Avatar"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const initials = req.userData?.name?.slice(0, 2).toUpperCase() || req.uid.slice(0, 2).toUpperCase();
                                                                e.target.parentElement.innerHTML = `<div style="font-size: 14px; font-weight: bold; color: #555;">${initials}</div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                                                            {req.userData?.name ? req.userData.name.slice(0, 2).toUpperCase() : req.uid.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* User Info */}
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                                                        {req.userData?.name || req.userData?.email?.split('@')[0] || req.userData?.studentId || `User ${req.uid.slice(0, 6)}`}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {req.userData?.email || req.userData?.studentId || `UID: ${req.uid.slice(0, 8)}...`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cột 4: Points */}
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
                                                +{req.points} điểm
                                            </span>
                                        </td>

                                        {/* Cột 5: Actions */}
                                        <td style={{ padding: '16px' }}>
                                            {isPending ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleReject(req)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid #ffcdd2',
                                                            color: '#c62828',
                                                            background: '#ffebee',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                                                        }}
                                                    >
                                                        <FaTimes /> Từ chối
                                                    </button>

                                                    <button
                                                        onClick={() => handleApprove(req)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid #c8e6c9',
                                                            color: '#2e7d32',
                                                            background: '#e8f5e9',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                                                        }}
                                                    >
                                                        <FaCheck /> Duyệt
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                                    Đã xử lý
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
