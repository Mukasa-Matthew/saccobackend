const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Create withdrawal (Chairperson or SuperAdmin only)
router.post('/', authorize('Chairperson', 'SuperAdmin'), validate(validationSchemas.createWithdrawal), withdrawalController.createWithdrawal);

// Get all withdrawals
router.get('/', withdrawalController.getAllWithdrawals);

// Get single withdrawal
router.get('/:id', withdrawalController.getWithdrawal);

module.exports = router;

