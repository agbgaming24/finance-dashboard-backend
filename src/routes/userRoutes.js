import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { createUserValidator, updateUserValidator } from '../validators/userValidator.js';
import validate from '../middleware/validate.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken, adminOnly);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidator, validate, createUser);
router.patch('/:id', updateUserValidator, validate, updateUser);
router.delete('/:id', deleteUser);

export default router;
