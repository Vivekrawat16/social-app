const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyFeed = async () => {
    try {
        // 1. Login
        console.log('Attempting login with sarah@example.com...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'sarah@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login successful! Token received.');

        // 2. Fetch Posts (Default Filter)
        console.log('Fetching posts (filter=all)...');
        const postsRes = await axios.get(`${API_URL}/posts?page=1&filter=all`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Posts found: ${postsRes.data.length}`);
        if (postsRes.data.length > 0) {
            console.log('First post:', postsRes.data[0]);
        } else {
            console.log('No posts returned from API.');
        }

    } catch (err) {
        if (err.response) {
            console.error('API Error:', err.response.status, err.response.data);
        } else {
            console.error('Network/Script Error:', err.message);
        }
    }
};

verifyFeed();
