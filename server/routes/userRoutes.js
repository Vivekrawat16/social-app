const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUserProfile, followUser, unfollowUser } = require('../controllers/userController');

console.log('User routes loaded');

router.get('/test', (req, res) => res.send('User route working'));
router.get('/:id', (req, res, next) => {
    console.log('Route matched /:id with:', req.params.id);
    getUserProfile(req, res, next);
});
router.put('/:id/follow', auth, followUser);
router.put('/:id/unfollow', auth, unfollowUser);

module.exports = router;
