import { useState } from 'react';
import api from '../services/api';
import EmojiPicker from 'emoji-picker-react';

const CreatePost = ({ onPostCreated }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isPollMode, setIsPollMode] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setIsPollMode(false); // Disable poll if adding image
        }
    };

    const onEmojiClick = (emojiObject) => {
        setText((prev) => prev + emojiObject.emoji);
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index) => {
        if (pollOptions.length > 2) {
            const newOptions = pollOptions.filter((_, i) => i !== index);
            setPollOptions(newOptions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!text && !image && !isPollMode) return;
        if (isPollMode && pollOptions.filter(o => o.trim()).length < 2) return;

        const formData = new FormData();
        formData.append('text', text);

        if (image) {
            formData.append('image', image);
        }

        if (isPollMode) {
            const validOptions = pollOptions.filter(o => o.trim());
            formData.append('pollOptions', JSON.stringify(validOptions));
        }

        try {
            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setText('');
            setImage(null);
            setPreview(null);
            setIsPollMode(false);
            setPollOptions(['', '']);
            setShowEmojiPicker(false);
            if (onPostCreated) onPostCreated();
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    return (
        <div className="card mb-4 animate-fade-in" style={{
            borderRadius: '16px',
            padding: '1.5rem',
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            position: 'relative',
            zIndex: 10
        }}>
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: 'var(--font-heading)'
                }}>Create Post</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <textarea
                        className="form-input"
                        rows="3"
                        placeholder={isPollMode ? "Ask a question..." : "What's on your mind?"}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{
                            resize: 'none',
                            minHeight: '80px',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            fontSize: '1.1rem',
                            padding: '0',
                            background: 'transparent'
                        }}
                    />
                </div>

                {/* Image Preview */}
                {preview && (
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                borderRadius: '12px',
                                objectFit: 'cover'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setImage(null);
                                setPreview(null);
                            }}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Poll Inputs */}
                {isPollMode && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
                        {pollOptions.map((option, index) => (
                            <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                    className="form-input"
                                    style={{ flex: 1 }}
                                />
                                {pollOptions.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removePollOption(index)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {pollOptions.length < 4 && (
                            <button
                                type="button"
                                onClick={addPollOption}
                                style={{
                                    color: '#3b82f6',
                                    background: 'none',
                                    border: 'none',
                                    fontWeight: '600',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + Add Option
                            </button>
                        )}
                    </div>
                )}

                <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '1rem' }}></div>

                <div className="create-post-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        {/* Image Upload Icon */}
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: isPollMode ? 0.5 : 1 }} title="Photo">
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleImageChange}
                                disabled={isPollMode}
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </label>

                        {/* Emoji Icon */}
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                title="Emoji"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                            </button>
                            {showEmojiPicker && (
                                <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 9999, marginTop: '10px' }}>
                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                        </div>

                        {/* Poll Icon */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsPollMode(!isPollMode);
                                if (!isPollMode) {
                                    setImage(null);
                                    setPreview(null);
                                }
                            }}
                            style={{
                                background: isPollMode ? '#e0f2fe' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                            }}
                            title="Poll"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
                                <line x1="12" y1="20" x2="12" y2="10"></line>
                                <line x1="18" y1="20" x2="18" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="16"></line>
                            </svg>
                        </button>


                    </div>

                    <button
                        type="submit"
                        className="create-post-submit"
                        disabled={(!text && !image && !isPollMode) || (isPollMode && pollOptions.filter(o => o.trim()).length < 2)}
                        style={{
                            background: ((!text && !image && !isPollMode) || (isPollMode && pollOptions.filter(o => o.trim()).length < 2)) ? '#d1d5db' : 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
