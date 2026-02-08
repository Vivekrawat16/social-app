const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPost, getPosts, likePost, commentPost, upload, votePoll } = require('../controllers/postController');

router.post('/', auth, upload, createPost);
router.get('/', auth, getPosts);
router.patch('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentPost);
router.put('/:id/vote', auth, votePoll);

module.exports = router;
