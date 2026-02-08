const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { signup, login, getMe, updateProfile, uploadProfile } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/update', auth, uploadProfile, updateProfile);

module.exports = router;
