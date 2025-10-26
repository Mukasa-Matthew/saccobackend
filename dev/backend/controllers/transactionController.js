const { Transaction, Member, Sacco, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { type, memberId, saccoId, startDate, endDate } = req.query;
    const whereClause = {};

    if (type) whereClause.type = type;
    if (memberId) whereClause.memberId = memberId;
    if (saccoId) whereClause.saccoId = saccoId;

    let dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);
    if (Object.keys(dateFilter).length > 0) whereClause.createdAt = dateFilter;

    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: Sacco,
          as: 'sacco',
          attributes: ['name', 'registrationNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: Sacco,
          as: 'sacco',
          attributes: ['name', 'registrationNumber']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

