const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics (SuperAdmin only)
router.get('/stats', authorize('SuperAdmin'), dashboardController.getDashboardStats);

// Get financial summary (SuperAdmin only)
router.get('/financial-summary', authorize('SuperAdmin'), dashboardController.getFinancialSummary);

// Get SACCO analytics (SuperAdmin or Chairperson)
router.get('/sacco-analytics', dashboardController.getSaccoAnalytics);

module.exports = router;

