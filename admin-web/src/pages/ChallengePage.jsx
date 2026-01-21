// admin-web/src/pages/ChallengePage.jsx
import { useState, useEffect } from 'react';
import { FaSync, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTrophy } from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';
import { ChallengeService } from '../services/challengeService';

export default function ChallengePage() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const { searchTerm } = useSearch();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'trophy',
        targetCount: 1,
        bonusPoints: 10,
        type: 'recycle_count',
        isActive: true
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const data = await ChallengeService.getAllChallenges();
            setChallenges(data);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            // Don't alert on initial load if no challenges exist
            if (error.message && !error.message.includes('index')) {
                alert('Lỗi tải dữ liệu: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (challenge = null) => {
        if (challenge) {
            setEditingChallenge(challenge);
            setFormData({
                title: challenge.title,
                description: challenge.description,
                icon: challenge.icon,
                targetCount: challenge.targetCount,
                bonusPoints: challenge.bonusPoints,
                type: challenge.type,
                isActive: challenge.isActive
            });
        } else {
            setEditingChallenge(null);
            setFormData({
                title: '',
                description: '',
                icon: 'trophy',
                targetCount: 1,
                bonusPoints: 10,
                type: 'recycle_count',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingChallenge(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Vui lòng nhập tiêu đề thử thách');
            return;
        }

        try {
            if (editingChallenge) {
                await ChallengeService.updateChallenge(editingChallenge.id, formData);
                alert('✅ Cập nhật thử thách thành công!');
            } else {
                await ChallengeService.createChallenge(formData);
                alert('✅ Tạo thử thách thành công!');
            }

            handleCloseModal();
            fetchChallenges();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa thử thách này?')) return;

        try {
            await ChallengeService.deleteChallenge(id);
            alert('✅ Đã xóa thử thách');
            fetchChallenges();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await ChallengeService.toggleChallengeStatus(id, !currentStatus);
            setChallenges(prev => prev.map(c =>
                c.id === id ? { ...c, isActive: !currentStatus } : c
            ));
            alert(`✅ Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} thử thách`);
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    // Filter challenges
    const filteredChallenges = challenges.filter(challenge => {
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && challenge.isActive) ||
            (filterStatus === 'inactive' && !challenge.isActive);

        const term = searchTerm?.toLowerCase() || '';
        const matchSearch = !term ||
            challenge.title?.toLowerCase().includes(term) ||
            challenge.description?.toLowerCase().includes(term);

        return matchStatus && matchSearch;
    });

    const iconOptions = [
        { value: 'trophy', label: '🏆 Trophy' },
        { value: 'leaf', label: '🍃 Leaf' },
        { value: 'camera', label: '📷 Camera' },
        { value: 'flame', label: '🔥 Flame' },
        { value: 'star', label: '⭐ Star' },
        { value: 'gift', label: '🎁 Gift' },
        { value: 'medal', label: '🏅 Medal' }
    ];

    const typeOptions = [
        { value: 'recycle_count', label: 'Số lần tái chế' },
        { value: 'recycle_category', label: 'Loại rác tái chế' },
        { value: 'streak', label: 'Chuỗi ngày' }
    ];

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
                🏆 Quản lý Thử thách
            </h2>
            <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '30px' }}>
                Tạo và quản lý các thử thách hàng ngày cho người dùng
            </p>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    + Thêm thử thách mới
                </button>
            </div>

            {filteredChallenges.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
                    <p style={{ fontSize: '18px', color: '#999' }}>Chưa có thử thách nào</p>
                    <p style={{ fontSize: '14px', color: '#ccc', marginTop: '10px' }}>
                        Click "Thêm thử thách mới" để tạo thử thách đầu tiên
                    </p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
                    {filteredChallenges.map(challenge => (
                        <div key={challenge.id} style={{
                            padding: '15px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>{challenge.title}</h3>
                                <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>{challenge.description}</p>
                                <span style={{ fontSize: '12px', color: '#999' }}>
                                    Mục tiêu: {challenge.targetCount} | Điểm: +{challenge.bonusPoints}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleOpenModal(challenge)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(challenge.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '500px'
                    }}>
                        <h3 style={{ marginBottom: '20px' }}>
                            {editingChallenge ? 'Chỉnh sửa thử thách' : 'Thêm thử thách mới'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                    Mô tả *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Mục tiêu
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.targetCount}
                                        onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
                                        min="1"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Điểm thưởng
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bonusPoints}
                                        onChange={(e) => setFormData({ ...formData, bonusPoints: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Kích hoạt ngay
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#95a5a6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        background: '#27ae60',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {editingChallenge ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
