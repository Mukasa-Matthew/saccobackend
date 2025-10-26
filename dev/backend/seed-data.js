/**
 * Sample seed data for testing the SACCO Management System
 * 
 * Usage:
 * node seed-data.js
 * 
 * Note: Make sure your .env file is configured and database exists
 */

require('dotenv').config();
const { sequelize, User, Sacco, Member, Deposit, Withdrawal, Loan } = require('./models');
const logger = require('./utils/logger');

const seedDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connected for seeding');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Deposit.destroy({ where: {} });
    await Withdrawal.destroy({ where: {} });
    await Loan.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await Sacco.destroy({ where: {} });
    await User.destroy({ where: {} });
    logger.info('Existing data cleared');

    // Create SuperAdmin
    const superAdmin = await User.create({
      name: 'Matthew Mukasa',
      email: 'matthewmukasa0@gmail.com',
      password: '1100211Matt.',
      role: 'SuperAdmin'
    });
    logger.info('SuperAdmin created');

    // Create Chairperson
    const chairperson = await User.create({
      name: 'John Chairperson',
      email: 'chairperson@example.com',
      password: 'Password123!',
      role: 'Chairperson'
    });
    logger.info('Chairperson created');

    // Create SACCO
    const sacco = await Sacco.create({
      name: 'Community Savings SACCO',
      registrationNumber: 'REG-2025-001',
      location: 'Nairobi, Kenya',
      status: 'active',
      chairpersonId: chairperson.id
    });
    logger.info('SACCO created');

    // Create Members
    const member1 = await User.create({
      name: 'Alice Member',
      email: 'alice@example.com',
      password: 'Password123!',
      role: 'Member'
    });

    const member2 = await User.create({
      name: 'Bob Member',
      email: 'bob@example.com',
      password: 'Password123!',
      role: 'Member'
    });

    const saccoMember1 = await Member.create({
      userId: member1.id,
      saccoId: sacco.id,
      shareBalance: 50000.00,
      savingsBalance: 25000.00
    });

    const saccoMember2 = await Member.create({
      userId: member2.id,
      saccoId: sacco.id,
      shareBalance: 75000.00,
      savingsBalance: 15000.00
    });
    logger.info('Members created');

    // Create Deposits
    await Deposit.create({
      memberId: saccoMember1.id,
      amount: 5000.00,
      date: new Date(),
      description: 'Monthly savings deposit'
    });

    await Deposit.create({
      memberId: saccoMember2.id,
      amount: 3000.00,
      date: new Date(),
      description: 'Monthly savings deposit'
    });
    logger.info('Deposits created');

    // Create Withdrawals
    await Withdrawal.create({
      memberId: saccoMember1.id,
      amount: 2000.00,
      date: new Date(),
      description: 'Emergency withdrawal'
    });
    logger.info('Withdrawals created');

    // Create Loan Application
    const loan = await Loan.create({
      memberId: saccoMember1.id,
      amount: 50000.00,
      interestRate: 12.5,
      status: 'approved',
      repaymentSchedule: 'Monthly installments over 12 months',
      applicationDate: new Date(),
      approvalDate: new Date(),
      repaidAmount: 0
    });
    logger.info('Loans created');

    logger.info('\n=== Seeding Complete ===');
    logger.info('Sample credentials:');
    logger.info('SuperAdmin: matthewmukasa0@gmail.com / 1100211Matt.');
    logger.info('Chairperson: chairperson@example.com / Password123!');
    logger.info('Members: alice@example.com / Password123! or bob@example.com / Password123!');
    logger.info('\nYou can now test the API with these credentials');

    await sequelize.close();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

