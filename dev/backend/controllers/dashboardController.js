const { User, Sacco, Member, Deposit, Withdrawal, Loan, Transaction } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Helper function to get date filter
function getDateFilter(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      return {};
  }

  return { createdAt: { [Op.gte]: startDate } };
}

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query; // 'all', 'today', 'week', 'month', 'year'
    
    const dateFilter = getDateFilter(period);

    // Total statistics
    const [
      totalMembers,
      totalChairpersons,
      totalSaccos,
      totalDeposits,
      totalWithdrawals,
      totalLoans,
      totalSavings
    ] = await Promise.all([
      Member.count({ where: dateFilter }),
      User.count({ where: { role: 'Chairperson', ...dateFilter } }),
      Sacco.count(),
      Deposit.sum('amount', { where: dateFilter }),
      Withdrawal.sum('amount', { where: dateFilter }),
      Loan.count({ where: dateFilter }),
      Member.sum('savingsBalance')
    ]);

    // Loan statistics
    const loanStats = await Promise.all([
      Loan.count({ where: { status: 'pending', ...dateFilter } }),
      Loan.count({ where: { status: 'approved', ...dateFilter } }),
      Loan.count({ where: { status: 'disbursed', ...dateFilter } }),
      Loan.count({ where: { status: 'repaid', ...dateFilter } }),
      Loan.count({ where: { status: 'rejected', ...dateFilter } })
    ]);

    // SACCO statistics
    const saccoStats = await Promise.all([
      Sacco.count({ where: { status: 'active' } }),
      Sacco.count({ where: { status: 'pending' } }),
      Sacco.count({ where: { status: 'suspended' } })
    ]);

    // Recent activities
    const recentActivities = await getRecentActivities();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalMembers,
          totalChairpersons,
          totalSaccos,
          totalDeposits: totalDeposits || 0,
          totalWithdrawals: totalWithdrawals || 0,
          totalLoans,
          totalSavings: totalSavings || 0
        },
        loans: {
          pending: loanStats[0],
          approved: loanStats[1],
          disbursed: loanStats[2],
          repaid: loanStats[3],
          rejected: loanStats[4]
        },
        saccos: {
          active: saccoStats[0],
          pending: saccoStats[1],
          suspended: saccoStats[2]
        },
        recentActivities
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get SACCO analytics
exports.getSaccoAnalytics = async (req, res) => {
  try {
    const { saccoId, period = 'month' } = req.query;
    const dateFilter = getDateFilter(period);

    if (!saccoId) {
      return res.status(400).json({
        success: false,
        message: 'SACCO ID is required'
      });
    }

    const sacco = await Sacco.findByPk(saccoId, {
      include: [{
        model: Member,
        as: 'members',
        include: [{ model: User, as: 'user' }]
      }]
    });

    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    // SACCO-specific statistics
    const whereClause = {
      saccoId,
      ...dateFilter
    };

    const [deposits, withdrawals, totalSavings, memberCount] = await Promise.all([
      Deposit.sum('amount', { where: dateFilter, include: [{ model: Member, as: 'member', where: { saccoId } }] }),
      Withdrawal.sum('amount', { where: dateFilter, include: [{ model: Member, as: 'member', where: { saccoId } }] }),
      Member.sum('savingsBalance', { where: { saccoId } }),
      Member.count({ where: { saccoId } })
    ]);

    // Transaction history
    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Member activity
    const topSavers = await Member.findAll({
      where: { saccoId },
      order: [['savingsBalance', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'user' }]
    });

    res.status(200).json({
      success: true,
      data: {
        sacco,
        statistics: {
          deposits: deposits || 0,
          withdrawals: withdrawals || 0,
          totalSavings: totalSavings || 0,
          memberCount
        },
        transactions,
        topSavers
      }
    });
  } catch (error) {
    logger.error('Error fetching SACCO analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SACCO analytics',
      error: error.message
    });
  }
};

// Get financial summary
exports.getFinancialSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const dateFilter = getDateFilter(period);

    const [deposits, withdrawals, loans, repaid] = await Promise.all([
      Deposit.sum('amount', { where: dateFilter }),
      Withdrawal.sum('amount', { where: dateFilter }),
      Loan.sum('amount', { where: dateFilter }),
      Loan.sum('repaidAmount', { where: dateFilter })
    ]);

    const outstandingLoans = (loans || 0) - (repaid || 0);

    res.status(200).json({
      success: true,
      data: {
        inflows: deposits || 0,
        outflows: withdrawals || 0,
        totalLoans: loans || 0,
        repaidLoans: repaid || 0,
        outstandingLoans,
        netPosition: (deposits || 0) - (withdrawals || 0)
      }
    });
  } catch (error) {
    logger.error('Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message
    });
  }
};

// Get recent activities
async function getRecentActivities() {
  try {
    const activities = [];
    
    // Recent deposits
    const recentDeposits = await Deposit.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user' }]
      }]
    });

    // Recent loans
    const recentLoans = await Loan.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user' }]
      }]
    });

    // Recent SACCO approvals
    const recentSaccos = await Sacco.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      include: [{ model: User, as: 'chairperson' }]
    });

    // Format activities
    recentDeposits.forEach(deposit => {
      activities.push({
        type: 'deposit',
        message: `${deposit.member.user.name} made a deposit of ${deposit.amount}`,
        timestamp: deposit.createdAt
      });
    });

    recentLoans.forEach(loan => {
      activities.push({
        type: 'loan',
        message: `${loan.member.user.name} ${loan.status} a loan of ${loan.amount}`,
        timestamp: loan.createdAt
      });
    });

    recentSaccos.forEach(sacco => {
      activities.push({
        type: 'sacco',
        message: `${sacco.name} status changed to ${sacco.status}`,
        timestamp: sacco.updatedAt
      });
    });

    // Sort by timestamp and limit to 20
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  } catch (error) {
    logger.error('Error getting recent activities:', error);
    return [];
  }
}

module.exports = exports;

