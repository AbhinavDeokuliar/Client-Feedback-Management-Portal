const { body } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must include at least one number, one uppercase letter, one lowercase letter, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['admin', 'manager', 'support', 'developer', 'qa', 'client']).withMessage('Role must be one of: admin, manager, support, developer, qa, client'),

  body('department')
    .optional()
    .isIn(['management', 'customer_support', 'development', 'quality_assurance', 'product_management', 'n/a']).withMessage('Department must be valid'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
];

/**
 * User login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must provide a valid email address'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

/**
 * Feedback validation rules
 */
const feedbackValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),

  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID format'),

  body('priority')
    .notEmpty().withMessage('Priority level is required')
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Priority must be low, medium, high, or critical'),
];

/**
 * Feedback update validation rules
 * Similar to feedbackValidation but all fields are optional for partial updates
 */
const feedbackUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),

  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID format'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Priority must be low, medium, high, or critical'),

  body('status')
    .optional()
    .isIn(['new', 'in-progress', 'resolved', 'closed', 'reopened']).withMessage('Status must be new, in-progress, resolved, closed, or reopened'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

/**
 * Category validation rules
 */
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
];

/**
 * Password reset validation rules
 */
const passwordResetValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must provide a valid email address')
];

/**
 * Password update validation rules
 */
const passwordUpdateValidation = [
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must include at least one number, one uppercase letter, one lowercase letter, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Export request validation
 */
const validateExportRequest = (req, res, next) => {
  const format = req.body.format ? req.body.format.toLowerCase() : 'xlsx';

  if (format && !['xlsx', 'csv'].includes(format)) {
    return res.status(400).json({
      success: false,
      message: "Format must be 'xlsx' or 'csv'"
    });
  }

  // Validate date range if provided
  if (req.body.startDate && !isValidDate(req.body.startDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid startDate format"
    });
  }

  if (req.body.endDate && !isValidDate(req.body.endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid endDate format"
    });
  }

  // If both dates provided, ensure start is before end
  if (req.body.startDate && req.body.endDate) {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be after endDate"
      });
    }
  }

  next();
};

/**
 * Helper function to check if a date string is valid
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  feedbackValidation,
  feedbackUpdateValidation,
  categoryValidation,
  passwordResetValidation,
  passwordUpdateValidation,
  validateExportRequest
};
