const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const saccoRoutes = require('./saccoRoutes');
const memberRoutes = require('./memberRoutes');
const depositRoutes = require('./depositRoutes');
const withdrawalRoutes = require('./withdrawalRoutes');
const loanRoutes = require('./loanRoutes');
const transactionRoutes = require('./transactionRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const auditRoutes = require('./auditRoutes');
const testRoutes = require('./testRoutes');

router.use('/users', userRoutes);
router.use('/saccos', saccoRoutes);
router.use('/members', memberRoutes);
router.use('/deposits', depositRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/loans', loanRoutes);
router.use('/transactions', transactionRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/test', testRoutes);

module.exports = router;

