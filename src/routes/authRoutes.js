import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import validate from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidator, validate, register);

router.post('/login', loginValidator, validate, login);

router.get('/me', verifyToken, getMe);

export default router;
