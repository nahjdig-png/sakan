const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const usersController = require('../controllers/usersController');

router.use(authenticate);
router.use(apiLimiter);

// Get all users for current customer
router.get('/', asyncHandler(usersController.getAll));

// Create new user
router.post('/', authorize('admin', 'manager'), asyncHandler(usersController.create));

// Update user
router.put('/:id', authorize('admin', 'manager'), asyncHandler(usersController.update));

// Delete user
router.delete('/:id', authorize('admin', 'manager'), asyncHandler(usersController.delete));

module.exports = router;
