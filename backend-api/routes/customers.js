const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const customersController = require('../controllers/customersController');

router.use(authenticate);
router.use(apiLimiter);

// Get all customers (admin only)
router.get('/', authorize('admin'), asyncHandler(customersController.getAll));

// Get customer statistics (admin only)
router.get('/stats', authorize('admin'), asyncHandler(customersController.getStats));

// Get single customer
router.get('/:id', authorize('admin'), asyncHandler(customersController.getById));

// Update customer
router.put('/:id', authorize('admin'), asyncHandler(customersController.update));

// Delete customer
router.delete('/:id', authorize('admin'), asyncHandler(customersController.delete));

module.exports = router;
