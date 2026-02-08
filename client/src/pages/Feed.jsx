import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const filters = [
        { id: 'all', label: 'All Post' },
        { id: 'for_you', label: 'For You' },
        { id: 'most_liked', label: 'Most Liked' },
        { id: 'most_commented', label: 'Most Commented' }
    ];

    const fetchPosts = useCallback(async (pageNum, filterType, search) => {
        setLoading(true);
        try {
            let url = `/posts?page=${pageNum}&filter=${filterType}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            const res = await api.get(url);

            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                setPosts((prev) => {
                    // Start fresh if page 1
                    if (pageNum === 1) return res.data;

                    // Deduplicate for pagination
                    const newPosts = res.data.filter(p => !prev.some(existing => existing._id === p._id));
                    return [...prev, ...newPosts];
                });
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch posts when filter or search changes
    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1, activeFilter, searchQuery);
    }, [activeFilter, searchQuery, fetchPosts]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, activeFilter, searchQuery);
    };

    const handleFilterChange = (filterId) => {
        if (filterId === activeFilter) return;
        setActiveFilter(filterId);
        // Effect will trigger fetch
    };

    const handlePostCreated = () => {
        // If user creates a post, switch to 'all' or just refresh current? 
        // usually 'all' shows the new post. 
        if (activeFilter !== 'all') {
            setActiveFilter('all');
        } else {
            setPage(1);
            fetchPosts(1, 'all', searchQuery);
            setHasMore(true);
        }
    };

    return (
        <div className="container feed-container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)', maxWidth: '800px' }}>
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Filter Pills */}
            <div style={{
                display: 'flex',
                gap: '12px',
                margin: 'var(--spacing-xl) 0',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none' /* Firefox */
            }}>
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '24px',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            border: activeFilter === filter.id ? 'none' : '1px solid var(--color-border)',
                            background: activeFilter === filter.id ? 'var(--color-primary)' : 'white',
                            color: activeFilter === filter.id ? 'white' : 'var(--color-text-secondary)',
                            boxShadow: activeFilter === filter.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '0' }}>
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
            </div>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--spacing-lg) 0' }}>
                    <div className="loading-spinner" style={{
                        border: '4px solid var(--color-bg-tertiary)',
                        borderTop: '4px solid var(--color-primary)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {!loading && hasMore && posts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--spacing-lg) 0' }}>
                    <button className="btn btn-secondary" onClick={loadMore}>Load More</button>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center" style={{ color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)' }}>
                    <p>{activeFilter === 'for_you' ? "Follow users to see their posts here!" : "No posts found."}</p>
                </div>
            )}
        </div>
    );
};

export default Feed;
