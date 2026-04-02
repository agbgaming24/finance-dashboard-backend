import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Forbidden. You do not have permission for this action.', 403);
    }
    next();
  };
};

export const adminOnly = verifyRole('admin');
export const analystOrAdmin = verifyRole('analyst', 'admin');
export const allRoles = verifyRole('viewer', 'analyst', 'admin');
