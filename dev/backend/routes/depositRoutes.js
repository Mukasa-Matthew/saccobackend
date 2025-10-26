const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { authenticate } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Create deposit
router.post('/', validate(validationSchemas.createDeposit), depositController.createDeposit);

// Get all deposits
router.get('/', depositController.getAllDeposits);

// Get single deposit
router.get('/:id', depositController.getDeposit);

module.exports = router;

