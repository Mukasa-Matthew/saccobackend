const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'transfer'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Members',
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
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Transaction;

