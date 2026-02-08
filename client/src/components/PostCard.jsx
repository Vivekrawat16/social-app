import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState(post.comments);
    const [commentText, setCommentText] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const isOwner = post.userId === user?.userId || post.userId === user?._id;

    const isLiked = likes.some(id => id === user?.userId || id === user?._id);

    const handleLike = async () => {
        try {
            if (isLiked) {
                setLikes(likes.filter(id => id !== user?.userId && id !== user?._id));
            } else {
                setLikes([...likes, user?.userId || user?._id]);
            }
            await api.patch(`/posts/${post._id}/like`);
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText) return;

        try {
            const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
            setComments(res.data.comments);
            setCommentText('');
        } catch (err) {
            console.error('Error commenting:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${post._id}`);
            setIsDeleted(true);
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post');
        }
    };

    if (isDeleted) return null;

    return (
        <div className="card mb-4 animate-fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', borderBottom: '1px solid var(--glass-border)' }}>
                {/* Avatar with Link */}
                <Link to={`/user/${post.userId}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: post.user?.profilePicUrl
                            ? `url(${post.user.profilePicUrl.startsWith('http') ? post.user.profilePicUrl : post.user.profilePicUrl}) center/cover no-repeat`
                            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {(!post.user?.profilePicUrl && post.username) && post.username[0].toUpperCase()}
                    </div>
                </Link>

                {/* Username with Link */}
                <div>
                    <Link to={`/user/${post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '2px', color: 'var(--color-text-primary)' }}>{post.username}</h3>
                    </Link>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                </div>

                {/* Delete Button - Only for post owner */}
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Delete post"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                )}
            </div>

            <div style={{ padding: 'var(--spacing-lg) var(--spacing-md) var(--spacing-sm)' }}>
                <p style={{ color: 'var(--color-text-primary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: post.imageUrl || (post.pollOptions && post.pollOptions.length > 0) ? 'var(--spacing-md)' : 0 }}>
                    {post.text}
                </p>

                {/* Poll Rendering */}
                {post.pollOptions && post.pollOptions.length > 0 && (
                    <div className="poll-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                        {post.pollOptions.map((option) => {
                            const totalVotes = post.pollOptions.reduce((acc, opt) => acc + (opt.votes ? opt.votes.length : 0), 0);
                            const voteCount = option.votes ? option.votes.length : 0;
                            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                            const hasVoted = post.pollOptions.some(opt => opt.votes && opt.votes.includes(user?.userId || user?._id));
                            const isSelected = option.votes && option.votes.includes(user?.userId || user?._id);

                            const handleVote = async () => {
                                try {
                                    // Optimistic Update
                                    // ... existing logic ...
                                    await api.put(`/posts/${post._id}/vote`, { optionId: option._id });
                                    window.location.reload();
                                } catch (err) {
                                    console.error('Error voting:', err);
                                }
                            };

                            return (
                                <div
                                    key={option._id}
                                    onClick={handleVote}
                                    style={{
                                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white'
                                    }}
                                >
                                    {/* Progress Bar Background */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${percentage}%`,
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        transition: 'width 0.3s ease'
                                    }}></div>

                                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
                                        <span style={{ fontWeight: isSelected ? '600' : '400' }}>{option.text}</span>
                                        {hasVoted && (
                                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                                {percentage}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                            {post.pollOptions.reduce((acc, opt) => acc + (opt.votes ? opt.votes.length : 0), 0)} votes
                        </div>
                    </div>
                )}
            </div>

            {post.imageUrl && (
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={post.imageUrl.startsWith('http') ? post.imageUrl : post.imageUrl}
                        alt="Post content"
                        style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                    />
                </div>
            )}

            <div style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--spacing-md)' }}>
                    <button
                        onClick={handleLike}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: isLiked ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                            fontWeight: 600,
                            transition: 'transfrom 0.1s'
                        }}
                        className="hover-scale"
                    >
                        <span style={{ fontSize: '1.2rem' }}>{isLiked ? '❤️' : '🤍'}</span>
                        {likes.length} Likes
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 600
                        }}
                        className="hover-scale"
                    >
                        <span style={{ fontSize: '1.2rem' }}>💬</span>
                        {comments.length} Comments
                    </button>
                </div>

                {expanded && (
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', animation: 'fadeIn 0.2s' }}>
                        <form onSubmit={handleComment} style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ borderRadius: 'var(--radius-full)', paddingLeft: '1.2rem' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 1.5rem' }}>Post</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {comments.map((comment, index) => (
                                <div key={index} style={{
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                            {comment.username}
                                        </span>
                                    </div>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .hover-scale:hover { transform: scale(1.05); transition: transform 0.2s; }
            `}</style>
        </div>
    );
};

export default PostCard;
