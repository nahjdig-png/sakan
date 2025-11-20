const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkSubscription } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const buildingsController = require('../controllers/buildingsController');

// All routes require authentication and active subscription
router.use(authenticate);
router.use(checkSubscription);
router.use(apiLimiter);

// Get all buildings for current customer
router.get('/', asyncHandler(buildingsController.getAll));

// Get single building
router.get('/:id', asyncHandler(buildingsController.getById));

// Create new building
router.post('/', asyncHandler(buildingsController.create));

// Update building
router.put('/:id', asyncHandler(buildingsController.update));

// Delete building
router.delete('/:id', asyncHandler(buildingsController.delete));

// Get building statistics
router.get('/:id/stats', asyncHandler(buildingsController.getStats));

module.exports = router;
