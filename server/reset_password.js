const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://vivekrawat7723_db_user:n5oT4E938Z8TuNgO@cluster0.x2pwv6f.mongodb.net/mini-social-app?appName=Cluster0';

const resetPassword = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'sarah@example.com' });
        if (!user) {
            console.log('User not found!');
        } else {
            console.log('User found:', user.email);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('password123', salt);
            await user.save();
            console.log('Password reset successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
