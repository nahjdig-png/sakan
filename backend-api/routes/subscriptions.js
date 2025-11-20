const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const subscriptionsController = require('../controllers/subscriptionsController');

router.use(authenticate);
router.use(apiLimiter);

// Get all subscriptions (admin only)
router.get('/all', authorize('admin'), asyncHandler(subscriptionsController.getAll));

// Get current customer's subscriptions
router.get('/my', asyncHandler(subscriptionsController.getMySubscriptions));

// Get subscription plans
router.get('/plans', asyncHandler(subscriptionsController.getPlans));

// Create new subscription (admin only)
router.post('/', authorize('admin'), asyncHandler(subscriptionsController.create));

// Renew subscription
router.post('/:id/renew', asyncHandler(subscriptionsController.renew));

// Cancel subscription
router.patch('/:id/cancel', asyncHandler(subscriptionsController.cancel));

module.exports = router;
