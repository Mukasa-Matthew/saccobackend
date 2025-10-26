const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, validationSchemas } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Apply for loan
router.post('/', validate(validationSchemas.applyLoan), loanController.applyLoan);

// Get all loans
router.get('/', loanController.getAllLoans);

// Get single loan
router.get('/:id', loanController.getLoan);

// Approve/reject loan (Chairperson, SuperAdmin only)
router.patch('/:id/approve', authorize('Chairperson', 'SuperAdmin'), validate(validationSchemas.approveLoan), loanController.approveLoan);

// Process loan repayment
router.post('/:id/repay', loanController.repayLoan);

module.exports = router;

