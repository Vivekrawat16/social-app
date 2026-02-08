require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

const users = [
    {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        bio: 'Photographer & Traveler 📸 | capturing moments.',
        password: 'password123'
    },
    {
        name: 'David Chen',
        email: 'david@example.com',
        bio: 'Tech Enthusiast 💻 | Full Stack Developer',
        password: 'password123'
    },
    {
        name: 'Maria Rodriguez',
        email: 'maria@example.com',
        bio: 'Foodie 🍕 | Love trying new recipes!',
        password: 'password123'
    },
    {
        name: 'James Wilson',
        email: 'james@example.com',
        bio: 'Fitness Junkie 🏋️‍♂️ | Health is Wealth',
        password: 'password123'
    },
    {
        name: 'Emily Davis',
        email: 'emily@example.com',
        bio: 'Bookworm 📚 | Aspiring Writer',
        password: 'password123'
    }
];

const postTemplates = [
    { text: "Just captured this amazing sunset! 🌅", image: true },
    { text: "Working on a new React project. It's challenging but fun! 💻 #coding #webdev", image: false },
    { text: "Anyone have recommendations for a good Italian restaurant in the city? 🍝", image: false },
    { text: "Morning workout done! Feeling energized. 💪", image: true },
    { text: "Just finished reading 'The Midnight Library'. Highly recommend! 📖", image: false },
    { text: "Can't believe it's already February! Time flies. ⏳", image: false },
    { text: "Coffee time! ☕️ What's your go-to order?", image: true },
    { text: "Explored a new hiking trail today. Nature is healing. 🌲", image: true },
    { text: "Trying out a new recipe tonight. Wish me luck! 🍳", image: false },
    { text: "Tech tip: Always backup your data! 💾", image: false }
];

const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MONGO_URI is missing in .env');
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Hash generic password
        // Hash generic password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const createdUsers = [];

        // Clear existing data to ensure clean state
        console.log('Clearing old data...');
        await User.deleteMany({});
        await Post.deleteMany({});

        // Create/Upsert Users
        for (const u of users) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({
                    ...u,
                    password: hashedPassword,
                    profilePicUrl: '', // Let frontend generate initials or use UI avatars if needed
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                });
                console.log(`Created user: ${user.name}`);
            } else {
                console.log(`User already exists: ${user.name}`);
            }
            createdUsers.push(user);
        }

        // Create Posts
        console.log('Seeding posts...');
        for (let i = 0; i < 25; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];

            const postData = {
                userId: randomUser._id,
                username: randomUser.name,
                text: template.text,
                likes: [],
                comments: [],
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Last 7 days
            };

            // Add random image from picsum
            // Add random image from picsum
            if (template.image) {
                // Use random seed to get different images
                postData.imageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`;
            }

            // Add random likes
            const numLikes = Math.floor(Math.random() * 5);
            for (let j = 0; j < numLikes; j++) {
                const liker = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                if (!postData.likes.includes(liker._id)) {
                    postData.likes.push(liker._id);
                }
            }

            // Add random comments
            if (Math.random() > 0.7) {
                const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                postData.comments.push({
                    userId: commenter._id,
                    username: commenter.name,
                    text: "Great post!",
                    createdAt: new Date()
                });
            }

            await Post.create(postData);
        }

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
