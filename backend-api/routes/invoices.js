const express = require('express');
const router = express.Router();
const { authenticate, checkSubscription } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const invoicesController = require('../controllers/invoicesController');

router.use(authenticate);
router.use(checkSubscription);
router.use(apiLimiter);

// Get all invoices (with filters)
router.get('/', asyncHandler(invoicesController.getAll));

// Get single invoice
router.get('/:id', asyncHandler(invoicesController.getById));

// Create new invoice
router.post('/', asyncHandler(invoicesController.create));

// Update invoice
router.put('/:id', asyncHandler(invoicesController.update));

// Delete invoice
router.delete('/:id', asyncHandler(invoicesController.delete));

// Mark invoice as paid
router.patch('/:id/pay', asyncHandler(invoicesController.markAsPaid));

module.exports = router;
