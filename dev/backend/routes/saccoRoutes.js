const express = require('express');
const router = express.Router();
const saccoController = require('../controllers/saccoController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Create SACCO
router.post('/', validate(validationSchemas.createSacco), saccoController.createSacco);

// Get all SACCOs
router.get('/', saccoController.getAllSaccos);

// Get single SACCO
router.get('/:id', saccoController.getSacco);

// Update SACCO
router.put('/:id', validate(validationSchemas.updateSacco), saccoController.updateSacco);

// Approve SACCO (SuperAdmin only)
router.patch('/:id/approve', authorize('SuperAdmin'), saccoController.approveSacco);

// Suspend SACCO (SuperAdmin only)
router.patch('/:id/suspend', authorize('SuperAdmin'), saccoController.suspendSacco);

// Reactivate SACCO (SuperAdmin only)
router.patch('/:id/reactivate', authorize('SuperAdmin'), saccoController.reactivateSacco);

// Delete SACCO (SuperAdmin only)
router.delete('/:id', authorize('SuperAdmin'), saccoController.deleteSacco);

module.exports = router;

