const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    logger.info(`Attempting to send test email to: ${email}`);

    const result = await emailService.sendCredentials(
      email,
      'Test User',
      'TestPassword123!',
      'Chairperson',
      'Test SACCO'
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          email,
          messageId: result.messageId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error,
        note: 'Check SMTP configuration in .env file'
      });
    }
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Test all features endpoint
router.get('/test-features', async (req, res) => {
  try {
    const { User, Sacco, Member, Deposit, Withdrawal, Loan, Transaction } = require('../models');
    
    const checks = {
      database: false,
      models: false,
      email_service: false,
      audit_service: false
    };

    // Test database connection
    try {
      await require('../config/database').authenticate();
      checks.database = true;
      logger.info('✓ Database connected');
    } catch (err) {
      logger.error('✗ Database connection failed');
    }

    // Test models
    try {
      const userCount = await User.count();
      checks.models = true;
      logger.info(`✓ Models working (${userCount} users found)`);
    } catch (err) {
      logger.error('✗ Models not working');
    }

    // Test email service
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        checks.email_service = true;
        logger.info('✓ Email service configured');
      } else {
        logger.info('⚠ Email not configured (optional)');
      }
    } catch (err) {
      logger.error('✗ Email service issue');
    }

    // Test audit service
    try {
      if (require('../services/auditService')) {
        checks.audit_service = true;
        logger.info('✓ Audit service available');
      }
    } catch (err) {
      logger.error('✗ Audit service issue');
    }

    res.status(200).json({
      success: true,
      message: 'Feature check complete',
      data: {
        features: checks,
        summary: {
          working: Object.values(checks).filter(v => v).length,
          total: Object.keys(checks).length,
          allWorking: Object.values(checks).every(v => v)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error checking features:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking features',
      error: error.message
    });
  }
});

module.exports = router;

