const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes (with rate limiting)
router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/refresh-token', authLimiter, asyncHandler(authController.refreshToken));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.put('/update-profile', authenticate, asyncHandler(authController.updateProfile));
router.put('/change-password', authenticate, asyncHandler(authController.changePassword));

module.exports = router;
