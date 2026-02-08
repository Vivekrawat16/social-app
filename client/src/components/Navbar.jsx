import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '1rem',
            borderBottom: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <span style={{ fontSize: '1.8rem' }}>✨</span> SocialApp
                </Link>

                {/* Search Bar - Only show if user is logged in (optional, but makes sense) */}
                {user && (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const query = e.target.search.value;
                        if (query.trim()) {
                            navigate(`/?search=${encodeURIComponent(query)}`);
                        } else {
                            navigate('/');
                        }
                    }} style={{
                        flex: 1,
                        maxWidth: '500px',
                        margin: '0 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <input
                            name="search"
                            type="text"
                            placeholder="Search promotions, users, posts..."
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                paddingRight: '50px',
                                borderRadius: '30px',
                                border: '1px solid var(--color-border)',
                                background: '#f8f9fa',
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                        <button type="submit" style={{
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user ? (
                        <>
                            <Link to="/profile" style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                background: user.profilePicUrl ? `url(${user.profilePicUrl}) center/cover no-repeat` : '#ff9f1c', // Orange fallback
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                                className="profile-icon-hover"
                                title="Profile"
                            >
                                {!user.profilePicUrl && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </Link>

                            {/* Keep Logout accessible, maybe simpler icon or text */}
                            <button onClick={handleLogout} className="btn" style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: '#6366f1',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/login" className="btn btn-secondary">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                Signup
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
