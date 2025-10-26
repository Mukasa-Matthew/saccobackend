const { User, Sacco, Subscription, Member } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// Generate random password
const generatePassword = () => {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4);
};

// Register SACCO with Chairperson (SuperAdmin only)
exports.registerSaccoWithChairperson = async (req, res) => {
  try {
    const { saccoDetails, chairpersonDetails } = req.body;

    // Validate input
    if (!saccoDetails || !chairpersonDetails) {
      return res.status(400).json({
        success: false,
        message: 'SACCO details and Chairperson details are required'
      });
    }

    const { name, registrationNumber, location } = saccoDetails;
    const { name: chairpersonName, email } = chairpersonDetails;

    if (!name || !registrationNumber || !location || !chairpersonName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if registration number already exists
    const existingSacco = await Sacco.findOne({ where: { registrationNumber } });
    if (existingSacco) {
      return res.status(409).json({
        success: false,
        message: 'SACCO with this registration number already exists'
      });
    }

    // Generate password for chairperson
    const password = generatePassword();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create chairperson user
    const chairperson = await User.create({
      name: chairpersonName,
      email,
      password: hashedPassword,
      role: 'Chairperson'
    });

    logger.info(`Chairperson created: ${chairperson.email}`);

    // Create SACCO
    const sacco = await Sacco.create({
      name,
      registrationNumber,
      location,
      status: 'pending', // Start as pending, SuperAdmin will approve
      chairpersonId: chairperson.id
    });

    logger.info(`SACCO created: ${sacco.name}`);

    // Create subscription for chairperson
    const subscription = await Subscription.create({
      userId: chairperson.id,
      saccoId: sacco.id,
      plan: 'premium', // Default to premium plan
      status: 'active',
      features: {
        memberManagement: true,
        loanProcessing: true,
        reports: true,
        analytics: true
      }
    });

    logger.info(`Subscription created for chairperson: ${chairperson.id}`);

    // Send credentials email to chairperson
    const emailResult = await emailService.sendCredentials(
      email,
      chairpersonName,
      password,
      'Chairperson',
      sacco.name
    );

    if (emailResult.success) {
      logger.info(`Credentials email sent successfully to ${email}`);
    } else {
      logger.error(`Failed to send credentials email to ${email}: ${emailResult.error}`);
    }

    // Prepare response data
    const responseData = {
      sacco: {
        id: sacco.id,
        name: sacco.name,
        registrationNumber: sacco.registrationNumber,
        location: sacco.location,
        status: sacco.status
      },
      chairperson: {
        id: chairperson.id,
        name: chairperson.name,
        email: chairperson.email,
        role: chairperson.role,
        // Include plain password in response for SuperAdmin reference
        password: password,
        credentialsSent: emailResult.success
      },
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status
      },
      emailStatus: {
        sent: emailResult.success,
        message: emailResult.success 
          ? 'Credentials sent successfully to chairperson' 
          : 'Failed to send email, but account created'
      }
    };

    res.status(201).json({
      success: true,
      message: 'SACCO registered successfully with chairperson',
      data: responseData
    });
  } catch (error) {
    logger.error('Error registering SACCO:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering SACCO',
      error: error.message
    });
  }
};

// Get all SACCOs with details (SuperAdmin only)
exports.getAllSaccosWithDetails = async (req, res) => {
  try {
    const saccos = await Sacco.findAll({
      include: [
        {
          model: User,
          as: 'chairperson',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Subscription,
          as: 'subscriptions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Member,
          as: 'members',
          attributes: ['id'],
          limit: 1
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add member count
    const saccosWithCounts = await Promise.all(
      saccos.map(async (sacco) => {
        const memberCount = await Member.count({ where: { saccoId: sacco.id } });
        return {
          ...sacco.toJSON(),
          memberCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { saccos: saccosWithCounts }
    });
  } catch (error) {
    logger.error('Error fetching SACCOs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SACCOs',
      error: error.message
    });
  }
};

// Reset chairperson password and send new credentials
exports.resetChairpersonPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'Chairperson') {
      return res.status(400).json({
        success: false,
        message: 'User is not a chairperson'
      });
    }

    // Generate new password
    const newPassword = generatePassword();
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send new credentials
    const emailResult = await emailService.sendCredentials(
      user.email,
      user.name,
      newPassword,
      user.role,
      'Your SACCO'
    );

    logger.info(`Password reset for chairperson: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: user.email,
        newPassword: newPassword,
        credentialsSent: emailResult.success
      }
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

