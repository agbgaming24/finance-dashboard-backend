import { body } from 'express-validator';

export const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .optional()
    .equals('viewer')
    .withMessage('New users must be created with viewer role.'),
];

export const updateUserValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('role')
    .optional()
    .isIn(['analyst', 'admin'])
    .withMessage('Role update is limited to analyst or admin.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive.'),
];
