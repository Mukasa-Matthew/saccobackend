const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get single transaction
router.get('/:id', transactionController.getTransaction);

module.exports = router;

