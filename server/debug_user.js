const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://vivekrawat7723_db_user:n5oT4E938Z8TuNgO@cluster0.x2pwv6f.mongodb.net/mini-social-app?appName=Cluster0';

const debugUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'sarah@example.com' });
        if (!user) {
            console.log('User not found!');
        } else {
            console.log('User found:', user.email);
            console.log('Stored Hash:', user.password);

            const isMatch = await bcrypt.compare('password123', user.password);
            console.log('MATCH RESULT:', isMatch);
        }

        setTimeout(() => process.exit(0), 1000);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugUser();
