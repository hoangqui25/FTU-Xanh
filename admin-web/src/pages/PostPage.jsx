// src/pages/PostPage.jsx
import React, { useState, useEffect } from 'react';
import { PostService } from '../services/postService';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaNewspaper, FaImage, FaTimesCircle } from 'react-icons/fa';

const POST_CATEGORIES = {
    NEWS: "Tin tức",
    EVENT: "Sự kiện",
    ANNOUNCEMENT: "Thông báo",
    TIP: "Mẹo xanh"
};

const POST_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED"
};

const PostPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: POST_CATEGORIES.NEWS,
        status: POST_STATUS.DRAFT
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await PostService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            alert("Lỗi khi tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                content: post.content,
                category: post.category,
                status: post.status
            });
            // Set image preview if post has images
            if (post.images && post.images.length > 0) {
                setImagePreview(post.images[0]);
            }
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                content: '',
                category: POST_CATEGORIES.NEWS,
                status: POST_STATUS.DRAFT
            });
            setSelectedImage(null);
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPost(null);
        setFormData({
            title: '',
            content: '',
            category: POST_CATEGORIES.NEWS,
            status: POST_STATUS.DRAFT
        });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert("Vui lòng điền đầy đủ tiêu đề và nội dung");
            return;
        }

        try {
            setUploading(true);

            // Get current user info from localStorage
            const userName = localStorage.getItem('userName') || 'Admin';
            const userId = localStorage.getItem('userId') || 'admin';

            let imageUrl = imagePreview;

            // Upload new image if selected
            if (selectedImage) {
                imageUrl = await uploadImageToCloudinary(selectedImage);
            }

            const postData = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                status: formData.status,
                authorId: userId,
                authorName: userName,
                images: imageUrl ? [imageUrl] : []
            };

            if (editingPost) {
                await PostService.updatePost(editingPost.id, postData);
                alert("Cập nhật bài viết thành công!");
            } else {
                await PostService.createPost(postData);
                alert("Tạo bài viết thành công!");
            }

            handleCloseModal();
            fetchPosts();
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Lỗi khi lưu bài viết: " + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            return;
        }

        try {
            await PostService.deletePost(postId);
            alert("Xóa bài viết thành công!");
            fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Lỗi khi xóa bài viết");
        }
    };

    const handleStatusChange = async (postId, newStatus) => {
        try {
            await PostService.updatePostStatus(postId, newStatus);
            fetchPosts();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Lỗi khi cập nhật trạng thái");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: { bg: '#FFA500', color: '#fff' },
            PUBLISHED: { bg: '#4CAF50', color: '#fff' },
            ARCHIVED: { bg: '#999', color: '#fff' }
        };

        const labels = {
            DRAFT: 'Nháp',
            PUBLISHED: 'Đã xuất bản',
            ARCHIVED: 'Lưu trữ'
        };

        const style = styles[status] || styles.DRAFT;

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#161823',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FaNewspaper color="#4CAF50" />
                        Quản Lý Bài Viết
                    </h1>
                    <p style={{ color: '#666', marginTop: '8px' }}>
                        Tổng số: {posts.length} bài viết
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: '0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#45a049'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#4CAF50'}
                >
                    <FaPlus /> Tạo Bài Viết Mới
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Đang tải...
                </div>
            ) : posts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    color: '#666'
                }}>
                    <FaNewspaper size={48} color="#ccc" />
                    <p style={{ marginTop: '16px', fontSize: '16px' }}>
                        Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                    </p>
                </div>
            ) : (
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                                <th style={tableHeaderStyle}>Tiêu đề</th>
                                <th style={tableHeaderStyle}>Danh mục</th>
                                <th style={tableHeaderStyle}>Tác giả</th>
                                <th style={tableHeaderStyle}>Trạng thái</th>
                                <th style={tableHeaderStyle}>Ngày tạo</th>
                                <th style={tableHeaderStyle}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} style={{
                                    borderBottom: '1px solid #f0f0f0',
                                    transition: '0.2s'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fafafa'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '600', color: '#161823' }}>
                                            {post.title}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#666',
                                            marginTop: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                        }}>
                                            {post.content}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>{post.category}</td>
                                    <td style={tableCellStyle}>{post.authorName || 'Admin'}</td>
                                    <td style={tableCellStyle}>
                                        <select
                                            value={post.status}
                                            onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontSize: '13px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value={POST_STATUS.DRAFT}>Nháp</option>
                                            <option value={POST_STATUS.PUBLISHED}>Đã xuất bản</option>
                                            <option value={POST_STATUS.ARCHIVED}>Lưu trữ</option>
                                        </select>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            {formatDate(post.createdAt)}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleOpenModal(post)}
                                                style={actionButtonStyle('#4CAF50')}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                style={actionButtonStyle('#f44336')}
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        background: '#fff',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Nhập tiêu đề bài viết"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Nội dung *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    style={{
                                        ...inputStyle,
                                        minHeight: '200px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Nhập nội dung bài viết"
                                    required
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Hình ảnh</label>
                                {imagePreview ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '300px',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(244, 67, 54, 0.9)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <FaTimesCircle size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '40px',
                                        border: '2px dashed #ddd',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#4CAF50'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    >
                                        <FaImage size={48} color="#ccc" />
                                        <p style={{ marginTop: '12px', color: '#666' }}>Click để chọn ảnh</p>
                                        <p style={{ fontSize: '12px', color: '#999' }}>Tối đa 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={inputStyle}
                                    >
                                        {Object.entries(POST_CATEGORIES).map(([key, value]) => (
                                            <option key={key} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value={POST_STATUS.DRAFT}>Nháp</option>
                                        <option value={POST_STATUS.PUBLISHED}>Đã xuất bản</option>
                                        <option value={POST_STATUS.ARCHIVED}>Lưu trữ</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                paddingTop: '20px',
                                borderTop: '1px solid #e0e0e0'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        padding: '10px 24px',
                                        background: '#f1f1f2',
                                        color: '#161823',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        padding: '10px 24px',
                                        background: uploading ? '#ccc' : '#4CAF50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {uploading ? 'Đang lưu...' : (editingPost ? 'Cập Nhật' : 'Tạo Bài Viết')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const tableHeaderStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#161823',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tableCellStyle = {
    padding: '16px',
    fontSize: '14px',
    color: '#161823'
};

const actionButtonStyle = (color) => ({
    padding: '8px 12px',
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#161823'
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: '0.2s'
};

export default PostPage;
