const sequelize = require('../config/database');
const User = require('./User');
const Sacco = require('./Sacco');
const Member = require('./Member');
const Deposit = require('./Deposit');
const Withdrawal = require('./Withdrawal');
const Loan = require('./Loan');
const Transaction = require('./Transaction');
const Subscription = require('./Subscription');
const AuditLog = require('./AuditLog');

// Define associations
User.hasOne(Member, { foreignKey: 'userId', as: 'member' });
Member.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Sacco.hasMany(Member, { foreignKey: 'saccoId', as: 'members' });
Member.belongsTo(Sacco, { foreignKey: 'saccoId', as: 'sacco' });

User.hasMany(Sacco, { foreignKey: 'chairpersonId', as: 'saccos' });
Sacco.belongsTo(User, { foreignKey: 'chairpersonId', as: 'chairperson' });

Member.hasMany(Deposit, { foreignKey: 'memberId', as: 'deposits' });
Deposit.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Member.hasMany(Withdrawal, { foreignKey: 'memberId', as: 'withdrawals' });
Withdrawal.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Member.hasMany(Loan, { foreignKey: 'memberId', as: 'loans' });
Loan.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Sacco.hasMany(Transaction, { foreignKey: 'saccoId', as: 'transactions' });
Transaction.belongsTo(Sacco, { foreignKey: 'saccoId', as: 'sacco' });

Member.hasMany(Transaction, { foreignKey: 'memberId', as: 'memberTransactions' });
Transaction.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Subscription associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Sacco.hasMany(Subscription, { foreignKey: 'saccoId', as: 'subscriptions' });
Subscription.belongsTo(Sacco, { foreignKey: 'saccoId', as: 'sacco' });

// Audit log associations
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Sacco,
  Member,
  Deposit,
  Withdrawal,
  Loan,
  Transaction,
  Subscription,
  AuditLog
};

