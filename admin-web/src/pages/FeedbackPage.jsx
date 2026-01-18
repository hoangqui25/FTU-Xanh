// src/pages/FeedbackPage.jsx
import { useState, useEffect } from 'react';
import { FaSync, FaCheck, FaEye, FaExclamationCircle } from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';
import { FeedbackService } from '../services/feedbackService';

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTopic, setFilterTopic] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const { searchTerm } = useSearch();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const data = await FeedbackService.getAllFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
            alert("Lỗi tải dữ liệu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsReviewed = async (id) => {
        try {
            await FeedbackService.updateFeedbackStatus(id, 'reviewed');
            setFeedbacks(prev => prev.map(fb =>
                fb.id === id ? { ...fb, status: 'reviewed' } : fb
            ));
            alert("✅ Đã đánh dấu đã xem");
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    const handleMarkAsResolved = async (id) => {
        if (!window.confirm("Đánh dấu góp ý này là đã giải quyết?")) return;
        try {
            await FeedbackService.updateFeedbackStatus(id, 'resolved');
            setFeedbacks(prev => prev.map(fb =>
                fb.id === id ? { ...fb, status: 'resolved' } : fb
            ));
            alert("✅ Đã đánh dấu đã giải quyết");
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Filter feedbacks
    const filteredFeedbacks = feedbacks.filter(fb => {
        const matchTopic = filterTopic === 'all' || fb.topic === filterTopic;
        const matchStatus = filterStatus === 'all' || fb.status === filterStatus;
        const term = searchTerm?.toLowerCase() || '';
        const matchSearch = !term ||
            fb.content?.toLowerCase().includes(term) ||
            fb.userName?.toLowerCase().includes(term) ||
            fb.userEmail?.toLowerCase().includes(term);

        return matchTopic && matchStatus && matchSearch;
    });

    const getStatusBadge = (status) => {
        if (status === 'reviewed') {
            return (
                <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FaEye size={10} /> Đã xem
                </span>
            );
        } else if (status === 'resolved') {
            return (
                <span style={{ background: '#e8f5e9', color: '#388e3c', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FaCheck size={10} /> Đã giải quyết
                </span>
            );
        }
        return (
            <span style={{ background: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FaExclamationCircle size={10} /> Chờ xử lý
            </span>
        );
    };

    const getTopicConfig = (topic) => {
        const config = {
            'Vệ sinh': { icon: '🗑️', label: 'Vệ sinh' },
            'Cơ sở vật chất': { icon: '🏗️', label: 'Cơ sở vật chất' },
            'Ý tưởng Xanh': { icon: '💡', label: 'Ý tưởng Xanh' },
            'Khác': { icon: '💬', label: 'Khác' },
            // Legacy mapping (cho data cũ)
            'Facilities': { icon: '🏗️', label: 'Cơ sở vật chất' },
            'Idea': { icon: '💡', label: 'Ý tưởng Xanh' },
            'Other': { icon: '💬', label: 'Khác' },
            'VEISINH': { icon: '🗑️', label: 'Vệ sinh' }
        };
        return config[topic] || { icon: '💬', label: topic || 'Khác' };
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
                        📝 Quản lý Góp ý
                    </h2>
                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                        Xem và quản lý góp ý từ người dùng
                    </p>
                </div>
                <button
                    onClick={fetchFeedbacks}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'normal',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    <FaSync />
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Topic Filter */}
                <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}
                >
                    <option value="all">Tất cả chủ đề</option>
                    <option value="Vệ sinh">🗑️ Vệ sinh</option>
                    <option value="Cơ sở vật chất">🏗️ Cơ sở vật chất</option>
                    <option value="Ý tưởng Xanh">💡 Ý tưởng Xanh</option>
                    <option value="Khác">💬 Khác</option>
                </select>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="reviewed">👁️ Đã xem</option>
                    <option value="resolved">✅ Đã giải quyết</option>
                </select>

                <div style={{ marginLeft: 'auto', color: '#7f8c8d', fontSize: '14px' }}>
                    Hiển thị: <strong>{filteredFeedbacks.length}</strong> / {feedbacks.length} góp ý
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                        <tr style={{ textAlign: 'left', color: '#666', fontSize: '14px' }}>
                            <th style={{ padding: '16px' }}>Người gửi</th>
                            <th style={{ padding: '16px' }}>Chủ đề</th>
                            <th style={{ padding: '16px' }}>Nội dung góp ý</th>
                            <th style={{ padding: '16px' }}>Liên hệ</th>
                            <th style={{ padding: '16px' }}>Trạng thái</th>
                            <th style={{ padding: '16px' }}>Thời gian</th>
                            <th style={{ padding: '16px' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedbacks.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                    {searchTerm ? "Không tìm thấy kết quả." : "Chưa có góp ý nào."}
                                </td>
                            </tr>
                        ) : (
                            filteredFeedbacks.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee', opacity: item.status === 'resolved' ? 0.6 : 1 }}>
                                    {/* Người gửi */}
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.userName || "Ẩn danh"}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{item.userEmail}</div>
                                    </td>

                                    {/* Chủ đề */}
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '20px' }}>{getTopicConfig(item.topic).icon}</span>
                                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{getTopicConfig(item.topic).label}</span>
                                        </div>
                                    </td>

                                    {/* Nội dung */}
                                    <td style={{ padding: '16px', maxWidth: '300px', lineHeight: '1.5' }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#333',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {item.content}
                                        </div>
                                    </td>

                                    {/* Liên hệ */}
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            {item.contact || '-'}
                                        </div>
                                    </td>

                                    {/* Trạng thái */}
                                    <td style={{ padding: '16px' }}>
                                        {getStatusBadge(item.status)}
                                    </td>

                                    {/* Thời gian */}
                                    <td style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
                                        {formatDate(item.createdAt)}
                                    </td>

                                    {/* Hành động */}
                                    <td style={{ padding: '16px' }}>
                                        {item.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => handleMarkAsReviewed(item.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#3498db',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Đã xem
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAsResolved(item.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#27ae60',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Giải quyết
                                                </button>
                                            </div>
                                        )}
                                        {item.status === 'reviewed' && (
                                            <button
                                                onClick={() => handleMarkAsResolved(item.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Giải quyết
                                            </button>
                                        )}
                                        {item.status === 'resolved' && (
                                            <span style={{ fontSize: '12px', color: '#999' }}>Đã xử lý</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
