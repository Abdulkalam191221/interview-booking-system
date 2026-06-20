const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public access routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected access route (Requires valid JWT token)
router.get('/profile', protect, getUserProfile);

module.exports = router;