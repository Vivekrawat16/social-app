import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const { user, login } = useAuth(); // Assuming login function can also be used to update local user state or we need a specific update function
    const navigate = useNavigate();

    // Local state for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const updateData = { name, email };
            if (password) updateData.password = password;

            const res = await api.put('/auth/update', updateData);

            // Just update the local user info if possible, or force re-login behavior?
            // For now, let's assume we might need to refresh the page or context
            // But ideally AuthContext should expose a way to update user data

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                navigate('/profile');
                window.location.reload(); // Simple way to refresh auth context for now
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="text-center mb-4">
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-sm)' }}>Edit Profile</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Update your personal information</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)',
                        textAlign: 'center',
                        border: '1px solid var(--color-danger)'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-success)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)',
                        textAlign: 'center',
                        border: '1px solid var(--color-success)'
                    }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            className="form-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">New Password (leave blank to keep current)</label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => navigate('/profile')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
