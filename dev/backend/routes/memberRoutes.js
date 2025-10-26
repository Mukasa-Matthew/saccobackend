const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Add member to SACCO
router.post('/', validate(validationSchemas.addMember), memberController.addMember);

// Get all members
router.get('/', memberController.getAllMembers);

// Get single member
router.get('/:id', memberController.getMember);

// Update member details
router.put('/:id', memberController.updateMember);

module.exports = router;

