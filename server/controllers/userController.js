const User = require('../models/User');

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
    console.log('getUserProfile called with ID:', req.params.id);
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'name profilePicUrl')
            .populate('following', 'name profilePicUrl');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Follow a user
exports.followUser = async (req, res) => {
    if (req.user.userId === req.params.id) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.userId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!targetUser.followers.includes(req.user.userId)) {
            await targetUser.updateOne({ $push: { followers: req.user.userId } });
            await currentUser.updateOne({ $push: { following: req.params.id } });
            res.json({ message: 'User followed' });
        } else {
            res.status(400).json({ message: 'You already follow this user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    if (req.user.userId === req.params.id) {
        return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.userId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUser.followers.includes(req.user.userId)) {
            await targetUser.updateOne({ $pull: { followers: req.user.userId } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.json({ message: 'User unfollowed' });
        } else {
            res.status(400).json({ message: 'You do not follow this user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
