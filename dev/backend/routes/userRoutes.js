const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// Public routes
router.post('/register', validate(validationSchemas.register), userController.register);
router.post('/login', validate(validationSchemas.login), userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(validationSchemas.updateProfile), userController.updateProfile);

// Admin only
router.get('/all', authenticate, authorize('SuperAdmin'), userController.getAllUsers);

module.exports = router;

