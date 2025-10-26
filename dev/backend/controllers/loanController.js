const { Loan, Member, User, Transaction, Sacco } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Apply for loan
exports.applyLoan = async (req, res) => {
  try {
    const { memberId, amount, interestRate, repaymentSchedule } = req.body;

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const loan = await Loan.create({
      memberId,
      amount,
      interestRate,
      repaymentSchedule,
      status: 'pending',
      repaidAmount: 0
    });

    logger.info(`Loan application created: ${loan.id}`);

    const loanWithDetails = await Loan.findByPk(loan.id, {
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: { loan: loanWithDetails }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating loan application',
      error: error.message
    });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const { memberId, status, saccoId } = req.query;
    const whereClause = {};

    if (memberId) whereClause.memberId = memberId;
    if (status) whereClause.status = status;

    let includeOptions = [{
      model: Member,
      as: 'member',
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    }];

    if (saccoId) {
      includeOptions[0].where = { saccoId };
    }

    const loans = await Loan.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['applicationDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { loans }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans',
      error: error.message
    });
  }
};

// Get single loan
exports.getLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByPk(id, {
      include: [{
        model: Member,
        as: 'member',
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Sacco, as: 'sacco', attributes: ['name'] }
        ]
      }]
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { loan }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan',
      error: error.message
    });
  }
};

// Approve or reject loan
exports.approveLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvalDate, disbursementDate } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const loan = await Loan.findByPk(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Loan has already been processed'
      });
    }

    loan.status = status;
    loan.approvalDate = approvalDate || new Date();
    
    if (status === 'approved' && disbursementDate) {
      loan.disbursementDate = disbursementDate;
    }

    await loan.save();

    logger.info(`Loan ${status}: ${loan.id}`);

    const loanWithDetails = await Loan.findByPk(loan.id, {
      include: [{
        model: Member,
        as: 'member',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      }]
    });

    res.status(200).json({
      success: true,
      message: `Loan ${status} successfully`,
      data: { loan: loanWithDetails }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error processing loan',
      error: error.message
    });
  }
};

// Process loan repayment
exports.repayLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const loan = await Loan.findByPk(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Loan must be disbursed before repayment'
      });
    }

    const repaymentAmount = parseFloat(amount);
    const totalAmount = parseFloat(loan.amount);
    const repaidAmount = parseFloat(loan.repaidAmount) + repaymentAmount;

    loan.repaidAmount = repaidAmount;

    if (repaidAmount >= totalAmount) {
      loan.status = 'repaid';
    }

    await loan.save();

    // Create transaction record
    const member = await Member.findByPk(loan.memberId);
    await Transaction.create({
      type: 'loan_repayment',
      amount: repaymentAmount,
      memberId: member.id,
      saccoId: member.saccoId,
      description: 'Loan repayment',
      referenceId: loan.id
    });

    logger.info(`Loan repayment processed: ${loan.id}`);

    res.status(200).json({
      success: true,
      message: 'Loan repayment processed successfully',
      data: { loan }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error processing loan repayment',
      error: error.message
    });
  }
};

