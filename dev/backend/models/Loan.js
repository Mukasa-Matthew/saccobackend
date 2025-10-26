const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Members',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaid'),
    allowNull: false,
    defaultValue: 'pending'
  },
  repaymentSchedule: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  applicationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  disbursementDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  repaidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  timestamps: true
});

module.exports = Loan;

