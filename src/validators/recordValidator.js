import { body } from 'express-validator';

export const createRecordValidator = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number.'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required.'),
  body('date')
    .isDate()
    .withMessage('Date must be a valid date (YYYY-MM-DD).'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be under 500 characters.'),
];

export const updateRecordValidator = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number.'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense.'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty.'),
  body('date')
    .optional()
    .isDate()
    .withMessage('Date must be a valid date (YYYY-MM-DD).'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be under 500 characters.'),
];
