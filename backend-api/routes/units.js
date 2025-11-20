const express = require('express');
const router = express.Router();
const { authenticate, checkSubscription } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const unitsController = require('../controllers/unitsController');

router.use(authenticate);
router.use(checkSubscription);
router.use(apiLimiter);

// Get all units (with optional building filter)
router.get('/', asyncHandler(unitsController.getAll));

// Get single unit
router.get('/:id', asyncHandler(unitsController.getById));

// Create new unit
router.post('/', asyncHandler(unitsController.create));

// Update unit
router.put('/:id', asyncHandler(unitsController.update));

// Delete unit
router.delete('/:id', asyncHandler(unitsController.delete));

// Get unit tenants history
router.get('/:id/tenants', asyncHandler(unitsController.getTenantsHistory));

module.exports = router;
