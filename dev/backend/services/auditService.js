const { AuditLog, User, sequelize } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const auditService = {
  // Log an action
  log: async (userId, action, entityType, entityId = null, details = {}, ipAddress = null, userAgent = null) => {
    try {
      await AuditLog.create({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent
      });
      logger.debug(`Audit log: ${action} on ${entityType} by user ${userId}`);
    } catch (error) {
      logger.error('Error logging audit:', error);
    }
  },

  // Get audit logs
  getLogs: async (filters = {}) => {
    try {
      const { userId, entityType, action, startDate, endDate, limit = 100 } = filters;
      
      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (entityType) whereClause.entityType = entityType;
      if (action) whereClause.action = action;
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const logs = await AuditLog.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit
      });

      return logs;
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  }
};

module.exports = auditService;

