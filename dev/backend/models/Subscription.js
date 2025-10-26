const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  saccoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Saccos',
      key: 'id'
    }
  },
  plan: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    allowNull: false,
    defaultValue: 'basic'
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  timestamps: true
});

module.exports = Subscription;

