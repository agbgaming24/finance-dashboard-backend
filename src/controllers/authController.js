import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await UserModel.findByEmail(email);
    if (existing) return sendError(res, 'Email already registered.', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await UserModel.create({ name, email, password: hashedPassword, role: 'viewer' });

    const token = jwt.sign(
      { id, name, email, role: 'viewer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return sendSuccess(
      res,
      { id, token, role: 'viewer', name },
      'User registered successfully.',
      201
    );
  } catch (err) {
    return sendError(res, 'Registration failed.', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) return sendError(res, 'Invalid email or password.', 401);
    if (user.status === 'inactive') return sendError(res, 'Account is inactive.', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return sendSuccess(res, { token, role: user.role, name: user.name }, 'Login successful.');
  } catch (err) {
    return sendError(res, 'Login failed.', 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 'Failed to fetch profile.', 500);
  }
};
