const { Withdrawal, Member, User, Transaction, Sacco } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Create withdrawal
exports.createWithdrawal = async (req, res) => {
  try {
    const { memberId, amount, date, description } = req.body;

    const member = await Member.findByPk(memberId, {
      include: [{ model: Sacco, as: 'sacco' }]
    });
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check authorization: Only chairperson of the SACCO can process withdrawals
    const currentUser = await User.findByPk(req.userId);
    
    // SuperAdmin can always process withdrawals
    // Chairperson can only process withdrawals for their own SACCO
    if (currentUser.role === 'Chairperson') {
      if (member.sacco.chairpersonId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the SACCO chairperson can process withdrawals for their SACCO'
        });
      }
    } else if (currentUser.role === 'Member') {
      return res.status(403).json({
        success: false,
        message: 'Only chairpersons or SuperAdmins can process withdrawals'
      });
    }

    // Check if member has sufficient balance
    const currentBalance = parseFloat(member.savingsBalance);
    const withdrawalAmount = parseFloat(amount);

    if (currentBalance < withdrawalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient savings balance'
      });
    }

    const withdrawal = await Withdrawal.create({
      memberId,
      amount,
      date: date || new Date(),
      description
    });

    // Update member's savings balance
    member.savingsBalance = currentBalance - withdrawalAmount;
    await member.save();

    // Create transaction record
    await Transaction.create({
      type: 'withdrawal',
      amount,
      memberId,
      saccoId: member.saccoId,
      description: description || 'Withdrawal',
      referenceId: withdrawal.id
    });

    logger.info(`Withdrawal created: ${withdrawal.id}`);

    const withdrawalWithDetails = await Withdrawal.findByPk(withdrawal.id, {
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal created successfully',
      data: { withdrawal: withdrawalWithDetails }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating withdrawal',
      error: error.message
    });
  }
};

// Get all withdrawals
exports.getAllWithdrawals = async (req, res) => {
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

    const withdrawals = await Withdrawal.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { withdrawals }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawals',
      error: error.message
    });
  }
};

// Get single withdrawal
exports.getWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await Withdrawal.findByPk(id, {
      include: [{
        model: Member,
        as: 'member',
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Sacco, as: 'sacco', attributes: ['name'] }
        ]
      }]
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { withdrawal }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal',
      error: error.message
    });
  }
};

