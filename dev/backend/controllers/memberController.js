const { Member, User, Sacco } = require('../models');
const logger = require('../utils/logger');

// Add member to SACCO
exports.addMember = async (req, res) => {
  try {
    const { userId, saccoId, shareBalance, savingsBalance } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if SACCO exists
    const sacco = await Sacco.findByPk(saccoId);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ where: { userId, saccoId } });
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this SACCO'
      });
    }

    const member = await Member.create({
      userId,
      saccoId,
      shareBalance: shareBalance || 0,
      savingsBalance: savingsBalance || 0
    });

    logger.info(`Member added to SACCO: ${member.id}`);

    const memberWithDetails = await Member.findByPk(member.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Sacco, as: 'sacco', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member: memberWithDetails }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error adding member',
      error: error.message
    });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const { saccoId } = req.query;

    let whereClause = {};
    if (saccoId) whereClause.saccoId = saccoId;

    const members = await Member.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Sacco, as: 'sacco', attributes: ['id', 'name', 'registrationNumber'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { members }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message
    });
  }
};

// Get single member
exports.getMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Sacco, as: 'sacco', attributes: ['id', 'name', 'registrationNumber'] }
      ]
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { member }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member',
      error: error.message
    });
  }
};

// Update member details
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareBalance, savingsBalance } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (shareBalance !== undefined) member.shareBalance = shareBalance;
    if (savingsBalance !== undefined) member.savingsBalance = savingsBalance;

    await member.save();

    logger.info(`Member updated: ${member.id}`);

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: { member }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    });
  }
};

