import { body, query, param, validationResult } from 'express-validator';
import { escape } from 'html-escaper';

export function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Validation failed',
          errors: errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
          }))
        });
      }
      next();
    },
  ];
}

// Common validation rules
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  name: body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .customSanitizer(value => escape(value)),
  
  id: param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  offset: query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
};

// Sanitization middleware
export function sanitizeInput(req, res, next) {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return escape(value.trim());
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        value[key] = sanitizeValue(value[key]);
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
}