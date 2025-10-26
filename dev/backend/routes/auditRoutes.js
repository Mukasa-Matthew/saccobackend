const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require SuperAdmin authentication
router.use(authenticate);
router.use(authorize('SuperAdmin'));

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await auditService.getLogs(req.query);
    res.status(200).json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
});

module.exports = router;

