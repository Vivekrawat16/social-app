const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email, password);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found in login');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files (Duplicated from postController - slightly wet but fine for now)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + 'p' + path.extname(file.originalname)); // 'p' for profile
    }
});

const upload = multer({ storage: storage });

exports.uploadProfile = upload.single('profilePic');

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (req.file) {
            user.profilePicUrl = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.json({ id: user._id, name: user.name, email: user.email, profilePicUrl: user.profilePicUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
