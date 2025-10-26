const { Sacco, User, Member } = require('../models');
const logger = require('../utils/logger');

// Create a new SACCO
exports.createSacco = async (req, res) => {
  try {
    const { name, registrationNumber, location, chairpersonId } = req.body;

    // Check if registration number already exists
    const existingSacco = await Sacco.findOne({ where: { registrationNumber } });
    if (existingSacco) {
      return res.status(409).json({
        success: false,
        message: 'SACCO with this registration number already exists'
      });
    }

    const sacco = await Sacco.create({
      name,
      registrationNumber,
      location,
      chairpersonId: chairpersonId || req.userId,
      status: 'pending'
    });

    logger.info(`New SACCO created: ${sacco.name}`);

    res.status(201).json({
      success: true,
      message: 'SACCO created successfully',
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating SACCO',
      error: error.message
    });
  }
};

// Update SACCO
exports.updateSacco = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, registrationNumber, location, status } = req.body;

    const sacco = await Sacco.findByPk(id);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    if (registrationNumber && registrationNumber !== sacco.registrationNumber) {
      const existingSacco = await Sacco.findOne({ where: { registrationNumber } });
      if (existingSacco) {
        return res.status(409).json({
          success: false,
          message: 'Registration number already in use'
        });
      }
    }

    if (name) sacco.name = name;
    if (registrationNumber) sacco.registrationNumber = registrationNumber;
    if (location) sacco.location = location;
    if (status) sacco.status = status;

    await sacco.save();

    logger.info(`SACCO updated: ${sacco.id}`);

    res.status(200).json({
      success: true,
      message: 'SACCO updated successfully',
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating SACCO',
      error: error.message
    });
  }
};

// Get all SACCOs
exports.getAllSaccos = async (req, res) => {
  try {
    const saccos = await Sacco.findAll({
      include: [
        {
          model: User,
          as: 'chairperson',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { saccos }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SACCOs',
      error: error.message
    });
  }
};

// Get single SACCO
exports.getSacco = async (req, res) => {
  try {
    const { id } = req.params;

    const sacco = await Sacco.findByPk(id, {
      include: [
        {
          model: User,
          as: 'chairperson',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Member,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SACCO',
      error: error.message
    });
  }
};

// Approve SACCO (SuperAdmin only)
exports.approveSacco = async (req, res) => {
  try {
    const { id } = req.params;

    const sacco = await Sacco.findByPk(id);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    sacco.status = 'active';
    await sacco.save();

    logger.info(`SACCO approved: ${sacco.id}`);

    res.status(200).json({
      success: true,
      message: 'SACCO approved successfully',
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error approving SACCO',
      error: error.message
    });
  }
};

// Suspend SACCO
exports.suspendSacco = async (req, res) => {
  try {
    const { id } = req.params;

    const sacco = await Sacco.findByPk(id);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    sacco.status = 'suspended';
    await sacco.save();

    logger.info(`SACCO suspended: ${sacco.id}`);

    res.status(200).json({
      success: true,
      message: 'SACCO suspended successfully',
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error suspending SACCO',
      error: error.message
    });
  }
};

// Delete SACCO (SuperAdmin only)
exports.deleteSacco = async (req, res) => {
  try {
    const { id } = req.params;

    const sacco = await Sacco.findByPk(id);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    // Check if SACCO has members
    const memberCount = await Member.count({ where: { saccoId: id } });
    if (memberCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete SACCO with existing members. Please remove all members first.'
      });
    }

    await sacco.destroy();

    logger.info(`SACCO deleted: ${sacco.id}`);

    res.status(200).json({
      success: true,
      message: 'SACCO deleted successfully'
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting SACCO',
      error: error.message
    });
  }
};

// Reactivate SACCO
exports.reactivateSacco = async (req, res) => {
  try {
    const { id } = req.params;

    const sacco = await Sacco.findByPk(id);
    if (!sacco) {
      return res.status(404).json({
        success: false,
        message: 'SACCO not found'
      });
    }

    sacco.status = 'active';
    await sacco.save();

    logger.info(`SACCO reactivated: ${sacco.id}`);

    res.status(200).json({
      success: true,
      message: 'SACCO reactivated successfully',
      data: { sacco }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating SACCO',
      error: error.message
    });
  }
};
