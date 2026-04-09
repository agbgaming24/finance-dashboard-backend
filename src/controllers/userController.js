import bcrypt from 'bcryptjs';
import UserModel from '../models/userModel.js';
import { sendSuccess, sendError, paginate, buildPaginationMeta } from '../utils/response.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { status, role } = req.query;

    const { rows, total } = await UserModel.findAll({ page, limit, offset, status, role });
    return sendSuccess(res, {
      users: rows,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch users.', 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 'Failed to fetch user.', 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await UserModel.findByEmail(email);
    if (existing) return sendError(res, 'Email already registered.', 409);

    const hashed = await bcrypt.hash(password, 10);
    const id = await UserModel.create({ name, email, password: hashed, role: 'viewer' });
    return sendSuccess(res, { id }, 'User created.', 201);
  } catch (err) {
    return sendError(res, 'Failed to create user.', 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    if (req.body.role !== undefined) {
      if (user.role !== 'viewer') {
        return sendError(res, 'Only users with viewer role can be promoted.', 400);
      }
      if (!['analyst', 'admin'].includes(req.body.role)) {
        return sendError(res, 'Role update is limited to analyst or admin.', 400);
      }
    }

    await UserModel.update(req.params.id, req.body);
    return sendSuccess(res, null, 'User updated.');
  } catch (err) {
    return sendError(res, 'Failed to update user.', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return sendError(res, 'You cannot delete your own account.', 400);
    }
    const user = await UserModel.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    await UserModel.delete(req.params.id);
    return sendSuccess(res, null, 'User deleted.');
  } catch (err) {
    return sendError(res, 'Failed to delete user.', 500);
  }
};
