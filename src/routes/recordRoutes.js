import { Router } from 'express';
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from '../controllers/recordController.js';
import { createRecordValidator, updateRecordValidator } from '../validators/recordValidator.js';
import validate from '../middleware/validate.js';
import { verifyToken, adminOnly, analystOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

// Only analyst + admin can view records
router.get('/', analystOrAdmin, getAllRecords);
router.get('/:id', analystOrAdmin, getRecordById);

// Only admins can create, update, or delete
router.post('/', adminOnly, createRecordValidator, validate, createRecord);
router.patch('/:id', adminOnly, updateRecordValidator, validate, updateRecord);
router.delete('/:id', adminOnly, deleteRecord);

export default router;
