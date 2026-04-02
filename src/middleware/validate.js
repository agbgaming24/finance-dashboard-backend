import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

// Run after express-validator chains — returns 422 if any errors exist
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return sendError(res, 'Validation failed.', 422, formatted);
  }
  next();
};

export default validate;
