const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    next();
  };
};

// Validation schemas
const validationSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('SuperAdmin', 'Chairperson', 'Member', 'Treasurer', 'Secretary').optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional()
  }),

  createSacco: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    registrationNumber: Joi.string().required(),
    location: Joi.string().required(),
    chairpersonId: Joi.string().uuid().optional()
  }),

  updateSacco: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    registrationNumber: Joi.string().optional(),
    location: Joi.string().optional(),
    status: Joi.string().valid('pending', 'active', 'suspended').optional()
  }),

  addMember: Joi.object({
    userId: Joi.string().uuid().required(),
    shareBalance: Joi.number().min(0).default(0),
    savingsBalance: Joi.number().min(0).default(0)
  }),

  createDeposit: Joi.object({
    memberId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().optional(),
    description: Joi.string().optional()
  }),

  createWithdrawal: Joi.object({
    memberId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().optional(),
    description: Joi.string().optional()
  }),

  repayLoan: Joi.object({
    amount: Joi.number().positive().required()
  }),

  applyLoan: Joi.object({
    memberId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    interestRate: Joi.number().min(0).max(100).required(),
    repaymentSchedule: Joi.string().optional()
  }),

  approveLoan: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    approvalDate: Joi.date().optional(),
    disbursementDate: Joi.date().optional()
  }),

  registerSaccoWithChairperson: Joi.object({
    saccoDetails: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      registrationNumber: Joi.string().required(),
      location: Joi.string().required()
    }).required(),
    chairpersonDetails: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required()
    }).required()
  })
};

module.exports = { validate, validationSchemas };

