const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.upload = upload.single('image');

exports.createPost = async (req, res) => {
    try {
        const { text, pollOptions } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Parse pollOptions if it's a string (which happens with FormData)
        let parsedPollOptions = [];
        if (pollOptions) {
            try {
                parsedPollOptions = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions;
            } catch (e) {
                console.error('Error parsing pollOptions', e);
            }
        }

        if (!text && !imageUrl && (!parsedPollOptions || parsedPollOptions.length === 0)) {
            return res.status(400).json({ message: 'Post must contain text, image, or a poll' });
        }

        const newPost = new Post({
            userId: req.user.userId,
            username: req.user.name,
            text,
            imageUrl,
            pollOptions: parsedPollOptions ? parsedPollOptions.map(opt => ({ text: opt, votes: [] })) : []
        });

        // Fetch user to ensure we have the latest name
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);
        newPost.username = user.name;

        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.votePoll = async (req, res) => {
    try {
        const { optionId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Find the option
        const option = post.pollOptions.id(optionId);
        if (!option) return res.status(404).json({ message: 'Option not found' });

        const userId = req.user.userId;

        // Check if user already voted in this poll
        // If so, remove their vote from the old option
        post.pollOptions.forEach(opt => {
            if (opt.votes.includes(userId)) {
                opt.votes.pull(userId);
            }
        });

        // Add vote to new option
        option.votes.push(userId);

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { userId, page = 1, limit = 10, filter = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (userId) {
            query.userId = userId;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { text: searchRegex },
                { username: searchRegex }
            ];
        }

        let posts;

        if (filter === 'for_you' && !userId) {
            // For You: Posts from followed users
            const User = require('../models/User');
            const currentUser = await User.findById(req.user.userId);
            if (currentUser && currentUser.following.length > 0) {
                query.userId = { $in: currentUser.following };
            } else {
                // If following no one, fallback to empty (or could fallback to all, but empty is more accurate for "Following" feed)
                // Let's fallback to all posts for now if user follows no one, or just return empty? 
                // Typically "For You" with no following might show popular posts. 
                // Let's stick to strict following for now.
                query.userId = { $in: [] };
            }
            posts = await Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);
        } else if (filter === 'most_liked') {
            // Most Liked: Sort by likes count
            posts = await Post.aggregate([
                { $match: query }, // Apply userId filter if present
                {
                    $addFields: {
                        likesCount: { $size: { $ifNull: ["$likes", []] } }
                    }
                },
                { $sort: { likesCount: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: limitNum }
            ]);
            // Aggregation returns plain objects, not Mongoose documents. Pushing strictly needed fields or re-hydrating?
            // Frontend expects specific fields. The aggregation preserves all fields + likesCount.
            // However, verify if virtuals or methods are needed. Currently Post model has simple fields.
        } else if (filter === 'most_commented') {
            // Most Commented: Sort by comments count
            posts = await Post.aggregate([
                { $match: query },
                {
                    $addFields: {
                        commentsCount: { $size: { $ifNull: ["$comments", []] } }
                    }
                },
                { $sort: { commentsCount: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: limitNum }
            ]);
        } else {
            // Default: All Posts (chronological)
            posts = await Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);
        }

        // If aggregation was used, we might need to populate references if any (like user details if they were refs, but they are embedded mostly or just IDs). 
        // Our schema stores username and userId directly.
        // However, if we need to hydrate to Mongoose Documents for helpers:
        // const hydratedPosts = posts.map(post => Post.hydrate(post));

        // For now, returning the raw objects should be fine as long as the frontend doesn't rely on mongoose-specific methods.

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user.userId)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.userId);
        } else {
            post.likes.push(req.user.userId);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const User = require('../models/User');
        const user = await User.findById(req.user.userId);

        const newComment = {
            userId: req.user.userId,
            username: user.name,
            text
        };

        post.comments.push(newComment);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if the user owns the post
        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete the image file if it exists
        if (post.imageUrl) {
            const imagePath = path.join(__dirname, '..', post.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
