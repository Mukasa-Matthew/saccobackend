const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require SuperAdmin authentication
router.use(authenticate);
router.use(authorize('SuperAdmin'));

// Register SACCO with Chairperson
router.post('/register-sacco', validate(validationSchemas.registerSaccoWithChairperson), adminController.registerSaccoWithChairperson);

// Get all SACCOs with details
router.get('/saccos', adminController.getAllSaccosWithDetails);

// Reset chairperson password
router.post('/reset-password/:userId', adminController.resetChairpersonPassword);

module.exports = router;

