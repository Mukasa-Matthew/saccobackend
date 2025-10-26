const { Deposit, Member, User, Transaction, Sacco } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Create deposit
exports.createDeposit = async (req, res) => {
  try {
    const { memberId, amount, date, description } = req.body;

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const deposit = await Deposit.create({
      memberId,
      amount,
      date: date || new Date(),
      description
    });

    // Update member's savings balance
    member.savingsBalance = parseFloat(member.savingsBalance) + parseFloat(amount);
    await member.save();

    // Create transaction record
    await Transaction.create({
      type: 'deposit',
      amount,
      memberId,
      saccoId: member.saccoId,
      description: description || 'Deposit',
      referenceId: deposit.id
    });

    logger.info(`Deposit created: ${deposit.id}`);

    const depositWithDetails = await Deposit.findByPk(deposit.id, {
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Deposit created successfully',
      data: { deposit: depositWithDetails }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating deposit',
      error: error.message
    });
  }
};

// Get all deposits
exports.getAllDeposits = async (req, res) => {
  try {
    const { memberId, saccoId, startDate, endDate } = req.query;
    const whereClause = {};

    if (memberId) whereClause.memberId = memberId;

    let dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);
    if (Object.keys(dateFilter).length > 0) whereClause.date = dateFilter;

    let includeOptions = [{
      model: Member,
      as: 'member',
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    }];

    if (saccoId) {
      includeOptions[0].where = { saccoId };
    }

    const deposits = await Deposit.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { deposits }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deposits',
      error: error.message
    });
  }
};

// Get single deposit
exports.getDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    const deposit = await Deposit.findByPk(id, {
      include: [{
        model: Member,
        as: 'member',
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Sacco, as: 'sacco', attributes: ['name'] }
        ]
      }]
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { deposit }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deposit',
      error: error.message
    });
  }
};

