import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { useParams, Link } from 'react-router-dom';

const Profile = () => {
    const { user: currentUser } = useAuth();
    const { id } = useParams(); // Get user ID from URL if present
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [isFollowing, setIsFollowing] = useState(false);

    // Determine which user ID to fetch: URL param or current logged-in user
    // CRITICAL FIX: Check for 'userId' as well, which is common in JWT payloads
    const targetUserId = id || currentUser?.userId || currentUser?._id || currentUser?.id;
    console.log('[Profile Debug] currentUser:', currentUser);
    console.log('[Profile Debug] targetUserId:', targetUserId);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUserId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Parallel Fetch: User Data + Posts
                const userPromise = api.get(`/users/${targetUserId}`);

                // Only fetch posts if active tab is posts
                const postsPromise = activeTab === 'posts'
                    ? api.get(`/posts?userId=${targetUserId}`)
                    : Promise.resolve({ data: [] });

                const [userRes, postsRes] = await Promise.all([userPromise, postsPromise]);

                // 1. Process User Data
                const userData = userRes.data;
                setProfileUser(userData);

                if (!userData) {
                    setLoading(false);
                    return;
                }

                // Check if I am following this user
                if (currentUser && userData.followers) {
                    const myId = currentUser.userId || currentUser._id || currentUser.id;
                    const isFollower = userData.followers.some(f => (f._id || f) === myId);
                    setIsFollowing(isFollower);
                }

                // 2. Process Posts
                setPosts(postsRes.data || []);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [targetUserId, currentUser, activeTab]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.put(`/users/${targetUserId}/unfollow`);
                setIsFollowing(false);
                setProfileUser(prev => ({
                    ...prev,
                    followers: prev.followers ? prev.followers.slice(0, -1) : []
                }));
            } else {
                await api.put(`/users/${targetUserId}/follow`);
                setIsFollowing(true);
                setProfileUser(prev => ({
                    ...prev,
                    followers: [...(prev.followers || []), currentUser.userId || currentUser._id]
                }));
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        }
    };

    if (loading) return <div className="container text-center mt-4">Loading profile...</div>;

    // Fallback if profileUser is still null after loading
    if (!profileUser) return <div className="container text-center mt-4">User not found.</div>;

    const myId = currentUser?.userId || currentUser?._id || currentUser?.id;
    const isOwnProfile = String(myId) === String(profileUser._id || profileUser.id);

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-lg)', maxWidth: '900px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                {isOwnProfile ? 'My Profile' : 'Profile'}
            </h1>

            {/* Profile Card */}
            <div className="card animate-fade-in profile-card" style={{ padding: 0, overflow: 'visible', marginBottom: 'var(--spacing-xl)' }}>
                {/* Cover Photo */}
                <div className="profile-cover" style={{
                    height: '200px',
                    backgroundColor: '#e5e7eb',
                    background: profileUser.coverPicUrl ? `url(${profileUser.coverPicUrl}) center/cover` : '#d1d5db',
                    position: 'relative',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                }}>
                    <button style={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>
                    {isOwnProfile && (
                        <button style={{
                            position: 'absolute',
                            right: '10px',
                            bottom: '10px',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Profile Info Section */}
                <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative' }}>

                    {/* Avatar - Overlapping */}
                    <div className="profile-avatar-container" style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '4px solid white',
                        background: 'white',
                        position: 'absolute',
                        top: '-60px',
                        left: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: profileUser.profilePicUrl
                                ? `url(http://localhost:5000${profileUser.profilePicUrl}) center/cover no-repeat`
                                : 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '3rem'
                        }}>
                            {!profileUser.profilePicUrl && profileUser.name && profileUser.name[0].toUpperCase()}
                        </div>
                        {isOwnProfile && (
                            <Link to="/profile/edit" style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: '#3b82f6',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Stats & Actions (Top Right) */}
                    <div className="profile-stats" style={{
                        marginLeft: '140px',
                        paddingTop: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.2rem 0', lineHeight: '1.2' }}>{profileUser.name}</h2>
                            <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>@{profileUser.handle || ((profileUser.name || 'User').toLowerCase().replace(/\s/g, '') + '123')}</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
                                📅 Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Earned Points</p>
                            <p style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{profileUser.points || 50}</p>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0.2rem' }}>Total Promotions</p>
                            <p style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>0</p>

                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Followers/Following Counts */}
                    <div className="profile-follow-stats" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.1rem' }}>{profileUser.following?.length || 0}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Following</span>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: '#e5e7eb', margin: '0 1.5rem' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.1rem' }}>{profileUser.followers?.length || 0}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Followers</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs" style={{
                    display: 'flex',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: '1.5rem',
                    padding: '0 1rem'
                }}>
                    {['My Posts', 'Promotions', 'Liked', 'Commented'].map((tab) => {
                        const tabKey = tab.toLowerCase().replace(' ', '');
                        const isActive = activeTab === (tabKey === 'myposts' ? 'posts' : tabKey);
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tabKey === 'myposts' ? 'posts' : tabKey)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                    color: isActive ? '#3b82f6' : '#6b7280',
                                    fontWeight: isActive ? '600' : '500',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab} ({tab === 'My Posts' ? posts.length : 0})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            {posts.length > 0 ? (
                <div>
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <p>No posts available.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
